"""
WhaleSwap.dys - Minimal AMM on Dyson Protocol

Website:  https://whaleswap.dysonprotocol.com/
Twitter:  https://twitter.com/whaleswap_dys
GitHub:   https://github.com/sybilsingleton/whaleswap.dys
"""

import json
import math
from decimal import Decimal
from string import Template

from dys import (
    BLOCK_INFO,
    CALLER,
    SCRIPT_ADDRESS,
    _chain,
    get_coins_sent,
    get_nfts_sent,
    emit_event,
)

DYS_NAME = "whaleswap.dys"


def _get_pool_index(pool_id: int) -> str:
    return f"{SCRIPT_ADDRESS}/pools/{int(pool_id):015}"


def _get_next_pool_id():
    index = f"{SCRIPT_ADDRESS}/next_pool_id"
    res = _chain("dyson/QueryStorage", index=index)
    if res["error"]:
        next_id = 1
    else:
        next_id = int(res["result"]["storage"]["data"])
    result = _chain(
        "dyson/sendMsgUpdateStorage",
        creator=SCRIPT_ADDRESS,
        index=index,
        data=str(next_id + 1),
        force=True,
    )
    assert result["error"] is None, f"Error updating storage: {result['error']}"
    return next_id


def get_pool(pool_id: int):
    result = _chain("dyson/QueryStorage", index=_get_pool_index(pool_id))
    assert result["error"] is None, f"Error getting pool: {result['error']}"
    pool = json.loads(
        result["result"]["storage"]["data"],
        parse_float=Decimal,
        parse_int=Decimal,
    )
    return pool


def get_shares_denom(pool_id: int):
    return f"pool-{pool_id}.{DYS_NAME}"


def create_pool():
    coins = get_coins_sent()
    assert len(coins) == 2, "Both base and quote (DYS) must be sent to create the pool"

    # set base and quote coins, the quote is the denominated DYS
    if coins[0]["denom"] == "dys":
        base_coin = coins[1]
        quote_coin = coins[0]
    elif coins[1]["denom"] == "dys":
        base_coin = coins[0]
        quote_coin = coins[1]
    else:
        raise Exception("No DYS coins sent, cannot create pool.")

    pool_id = _get_next_pool_id()
    pool_index = _get_pool_index(pool_id)

    initial_shares = Decimal("100000")
    shares_denom = get_shares_denom(pool_id)
    pool = {
        "pool_id": pool_id,
        "base": {
            "denom": base_coin["denom"],
            "balance": Decimal(base_coin["amount"]),
            "lent": 0,
            "collateral": 0,
        },
        "quote": {
            "denom": quote_coin["denom"],
            "balance": Decimal(quote_coin["amount"]),
            "lent": 0,
            "collateral": 0,
        },
        "total_shares": initial_shares,
        "shares_denom": shares_denom,
        "block_height": BLOCK_INFO.height,
        "created": BLOCK_INFO.time,
    }
    print("emit", emit_event(key="poolupdate", value=str(pool_id)))
    result = _chain(
        "dyson/sendMsgCreateStorage",
        creator=SCRIPT_ADDRESS,
        index=pool_index,
        data=json.dumps(pool),
    )
    assert result["error"] is None, f"Error creating storage: {result['error']}"

    result = _chain(
        "names/sendMsgMintCoins",
        owner=SCRIPT_ADDRESS,
        amount=f"{initial_shares} {shares_denom}",
    )
    assert result["error"] is None, f"Error minting coins: {result['error']}"

    result = _chain(
        "cosmos.bank.v1beta1/sendMsgSend",
        from_address=SCRIPT_ADDRESS,
        to_address=CALLER,
        amount=[{"amount": str(initial_shares), "denom": shares_denom}],
    )
    assert result["error"] is None, f"Error sending coins: {result['error']}"

    return pool


