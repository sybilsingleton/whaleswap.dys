import{_ as f,o as r,c as d,a as t,t as n,d as S,b as u,w as b,v as p,e as y,f as _,u as k,r as x,F as q,g as R,h as v}from"./main-c5c76c6e.js";const A={emits:["swap","join","exit"],props:["pool","account"],data(){return{}},computed:{address(){var s;return(s=this.account)==null?void 0:s.bech32Address}},components:{},methods:{},created(){}},B={class:"flex"},V={class:"grow"},M={class:""},j={class:"stats shadow stats-vertical xl:stats-horizontal bg-base-200 grow w-full"},C={class:"stat"},E={class:"stat-value"},F={class:"stat-actions"},J=["disabled"],L=["disabled"],N=["disabled"],O={class:"stat"},T={class:"stat-title"},D={class:"stat-value truncate"},I={class:"stat-title"},U={class:"stat-desc text-secondary"},z={class:"stat"},H={class:"stat-title"},Q={class:"stat-value truncate"},$={class:"stat-title"},Y={class:"stat-desc text-secondary"};function W(s,e,l,c,o,a){return r(),d("div",B,[t("div",V,[t("div",M,"Pool: "+n(l.pool.pool_id),1),t("div",j,[t("div",C,[t("div",E,n(l.pool.base.denom),1),t("div",F,[t("button",{class:"btn btn-primary",onClick:e[0]||(e[0]=i=>s.$emit("swap",l.pool)),disabled:!l.account}," Swap ",8,J),t("button",{class:"btn btn-primary",onClick:e[1]||(e[1]=i=>s.$emit("join",l.pool)),disabled:!l.account}," Join Pool ",8,L),t("button",{class:"btn btn-primary",onClick:e[2]||(e[2]=i=>s.$emit("exit",l.pool)),disabled:!l.account}," Exit Pool ",8,N)])]),t("div",O,[t("div",T,"1 "+n(l.pool.base.denom)+" ≃",1),t("div",D,n(l.pool.base.price.toPrecision(5)),1),t("div",I,n(l.pool.quote.denom),1),t("div",U," Pool liquidity: "+n(l.pool.quote.balance)+" "+n(l.pool.quote.denom),1)]),t("div",z,[t("div",H,"1 "+n(l.pool.quote.denom)+" ≃",1),t("div",Q,n(l.pool.quote.price.toPrecision(5)),1),t("div",$,n(l.pool.base.denom),1),t("div",Y," Pool liquidity: "+n(l.pool.base.balance)+" "+n(l.pool.base.denom),1)])])])])}const G=f(A,[["render",W]]);function K(s,e,l){const c=s*e,o=s+l,a=c/o,i=Math.floor(e-a);return{newBalanceA:o,newBalanceB:a,swapOutB:i}}function X(s,e,l){const c=s*e,o=e-l,a=c/o,i=Math.ceil(a-s);return{newBalanceA:a,newBalanceB:o,swapInA:i}}function Z(s,e){s={...s};const[l,c]=e.split(" "),o=Number(l),a=c===s.base.denom,{newBalanceA:i,newBalanceB:w,swapOutB:g}=K(a?s.base.balance:s.quote.balance,a?s.quote.balance:s.base.balance,o);if(a?(s.base.balance=i,s.quote.balance=w):(s.quote.balance=i,s.base.balance=w),g<=0)throw"Invalid swap amount";if(s.base.balance<=0||s.quote.balance<=0)throw"Swap size too large";return{output_amount:g,output_denom:a?s.quote.denom:s.base.denom}}function tt(s,e,l){const c=l===s.base.denom,{newBalanceA:o,newBalanceB:a,swapInA:i}=X(c?s.base.balance:s.quote.balance,c?s.quote.balance:s.base.balance,e);if(c?(s.base.balance=o,s.quote.balance=a):(s.quote.balance=o,s.base.balance=a),i<=0)throw"Invalid swap amount";if(s.base.balance<=0||s.quote.balance<=0)throw"Swap size too large";return`${i} ${c?s.base.denom:s.quote.denom}`}const st={props:["pool","account"],data(){return{pool_ids:this.pool.pool_id,coins:"",minimum_swap_out_amount:"",swap_out_denom:this.pool.quote.denom,sim:"",slipagePct:"",slippageAmount:"",error:"",inFlight:!1,txResult:null}},computed:{address:function(){var s;return(s=this.account)==null?void 0:s.bech32Address},baseAmount:{set(s){if(this.error="",this.swap_out_denom=this.pool.quote.denom,s==="")this.minimum_swap_out_amount="";else{let e=JSON.parse(JSON.stringify(this.pool));try{let l=this.simulateSwap(e,s+" "+this.pool.base.denom);l.output_amount>0&&(this.minimum_swap_out_amount=l.output_amount)}catch(l){console.log(l),this.error=l.toString(),this.minimum_swap_out_amount=""}}this.coins=s+" "+this.pool.base.denom,this.swap_out_denom=this.pool.quote.denom},get(){return this.coins.split(" ")[0]}},quoteAmount:{set(s){if(this.error="",s==="")this.coins="";else{let e=JSON.parse(JSON.stringify(this.pool));try{let l=this.simulateSwapInverse(e,s,this.pool.base.denom);this.coins=l}catch(l){this.coins="",this.error=l.toString(),console.log(l)}}this.minimum_swap_out_amount=s,this.swap_out_denom=this.pool.quote.denom},get(){return this.minimum_swap_out_amount}}},component:{},methods:{simulateSwap:Z,simulateSwapInverse:tt,swapBaseQuote(){[this.pool.base,this.pool.quote]=[this.pool.quote,this.pool.base],this.swap_out_denom=this.pool.quote.denom,this.baseAmount="",this.quoteAmount=""},async swap(s,e,l,c){this.inFlight=!0,this.error="";let o="dyson/sendMsgRun",a={value:{creator:this.address,address:"whaleswap.dys",function_name:"swap",kwargs:JSON.stringify({pool_ids:s,minimum_swap_out_amount:l,swap_out_denom:c}),coins:e,nfts:""},fee:[{amount:"223",denom:"dys"}],gas:"2230000"};try{this.txResult=await S(o,a),console.log(this.txResult)}catch(i){console.log(i.toString()),this.error=i.toString()}this.inFlight=!1}},created(){this.swapBaseQuote()}},ot={key:0},et={key:0,class:"flex flex-col w-full border-opacity-50"},lt=t("h3",{class:"font-bold text-lg error"},"Error!",-1),nt={key:1,class:"flex flex-col w-full border-opacity-50"},at=t("h3",{class:"font-bold text-lg success"},"Success!",-1),it=t("br",null,null,-1),ct={key:1,class:"flex flex-col w-full border-opacity-50"},rt={class:"text-2xl font-bold text-base-content"},dt={class:"grid flex-grow card"},ut={class:"form-control"},ht=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Send Exactly ")],-1),_t={class:"label"},mt={class:"text-lg label-text"},bt={class:"divider"},pt={class:"grid flex-grow card"},ft={class:"form-control"},wt=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Receive at least")],-1),gt={class:"label"},xt={class:"text-lg label-text"},vt={class:"py-4 text-red-500"},yt={key:0,class:"py-4"},St=["disabled"];function qt(s,e,l,c,o,a){return o.txResult?(r(),d("div",ot,[o.txResult.error?(r(),d("div",et,[lt,t("pre",null,n(o.txResult.error),1)])):(r(),d("div",nt,[at,t("p",null,[u(" You received: "+n(o.txResult.result.output_amount)+" "+n(o.txResult.result.output_denom),1),it,u(" Transaction Hash: "+n(o.txResult.transactionHash),1)])]))])):(r(),d("div",ct,[t("h1",rt,"Swap Pool "+n(l.pool.pool_id),1),t("div",dt,[t("div",ut,[ht,b(t("input",{type:"text",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[0]||(e[0]=i=>a.baseAmount=i)},null,512),[[p,a.baseAmount]]),t("label",_t,[t("span",mt,n(l.pool.base.denom),1)])])]),t("div",bt,[t("button",{class:"btn",onClick:e[1]||(e[1]=y((...i)=>a.swapBaseQuote&&a.swapBaseQuote(...i),["prevent"]))},"⇅")]),t("div",pt,[t("div",ft,[wt,b(t("input",{type:"text",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[2]||(e[2]=i=>a.quoteAmount=i)},null,512),[[p,a.quoteAmount]]),t("label",gt,[t("span",xt,n(l.pool.quote.denom),1)])])]),t("p",vt,n(o.error),1),!o.error&&o.minimum_swap_out_amount&&o.coins?(r(),d("p",yt,[u(" Send exactly "),t("strong",null,n(o.coins),1),u(" and receive at least "),t("strong",null,n(o.minimum_swap_out_amount)+" "+n(o.swap_out_denom),1)])):_("",!0),t("button",{class:"btn btn-lg btn-block btn-primary",onClick:e[3]||(e[3]=y(i=>a.swap(l.pool.pool_id,o.coins,o.minimum_swap_out_amount,o.swap_out_denom),["prevent"])),disabled:!a.address||o.inFlight}," Swap Coins ",8,St)]))}const Pt=f(st,[["render",qt]]),kt={props:{pool:Object,account:Object},data(){return{baseValue:"",quoteValue:"",txResult:null,inFlight:!1,error:null,updating:null,availableShares:"Loading..."}},computed:{sharesDenom:function(){return`pool-${this.pool.pool_id}.whaleswap.dys`},address:function(){var s;return(s=this.account)==null?void 0:s.bech32Address},baseAmount:{get(){return this.baseValue},set(s){this.updating!=="quote"&&(this.updating="base",this.baseValue=s,this.pool.base.balance&&this.pool.quote.balance&&(this.quoteValue=Math.ceil(s*this.pool.quote.balance/this.pool.base.balance)),this.updating=null)}},quoteAmount:{get(){return this.quoteValue},set(s){this.updating!=="base"&&(this.updating="quote",this.quoteValue=s,this.pool.base.balance&&this.pool.quote.balance&&(this.baseValue=Math.ceil(s*this.pool.base.balance/this.pool.quote.balance)),this.updating=null)}}},methods:{async fetchPoolShares(){console.log("fetching pool shares",this.sharesDenom);let s="cosmos.bank.v1beta1/QueryBalance",e={query:{denom:this.sharesDenom},params:{address:this.address}};return(await dysonVueStore.dispatch(s,e)).balance.amount},async addLiquidity(){this.inFlight=!0,this.error=null;const s="dyson/sendMsgRun",e={value:{creator:this.address,address:"whaleswap.dys",function_name:"join_pool",kwargs:JSON.stringify({pool_id:this.pool.pool_id}),coins:`${this.baseAmount} ${this.pool.base.denom}, ${this.quoteAmount} ${this.pool.quote.denom}`},fee:[{amount:"223",denom:"dys"}],gas:"2230000"};console.log("data",e);try{this.txResult=await S(s,e)}catch(l){this.error=l.toString()}finally{this.inFlight=!1}}},created:async function(){this.availableShares=await this.fetchPoolShares()},watch:{pool:{handler:async function(s){console.log("pool changed",s.pool_id),this.availableShares=await this.fetchPoolShares()},deep:!0}}},Rt={key:0},At={key:0,class:"flex flex-col w-full border-opacity-50"},Bt=t("h3",{class:"font-bold text-lg error"},"Error!",-1),Vt={key:1,class:"flex flex-col w-full border-opacity-50"},Mt=t("h3",{class:"font-bold text-lg success"},"Success!",-1),jt={key:0},Ct={key:1,class:"flex flex-col w-full border-opacity-50"},Et=t("h1",{class:"text-2xl font-bold"},"Join Pool",-1),Ft={class:"grid flex-grow card"},Jt={class:"alert"},Lt={class:""},Nt={class:""},Ot={class:"form-control"},Tt=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Add Exactly")],-1),Dt={class:"label"},It={class:"text-lg"},Ut=t("div",{class:"divider"},"And",-1),zt={class:"grid flex-grow card"},Ht={class:"form-control"},Qt=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Add Exactly")],-1),$t={class:"label"},Yt={class:"text-lg"},Wt={key:0,class:"py-4 text-red-500"},Gt={key:1,class:"py-4"},Kt=["disabled"];function Xt(s,e,l,c,o,a){return o.txResult?(r(),d("div",Rt,[o.error?(r(),d("div",At,[Bt,t("pre",null,n(o.error),1)])):(r(),d("div",Vt,[Mt,t("p",null,"Transaction Hash: "+n(o.txResult.transactionHash),1),t("p",null,"Shares Received: "+n(o.txResult.result.shares)+" "+n(o.txResult.result.share_denom),1),o.txResult.result.refund.length>0?(r(),d("p",jt,"Refund Amount: "+n(o.txResult.result.refund[0].amount)+" "+n(o.txResult.result.refund[0].denom),1)):_("",!0)]))])):(r(),d("div",Ct,[Et,t("div",Ft,[t("div",Jt,[t("span",Lt," Total shares: "+n(l.pool.total_shares),1),t("span",Nt," Your shares: "+n(o.availableShares)+" ("+n(o.availableShares/l.pool.total_shares*100)+"%)",1)]),t("div",Ot,[Tt,b(t("input",{type:"number",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[0]||(e[0]=i=>a.baseAmount=i)},null,512),[[p,a.baseAmount]]),t("label",Dt,[t("span",It,n(l.pool.base.denom),1)])])]),Ut,t("div",zt,[t("div",Ht,[Qt,b(t("input",{type:"number",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[1]||(e[1]=i=>a.quoteAmount=i)},null,512),[[p,a.quoteAmount]]),t("label",$t,[t("span",Yt,n(l.pool.quote.denom),1)])])]),o.error?(r(),d("p",Wt,n(o.error),1)):_("",!0),a.baseAmount&&a.quoteAmount?(r(),d("p",Gt,[u(" You will add exactly: "),t("strong",null,n(a.baseAmount)+" "+n(l.pool.base.denom),1),u(" and "),t("strong",null,n(a.quoteAmount)+" "+n(l.pool.quote.denom),1),u(" to the pool ")])):_("",!0),t("button",{class:"btn btn-lg btn-block btn-primary",onClick:e[2]||(e[2]=y((...i)=>a.addLiquidity&&a.addLiquidity(...i),["prevent"])),disabled:!a.address||o.inFlight}," Add Liquidity ",8,Kt)]))}const Zt=f(kt,[["render",Xt]]),ts={props:["pool","account"],data(){return{coins:"",error:"",inFlight:!1,txResult:null,availableShares:"Loading..."}},computed:{sharesDenom:function(){return`pool-${this.pool.pool_id}.whaleswap.dys`},address:function(){var s;return(s=this.account)==null?void 0:s.bech32Address}},methods:{async fetchPoolShares(){console.log("fetching pool shares",this.sharesDenom);let s="cosmos.bank.v1beta1/QueryBalance",e={query:{denom:this.sharesDenom},params:{address:this.address}};return(await dysonVueStore.dispatch(s,e)).balance.amount},async exitPool(s,e){this.inFlight=!0,this.error="";let l="dyson/sendMsgRun",c={value:{creator:this.address,address:"whaleswap.dys",function_name:"exit_pool",kwargs:JSON.stringify({pool_id:s}),coins:e+this.sharesDenom},fee:[{amount:"223",denom:"dys"}],gas:"2230000"};try{console.log(c),this.txResult=await S(l,c),console.log(this.txResult)}catch(o){console.log(o.toString()),this.error=o.toString()}this.inFlight=!1}},created:async function(){this.availableShares=await this.fetchPoolShares()},watch:{pool:{handler:async function(s){console.log("pool changed",s.pool_id),this.availableShares=await this.fetchPoolShares()},deep:!0},account:{handler:async function(s){console.log("account changed",s),this.availableShares="Loading...",this.availableShares=await this.fetchPoolShares()},deep:!0}}},ss={key:0},os={key:0,class:"flex flex-col w-full border-opacity-50"},es=t("h3",{class:"font-bold text-lg error"},"Error!",-1),ls={key:1,class:"flex flex-col w-full border-opacity-50"},ns=t("h3",{class:"font-bold text-lg success"},"Success!",-1),as=t("br",null,null,-1),is={key:1,class:"flex flex-col w-full border-opacity-50"},cs=t("h1",{class:"text-2xl font-bold text-base-content"},"Exit Pool",-1),rs={class:"grid flex-grow card"},ds={class:"alert"},us={class:""},hs={class:""},_s={class:"form-control"},ms=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Send Exactly ")],-1),bs={class:"label"},ps={class:"label-text text-lg"},fs=["disabled"],ws={class:"py-4 text-red-500"};function gs(s,e,l,c,o,a){return o.txResult?(r(),d("div",ss,[o.txResult.error?(r(),d("div",os,[es,t("pre",null,n(o.txResult.error),1)])):(r(),d("div",ls,[ns,t("p",null,"Transaction Hash: "+n(o.txResult.transactionHash),1),t("p",null,[u(" Sent: "+n(o.coins)+" "+n(a.sharesDenom),1),as,u(" You Recieved: "+n(o.txResult.result[0].amount)+" "+n(o.txResult.result[0].denom)+" and "+n(o.txResult.result[1].amount)+" "+n(o.txResult.result[1].denom),1)])]))])):(r(),d("div",is,[cs,t("div",rs,[t("div",ds,[t("span",us," Total shares: "+n(l.pool.total_shares),1),t("span",hs," Your shares: "+n(o.availableShares)+" ("+n(o.availableShares/l.pool.total_shares*100)+"%)",1)]),t("div",_s,[ms,b(t("input",{type:"text",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[0]||(e[0]=i=>o.coins=i)},null,512),[[p,o.coins]]),t("label",bs,[t("span",ps,n(a.sharesDenom),1)])])]),t("button",{class:"btn btn-lg btn-block btn-primary",onClick:e[1]||(e[1]=y(i=>a.exitPool(l.pool.pool_id,o.coins),["prevent"])),disabled:!a.address||o.inFlight}," Sign Tx ",8,fs),t("p",ws,n(o.error),1)]))}const xs=f(ts,[["render",gs]]),m=k(),vs={props:["account"],data(){return{swapPool:null,joinPool:null,exitPool:null,bgUrl:new URL("/assets/swap-bg-c6360bc5.jpg",self.location).href}},computed:{pools(){return Object.values(m.pools).sort((e,l)=>{const c=e.quote.balance,o=l.quote.balance;return c>o?-1:c<o?1:0})},numPools(){return m.numPools},numTrades(){return m.numTrades},tvl(){return m.tvl}},methods:{swap(s){this.swapPool=s,this.window.swapModal.showModal()},join(s){this.joinPool=s,this.window.joinModal.showModal()},exit(s){this.exitPool=s,this.window.exitModal.showModal()}},components:{PoolListItem:G,Swap:Pt,JoinPool:Zt,ExitPool:xs},async created(){await m.setupWebsocket()}},ys={class:"py-10 lg:pl-72"},Ss={class:"px-4 sm:px-6 lg:px-8 grid gap-4 grid-cols-1"},qs={class:"stats lg:stats-horizontal"},Ps={class:"stat"},ks=t("div",{class:"stat-title"},"Number of Pools",-1),Rs={class:"stat-value"},As={class:"stat"},Bs=t("div",{class:"stat-title"},"Number of Trades",-1),Vs={class:"stat-value"},Ms={class:"stat"},js=t("div",{class:"stat-title"},"Total Value",-1),Cs={class:"stat-value"},Es={id:"swapModal",class:"modal"},Fs={method:"dialog",class:"modal-box"},Js={method:"dialog",class:"modal-backdrop"},Ls={id:"joinModal",class:"modal"},Ns={method:"dialog",class:"modal-box"},Os={method:"dialog",class:"modal-backdrop"},Ts={id:"exitModal",class:"modal"},Ds={method:"dialog",class:"modal-box w-6/12"},Is={method:"dialog",class:"modal-backdrop"};function Us(s,e,l,c,o,a){const i=x("PoolListItem"),w=x("Swap"),g=x("JoinPool"),P=x("ExitPool");return r(),d(q,null,[t("main",ys,[t("div",Ss,[t("div",qs,[t("div",Ps,[ks,t("div",Rs,n(a.numPools),1)]),t("div",As,[Bs,t("div",Vs,n(a.numTrades),1)]),t("div",Ms,[js,t("div",Cs,n(a.tvl)+" dys",1)])]),(r(!0),d(q,null,R(a.pools,h=>(r(),v(i,{pool:h,key:h,account:l.account,onSwap:a.swap,onJoin:a.join,onExit:a.exit},null,8,["pool","account","onSwap","onJoin","onExit"]))),128))])]),t("dialog",Es,[t("form",Fs,[t("button",{class:"btn btn-sm btn-circle btn-ghost absolute right-2 top-2",onClick:e[0]||(e[0]=h=>o.swapPool=null)}," ✕ "),o.swapPool?(r(),v(w,{key:0,pool:{...o.swapPool},account:l.account},null,8,["pool","account"])):_("",!0)]),t("form",Js,[t("button",{onClick:e[1]||(e[1]=h=>o.swapPool=null)},"close")])]),t("dialog",Ls,[t("form",Ns,[t("button",{class:"btn btn-sm btn-circle btn-ghost absolute right-2 top-2",onClick:e[2]||(e[2]=h=>a.join=null)}," ✕ "),o.joinPool?(r(),v(g,{key:0,pool:o.joinPool,account:l.account},null,8,["pool","account"])):_("",!0)]),t("form",Os,[t("button",{onClick:e[3]||(e[3]=h=>o.joinPool=null)})])]),t("dialog",Ts,[t("form",Ds,[t("button",{class:"btn btn-sm btn-circle btn-ghost absolute right-2 top-2",onClick:e[4]||(e[4]=h=>o.exitPool=null)}," ✕ "),o.exitPool?(r(),v(P,{pool:o.exitPool,account:l.account,key:o.exitPool.pool_id},null,8,["pool","account"])):_("",!0)]),t("form",Is,[t("button",{onClick:e[5]||(e[5]=h=>o.exitPool=null)})])])],64)}const Hs=f(vs,[["render",Us]]);export{Hs as default};