def join_pool(pool_id: str):
    coins = get_coins_sent()
    assert len(coins) == 2, "Both base and quote (DYS) must be sent to join the pool"

    # set base and quote coins, the quote is the denominated DYS
    if coins[0]["denom"] == "dys":
        base_coin = coins[1]
        quote_coin = coins[0]
    elif coins[1]["denom"] == "dys":
        base_coin = coins[0]
        quote_coin = coins[1]
    else:
        raise Exception("No DYS coins sent, cannot join pool.")

    pool = get_pool(pool_id)

    sent_base_amount = Decimal(base_coin["amount"])
    sent_quote_amount = Decimal(quote_coin["amount"])

    pool_base = pool["base"]
    pool_quote = pool["quote"]

    correct_base_amount = math.ceil(
        (sent_quote_amount * Decimal(pool_base["balance"])) / (pool_quote["balance"])
    )
    correct_quote_amount = math.ceil(
        (sent_base_amount * Decimal(pool_quote["balance"])) / (pool_base["balance"])
    )
    refund = []
    if sent_base_amount > correct_base_amount:
        refund_amount = sent_base_amount - correct_base_amount
        refund_denom = base_coin["denom"]

        result = _chain(
            "cosmos.bank.v1beta1/sendMsgSend",
            from_address=SCRIPT_ADDRESS,
            to_address=CALLER,
            amount=[{"amount": str(refund_amount), "denom": refund_denom}],
        )
        assert result["error"] is None, f"Error sending refund: {result['error']}"
        refund += [{"amount": refund_amount, "denom": refund_denom}]

    if sent_quote_amount > correct_quote_amount:
        refund_amount = sent_quote_amount - correct_quote_amount
        refund_denom = quote_coin["denom"]

        result = _chain(
            "cosmos.bank.v1beta1/sendMsgSend",
            from_address=SCRIPT_ADDRESS,
            to_address=CALLER,
            amount=[{"amount": str(refund_amount), "denom": refund_denom}],
        )
        assert result["error"] is None, f"Error sending refund: {result['error']}"
        refund += [{"amount": refund_amount, "denom": refund_denom}]

    # update pool balances
    pool["base"]["balance"] = (pool_base["balance"]) + sent_base_amount
    pool["quote"]["balance"] = (pool_quote["balance"]) + sent_quote_amount
    pool["updated"] = BLOCK_INFO.time
    # calculate shares
    base_shares = (sent_base_amount * pool["total_shares"]) // pool_base["balance"]
    quote_shares = (sent_quote_amount * pool["total_shares"]) // pool_quote["balance"]

    # in case there is a rounding difference, give the smaller share amount
    shares = min(base_shares, quote_shares)

    pool_index = _get_pool_index(pool_id)
    shares_denom = get_shares_denom(pool_id)

    result = _chain(
        "names/sendMsgMintCoins",
        owner=SCRIPT_ADDRESS,
        amount=f"{shares} {shares_denom}",
    )
    assert result["error"] is None, f"Error minting shares: {result['error']}"
    pool["total_shares"] = Decimal(pool["total_shares"]) + shares
    result = _chain(
        "cosmos.bank.v1beta1/sendMsgSend",
        from_address=SCRIPT_ADDRESS,
        to_address=CALLER,
        amount=[{"amount": str(shares), "denom": shares_denom}],
    )
    assert result["error"] is None, f"Error sending shares: {result['error']}"
    print("emit", emit_event(key="poolupdate", value=str(pool_id)))

    result = _chain(
        "dyson/sendMsgUpdateStorage",
        creator=SCRIPT_ADDRESS,
        index=pool_index,
        data=json.dumps(pool),
    )
    assert result["error"] is None, f"Error updating pool torage {result['error']}"

    # pool_id, shares, refunded amount and denom
    return {
        "pool_id": pool_id,
        "shares": shares,
        "share_denom": shares_denom,
        "refund": refund,
    }


def exit_pool(pool_id: str):
    coins = get_coins_sent()
    assert len(coins) == 1, "Only the shares denom must be sent to exit the pool"

    shares_denom = coins[0]["denom"]
    sent_shares_amount = Decimal(coins[0]["amount"])

    needed_denom = get_shares_denom(pool_id)
    assert (
        shares_denom == needed_denom
    ), f"Invalid shares denom, sent [{shares_denom}] needed [{needed_denom}] "

    pool = get_pool(pool_id)

    result = _chain("cosmos.bank.v1beta1/QuerySupplyOf", denom=shares_denom)
    assert result["error"] is None, f"Error getting total shares: {result['error']}"
    total_shares = result["result"]["amount"]
    total_shares_amount = Decimal(total_shares["amount"])

    # assert the total shores matches the pool total shares .
    # this shouldn't happen.
    assert (
        total_shares_amount == pool["total_shares"]
    ), f"Total shares mismatch, pool {pool['total_shares']} != total {total_shares_amount}"

    base_amount = (
        sent_shares_amount * Decimal(pool["base"]["balance"])
    ) // total_shares_amount
    quote_amount = (
        sent_shares_amount * Decimal(pool["quote"]["balance"])
    ) // total_shares_amount

    result = _chain(
        "names/sendMsgBurnCoins",
        owner=SCRIPT_ADDRESS,
        amount=f"{sent_shares_amount} {shares_denom}",
    )
    assert result["error"] is None, f"Error burning shares: {result['error']}"
    pool["total_shares"] = Decimal(pool["total_shares"]) - sent_shares_amount

    # update the base and denom on the pool
    pool["base"]["balance"] = Decimal(pool["base"]["balance"]) - base_amount
    pool["quote"]["balance"] = Decimal(pool["quote"]["balance"]) - quote_amount
    pool["updated"] = BLOCK_INFO.time

    amount = []

    if base_amount:
        amount += [
            {"amount": str(base_amount), "denom": pool["base"]["denom"]},
        ]
    if quote_amount:
        amount += [
            {"amount": str(quote_amount), "denom": pool["quote"]["denom"]},
        ]

    if not quote_amount and not base_amount:
        raise Exception(
            f"Shares [{sent_shares_amount} {shares_denom}] value to small to exchange"
        )
    amount = sorted(
        amount,
        key=lambda x: x["denom"],
    )
    result = _chain(
        "cosmos.bank.v1beta1/sendMsgSend",
        from_address=SCRIPT_ADDRESS,
        to_address=CALLER,
        amount=amount,
    )
    assert result["error"] is None, f"Error sending coins: {result['error']} {coins}"
    print("emit", emit_event(key="poolupdate", value=str(pool_id)))
    result = _chain(
        "dyson/sendMsgUpdateStorage",
        creator=SCRIPT_ADDRESS,
        index=_get_pool_index(pool_id),
        data=json.dumps(pool),
    )
    assert (
        result["error"] is None
    ), f"Error updating updating storage: {result['error']}"

    return amount


def swap(pool_ids: str, minimum_swap_out_amount: int, swap_out_denom: str):
    coins = get_coins_sent()
    assert len(coins) == 1, "One and only one coin denom must be sent for swapping"

    pool_ids = str(pool_ids)
    minimum_swap_out_amount = Decimal(minimum_swap_out_amount)
    input_amount = Decimal(coins[0]["amount"])
    input_denom = coins[0]["denom"]

    for pool_id in pool_ids.split():
        pool = get_pool(pool_id)

        K = pool["base"]["balance"] * pool["quote"]["balance"]

        if input_denom == pool["base"]["denom"]:
            pool["base"]["balance"] += input_amount
            output_amount = math.floor(
                pool["quote"]["balance"] - (K / pool["base"]["balance"])
            )
            assert output_amount, "Swap size too small"
            pool["quote"]["balance"] -= output_amount
            assert pool["quote"]["balance"] > 0, "Swap size too large"
            output_denom = pool["quote"]["denom"]
        elif input_denom == pool["quote"]["denom"]:
            pool["quote"]["balance"] += input_amount
            output_amount = math.floor(
                pool["base"]["balance"] - (K / pool["quote"]["balance"])
            )
            assert output_amount, "Swap size too small"
            pool["base"]["balance"] -= output_amount
            assert pool["base"]["balance"] > 0, "Swap size too large"
            output_denom = pool["base"]["denom"]
        else:
            raise Exception(
                f'input denom must be one of : [{pool["base"]["denom"]}, {pool["quote"]["denom"]}]'
            )
        input_denom = output_denom
        input_amount = output_amount
        pool["updated"] = BLOCK_INFO.time
        pool["num_trades"] = 1 + pool.get("num_trades", 0)

        print("emit", emit_event(key="poolupdate", value=str(pool_id)))
        result = _chain(
            "dyson/sendMsgUpdateStorage",
            creator=SCRIPT_ADDRESS,
            index=_get_pool_index(pool_id),
            data=json.dumps(pool),
        )
        assert (
            result["error"] is None
        ), f"Error updating updating storage: {result['error']}"

    if output_amount < minimum_swap_out_amount:
        raise Exception(
            f"Slippage occured, minimum output amount not reached: {output_amount} {output_denom} < {minimum_swap_out_amount} {output_denom}"
        )
    if swap_out_denom != output_denom:
        raise Exception(
            f"Output denom doesn't match, wanted: {swap_out_denom} got: {output_denom}"
        )

    result = _chain(
        "cosmos.bank.v1beta1/sendMsgSend",
        from_address=SCRIPT_ADDRESS,
        to_address=CALLER,
        amount=[{"amount": str(output_amount), "denom": output_denom}],
    )
    assert result["error"] is None, f"Error sending coins: {result['error']}"
    return {"output_amount": output_amount, "output_denom": output_denom}


DEFAULT_VERSION = "v1.0.0"


def parse_cookies(cookie_str):
    cookies = {}
    for item in cookie_str.split("; "):
        if "=" in item:
            key, value = item.split("=", 1)
            cookies[key] = value
    return cookies


def parse_qs(qs):
    parameters = {}
    for item in qs.split("&"):
        if "=" in item:
            key, value = item.split("=", 1)
            parameters[key] = value
    return parameters


def wsgi(environ, start_response):
    # parse query string and cookies
    parameters = parse_qs(environ.get("QUERY_STRING", ""))
    cookies = parse_cookies(environ.get("HTTP_COOKIE", ""))

    # get the version from the query string, cookie, or default
    version = parameters.get("version", cookies.get("version", DEFAULT_VERSION))
    headers = [
        ("Content-type", "text/html; charset=UTF-8"),
        ("Set-Cookie", f"version={version}; Path=/; HttpOnly"),
    ]

    path_info = environ.get("PATH_INFO", "")
    if path_info.startswith("/assets/"):
        status = "302 Found"
        headers += [
            (
                "Location",
                f"https://cdn.jsdelivr.net/gh/sybilsingleton/whaleswap.dys@{version}/dist/assets/"
                + path_info[len("/assets/") :],
            ),
        ]
        start_response(status, headers)
        return []

    status = "200 OK"

    # Prepare the JavaScript code for fetching the manifest file
    manifest_url = f"https://cdn.jsdelivr.net/gh/sybilsingleton/whaleswap.dys@{version}/dist/manifest.json"
    js_code = f"""
    <script>
        document.addEventListener('DOMContentLoaded', (event) => {{
            fetch('{manifest_url}')
                .then(response => response.json())
                .then(data => {{
                    let mainJS = 'https://cdn.jsdelivr.net/gh/sybilsingleton/whaleswap.dys@{version}/dist/' + data["src/main.js"]["file"];
                    let mainCSS = 'https://cdn.jsdelivr.net/gh/sybilsingleton/whaleswap.dys@{version}/dist/' + data["src/main.css"]["file"];

                    // Set sources
                    document.querySelector('link[rel="stylesheet"]').href = mainCSS;
                    
                    // Create script tag dynamically
                    let script = document.createElement('script');
                    script.type = 'module';
                    script.src = mainJS;
                    document.head.appendChild(script);
                }});
        }});
    </script>
    """

    html_markup = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WhaleSwap.dys</title>
    <script src="/_/dyson.js"></script>
    <script type="module" src=""></script>
    <link rel="stylesheet" href="">
  </head>
  <body class="container mx-auto" id="app">
  </body>
    {js_code}
</html>"""

    start_response(status, headers)

    return [html_markup.encode()]
