import{_ as p,o as c,c as d,a as t,t as n,d as v,b as u,w as m,v as b,e as y,f as _,u as k,r as w,F as S,g as R,h as g}from"./main-cade78ee.js";const A={emits:["swap","join","exit"],props:["pool","account"],data(){return{}},computed:{address(){var o;return(o=this.account)==null?void 0:o.bech32Address}},components:{},methods:{},created(){}},B={class:"card"},j={class:"card-body sm:px-8 px-0 py-4"},M={class:"card-title"},V={class:"stats shadow stats-vertical lg:stats-horizontal bg-base-200"},C={class:"stat"},E={class:"stat-value"},F={class:"stat-actions justify-end"},J={class:"join"},D=["disabled"],O=["disabled"],I=["disabled"],L={class:"stat"},N={class:"stat-title"},T={class:"stat-value truncate"},H={class:"stat-title"},Q={class:"stat-desc text-secondary"},z={class:"stat"},U={class:"stat-title"},Y={class:"stat-value truncate"},W={class:"stat-title"},G={class:"stat-desc text-secondary"};function K(o,e,l,r,s,a){return c(),d("div",B,[t("div",j,[t("div",M,"Pool: "+n(l.pool.pool_id),1),t("div",V,[t("div",C,[t("div",E,n(l.pool.base.denom),1),t("div",F,[t("div",J,[t("button",{class:"btn btn-primary join-item",onClick:e[0]||(e[0]=i=>o.$emit("swap",l.pool)),disabled:!l.account}," Swap ",8,D),t("button",{class:"btn btn-primary join-item",onClick:e[1]||(e[1]=i=>o.$emit("join",l.pool)),disabled:!l.account}," Join Pool ",8,O),t("button",{class:"btn btn-primary join-item",onClick:e[2]||(e[2]=i=>o.$emit("exit",l.pool)),disabled:!l.account}," Exit Pool ",8,I)])])]),t("div",L,[t("div",N,"1 "+n(l.pool.base.denom)+" ≃",1),t("div",T,n(l.pool.base.price.toPrecision(5)),1),t("div",H,n(l.pool.quote.denom),1),t("div",Q," Pool liquidity: "+n(l.pool.quote.balance)+" "+n(l.pool.quote.denom),1)]),t("div",z,[t("div",U,"1 "+n(l.pool.quote.denom)+" ≃",1),t("div",Y,n(l.pool.quote.price.toPrecision(5)),1),t("div",W,n(l.pool.base.denom),1),t("div",G," Pool liquidity: "+n(l.pool.base.balance)+" "+n(l.pool.base.denom),1)])])])])}const X=p(A,[["render",K]]);function Z(o,e,l){const r=o*e,s=o+l,a=r/s,i=Math.floor(e-a);return{newBalanceA:s,newBalanceB:a,swapOutB:i}}function $(o,e,l){const r=o*e,s=e-l,a=r/s,i=Math.ceil(a-o);return{newBalanceA:a,newBalanceB:s,swapInA:i}}function tt(o,e){o={...o};const[l,r]=e.split(" "),s=Number(l),a=r===o.base.denom,{newBalanceA:i,newBalanceB:x,swapOutB:f}=Z(a?o.base.balance:o.quote.balance,a?o.quote.balance:o.base.balance,s);if(a?(o.base.balance=i,o.quote.balance=x):(o.quote.balance=i,o.base.balance=x),f<=0)throw"Invalid swap amount";if(o.base.balance<=0||o.quote.balance<=0)throw"Swap size too large";return{output_amount:f,output_denom:a?o.quote.denom:o.base.denom}}function ot(o,e,l){const r=l===o.base.denom,{newBalanceA:s,newBalanceB:a,swapInA:i}=$(r?o.base.balance:o.quote.balance,r?o.quote.balance:o.base.balance,e);if(r?(o.base.balance=s,o.quote.balance=a):(o.quote.balance=s,o.base.balance=a),i<=0)throw"Invalid swap amount";if(o.base.balance<=0||o.quote.balance<=0)throw"Swap size too large";return`${i} ${r?o.base.denom:o.quote.denom}`}const st={props:["pool","account"],data(){return{pool_ids:this.pool.pool_id,coins:"",minimum_swap_out_amount:"",swap_out_denom:this.pool.quote.denom,sim:"",slipagePct:"",slippageAmount:"",error:"",inFlight:!1,txResult:null}},computed:{address:function(){var o;return(o=this.account)==null?void 0:o.bech32Address},baseAmount:{set(o){if(this.error="",this.swap_out_denom=this.pool.quote.denom,o==="")this.minimum_swap_out_amount="";else{let e=JSON.parse(JSON.stringify(this.pool));try{let l=this.simulateSwap(e,o+" "+this.pool.base.denom);l.output_amount>0&&(this.minimum_swap_out_amount=l.output_amount)}catch(l){console.log(l),this.error=l.toString(),this.minimum_swap_out_amount=""}}this.coins=o+" "+this.pool.base.denom,this.swap_out_denom=this.pool.quote.denom},get(){return this.coins.split(" ")[0]}},quoteAmount:{set(o){if(this.error="",o==="")this.coins="";else{let e=JSON.parse(JSON.stringify(this.pool));try{let l=this.simulateSwapInverse(e,o,this.pool.base.denom);this.coins=l}catch(l){this.coins="",this.error=l.toString(),console.log(l)}}this.minimum_swap_out_amount=o,this.swap_out_denom=this.pool.quote.denom},get(){return this.minimum_swap_out_amount}}},component:{},methods:{simulateSwap:tt,simulateSwapInverse:ot,swapBaseQuote(){[this.pool.base,this.pool.quote]=[this.pool.quote,this.pool.base],this.swap_out_denom=this.pool.quote.denom,this.baseAmount="",this.quoteAmount=""},async swap(o,e,l,r){this.inFlight=!0,this.error="";let s="dyson/sendMsgRun",a={value:{creator:this.address,address:"whaleswap.dys",function_name:"swap",kwargs:JSON.stringify({pool_ids:o,minimum_swap_out_amount:l,swap_out_denom:r}),coins:e,nfts:""},fee:[{amount:"223",denom:"dys"}],gas:"2230000"};try{this.txResult=await v(s,a),console.log(this.txResult)}catch(i){console.log(i.toString()),this.error=i.toString()}this.inFlight=!1}},created(){this.swapBaseQuote()}},et={key:0},lt={key:0,class:"flex flex-col w-full border-opacity-50"},nt=t("h3",{class:"font-bold text-lg error"},"Error!",-1),at={key:1,class:"flex flex-col w-full border-opacity-50"},it=t("h3",{class:"font-bold text-lg success"},"Success!",-1),ct=t("br",null,null,-1),rt={key:1,class:"flex flex-col w-full border-opacity-50"},dt={class:"text-2xl font-bold text-base-content"},ut={class:"grid flex-grow card"},ht={class:"form-control"},_t=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Send Exactly ")],-1),mt={class:"label"},bt={class:"text-lg label-text"},pt={class:"divider"},xt={class:"grid flex-grow card"},ft={class:"form-control"},wt=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Receive at least")],-1),gt={class:"label"},yt={class:"text-lg label-text"},vt={class:"py-4 text-red-500"},St={key:0,class:"py-4"},qt=["disabled"];function Pt(o,e,l,r,s,a){return s.txResult?(c(),d("div",et,[s.txResult.error?(c(),d("div",lt,[nt,t("pre",null,n(s.txResult.error),1)])):(c(),d("div",at,[it,t("p",null,[u(" You received: "+n(s.txResult.result.output_amount)+" "+n(s.txResult.result.output_denom),1),ct,u(" Transaction Hash: "+n(s.txResult.transactionHash),1)])]))])):(c(),d("div",rt,[t("h1",dt,"Swap Pool "+n(l.pool.pool_id),1),t("div",ut,[t("div",ht,[_t,m(t("input",{type:"text",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[0]||(e[0]=i=>a.baseAmount=i)},null,512),[[b,a.baseAmount]]),t("label",mt,[t("span",bt,n(l.pool.base.denom),1)])])]),t("div",pt,[t("button",{class:"btn",onClick:e[1]||(e[1]=y((...i)=>a.swapBaseQuote&&a.swapBaseQuote(...i),["prevent"]))},"⇅")]),t("div",xt,[t("div",ft,[wt,m(t("input",{type:"text",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[2]||(e[2]=i=>a.quoteAmount=i)},null,512),[[b,a.quoteAmount]]),t("label",gt,[t("span",yt,n(l.pool.quote.denom),1)])])]),t("p",vt,n(s.error),1),!s.error&&s.minimum_swap_out_amount&&s.coins?(c(),d("p",St,[u(" Send exactly "),t("strong",null,n(s.coins),1),u(" and receive at least "),t("strong",null,n(s.minimum_swap_out_amount)+" "+n(s.swap_out_denom),1)])):_("",!0),t("button",{class:"btn btn-lg btn-block btn-primary",onClick:e[3]||(e[3]=y(i=>a.swap(l.pool.pool_id,s.coins,s.minimum_swap_out_amount,s.swap_out_denom),["prevent"])),disabled:!a.address||s.inFlight}," Swap Coins ",8,qt)]))}const kt=p(st,[["render",Pt]]),Rt={props:{pool:Object,account:Object},data(){return{baseValue:"",quoteValue:"",txResult:null,inFlight:!1,error:null,updating:null,availableShares:"Loading..."}},computed:{sharesDenom:function(){return`pool-${this.pool.pool_id}.whaleswap.dys`},address:function(){var o;return(o=this.account)==null?void 0:o.bech32Address},baseAmount:{get(){return this.baseValue},set(o){this.updating!=="quote"&&(this.updating="base",this.baseValue=o,this.pool.base.balance&&this.pool.quote.balance&&(this.quoteValue=Math.ceil(o*this.pool.quote.balance/this.pool.base.balance)),this.updating=null)}},quoteAmount:{get(){return this.quoteValue},set(o){this.updating!=="base"&&(this.updating="quote",this.quoteValue=o,this.pool.base.balance&&this.pool.quote.balance&&(this.baseValue=Math.ceil(o*this.pool.base.balance/this.pool.quote.balance)),this.updating=null)}}},methods:{async fetchPoolShares(){console.log("fetching pool shares",this.sharesDenom);let o="cosmos.bank.v1beta1/QueryBalance",e={query:{denom:this.sharesDenom},params:{address:this.address}};return(await dysonVueStore.dispatch(o,e)).balance.amount},async addLiquidity(){this.inFlight=!0,this.error=null;const o="dyson/sendMsgRun",e={value:{creator:this.address,address:"whaleswap.dys",function_name:"join_pool",kwargs:JSON.stringify({pool_id:this.pool.pool_id}),coins:`${this.baseAmount} ${this.pool.base.denom}, ${this.quoteAmount} ${this.pool.quote.denom}`},fee:[{amount:"223",denom:"dys"}],gas:"2230000"};console.log("data",e);try{this.txResult=await v(o,e)}catch(l){this.error=l.toString()}finally{this.inFlight=!1}}},created:async function(){this.availableShares=await this.fetchPoolShares()},watch:{pool:{handler:async function(o){console.log("pool changed",o.pool_id),this.availableShares=await this.fetchPoolShares()},deep:!0}}},At={key:0},Bt={key:0,class:"flex flex-col w-full border-opacity-50"},jt=t("h3",{class:"font-bold text-lg error"},"Error!",-1),Mt={key:1,class:"flex flex-col w-full border-opacity-50"},Vt=t("h3",{class:"font-bold text-lg success"},"Success!",-1),Ct={key:0},Et={key:1,class:"flex flex-col w-full border-opacity-50"},Ft=t("h1",{class:"text-2xl font-bold"},"Join Pool",-1),Jt={class:"grid flex-grow card"},Dt={class:"alert"},Ot={class:""},It={class:""},Lt={class:"form-control"},Nt=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Add Exactly")],-1),Tt={class:"label"},Ht={class:"text-lg"},Qt=t("div",{class:"divider"},"And",-1),zt={class:"grid flex-grow card"},Ut={class:"form-control"},Yt=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Add Exactly")],-1),Wt={class:"label"},Gt={class:"text-lg"},Kt={key:0,class:"py-4 text-red-500"},Xt={key:1,class:"py-4"},Zt=["disabled"];function $t(o,e,l,r,s,a){return s.txResult?(c(),d("div",At,[s.error?(c(),d("div",Bt,[jt,t("pre",null,n(s.error),1)])):(c(),d("div",Mt,[Vt,t("p",null,"Transaction Hash: "+n(s.txResult.transactionHash),1),t("p",null,"Shares Received: "+n(s.txResult.result.shares)+" "+n(s.txResult.result.share_denom),1),s.txResult.result.refund.length>0?(c(),d("p",Ct,"Refund Amount: "+n(s.txResult.result.refund[0].amount)+" "+n(s.txResult.result.refund[0].denom),1)):_("",!0)]))])):(c(),d("div",Et,[Ft,t("div",Jt,[t("div",Dt,[t("span",Ot," Total shares: "+n(l.pool.total_shares),1),t("span",It," Your shares: "+n(s.availableShares)+" ("+n(s.availableShares/l.pool.total_shares*100)+"%)",1)]),t("div",Lt,[Nt,m(t("input",{type:"number",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[0]||(e[0]=i=>a.baseAmount=i)},null,512),[[b,a.baseAmount]]),t("label",Tt,[t("span",Ht,n(l.pool.base.denom),1)])])]),Qt,t("div",zt,[t("div",Ut,[Yt,m(t("input",{type:"number",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[1]||(e[1]=i=>a.quoteAmount=i)},null,512),[[b,a.quoteAmount]]),t("label",Wt,[t("span",Gt,n(l.pool.quote.denom),1)])])]),s.error?(c(),d("p",Kt,n(s.error),1)):_("",!0),a.baseAmount&&a.quoteAmount?(c(),d("p",Xt,[u(" You will add exactly: "),t("strong",null,n(a.baseAmount)+" "+n(l.pool.base.denom),1),u(" and "),t("strong",null,n(a.quoteAmount)+" "+n(l.pool.quote.denom),1),u(" to the pool ")])):_("",!0),t("button",{class:"btn btn-lg btn-block btn-primary",onClick:e[2]||(e[2]=y((...i)=>a.addLiquidity&&a.addLiquidity(...i),["prevent"])),disabled:!a.address||s.inFlight}," Add Liquidity ",8,Zt)]))}const to=p(Rt,[["render",$t]]),oo={props:["pool","account"],data(){return{coins:"",error:"",inFlight:!1,txResult:null,availableShares:"Loading..."}},computed:{sharesDenom:function(){return`pool-${this.pool.pool_id}.whaleswap.dys`},address:function(){var o;return(o=this.account)==null?void 0:o.bech32Address}},methods:{async fetchPoolShares(){console.log("fetching pool shares",this.sharesDenom);let o="cosmos.bank.v1beta1/QueryBalance",e={query:{denom:this.sharesDenom},params:{address:this.address}};return(await dysonVueStore.dispatch(o,e)).balance.amount},async exitPool(o,e){this.inFlight=!0,this.error="";let l="dyson/sendMsgRun",r={value:{creator:this.address,address:"whaleswap.dys",function_name:"exit_pool",kwargs:JSON.stringify({pool_id:o}),coins:e+this.sharesDenom},fee:[{amount:"223",denom:"dys"}],gas:"2230000"};try{console.log(r),this.txResult=await v(l,r),console.log(this.txResult)}catch(s){console.log(s.toString()),this.error=s.toString()}this.inFlight=!1}},created:async function(){this.availableShares=await this.fetchPoolShares()},watch:{pool:{handler:async function(o){console.log("pool changed",o.pool_id),this.availableShares=await this.fetchPoolShares()},deep:!0}}},so={key:0},eo={key:0,class:"flex flex-col w-full border-opacity-50"},lo=t("h3",{class:"font-bold text-lg error"},"Error!",-1),no={key:1,class:"flex flex-col w-full border-opacity-50"},ao=t("h3",{class:"font-bold text-lg success"},"Success!",-1),io=t("br",null,null,-1),co={key:1,class:"flex flex-col w-full border-opacity-50"},ro=t("h1",{class:"text-2xl font-bold text-base-content"},"Exit Pool",-1),uo={class:"grid flex-grow card"},ho={class:"alert"},_o={class:""},mo={class:""},bo={class:"form-control"},po=t("label",{class:"label"},[t("span",{class:"label-text text-lg"},"Send Exactly ")],-1),xo={class:"label"},fo={class:"label-text text-lg"},wo=["disabled"],go={class:"py-4 text-red-500"};function yo(o,e,l,r,s,a){return s.txResult?(c(),d("div",so,[s.txResult.error?(c(),d("div",eo,[lo,t("pre",null,n(s.txResult.error),1)])):(c(),d("div",no,[ao,t("p",null,"Transaction Hash: "+n(s.txResult.transactionHash),1),t("p",null,[u(" Sent: "+n(s.coins)+" "+n(a.sharesDenom),1),io,u(" Recieved: "+n(s.txResult.result[0].amount)+" "+n(s.txResult.result[0].denom)+" and "+n(s.txResult.result[1].amount)+" "+n(s.txResult.result[1].denom),1)]),t("pre",null,"       "+n(s.txResult)+`
      `,1)]))])):(c(),d("div",co,[ro,t("div",uo,[t("div",ho,[t("span",_o," Total shares: "+n(l.pool.total_shares),1),t("span",mo," Your shares: "+n(s.availableShares)+" ("+n(s.availableShares/l.pool.total_shares*100)+"%)",1)]),t("div",bo,[po,m(t("input",{type:"text",placeholder:"",class:"input input-bordered input-primary","onUpdate:modelValue":e[0]||(e[0]=i=>s.coins=i)},null,512),[[b,s.coins]]),t("label",xo,[t("span",fo,n(a.sharesDenom),1)])])]),t("button",{class:"btn btn-lg btn-block btn-primary",onClick:e[1]||(e[1]=y(i=>a.exitPool(l.pool.pool_id,s.coins),["prevent"])),disabled:!a.address||s.inFlight}," Sign Tx ",8,wo),t("p",go,n(s.error),1)]))}const vo=p(oo,[["render",yo]]),q=k(),So={props:["account"],data(){return{pools:q.pools,swapPool:null,joinPool:null,exitPool:null}},methods:{swap(o){this.swapPool=o,this.window.swapModal.showModal()},join(o){this.joinPool=o,this.window.joinModal.showModal()},exit(o){this.exitPool=o,this.window.exitModal.showModal()}},components:{PoolListItem:X,Swap:kt,JoinPool:to,ExitPool:vo},async created(){await q.setupWebsocket()}},qo={id:"swapModal",class:"modal"},Po={method:"dialog",class:"modal-box"},ko={method:"dialog",class:"modal-backdrop"},Ro={id:"joinModal",class:"modal"},Ao={method:"dialog",class:"modal-box"},Bo={method:"dialog",class:"modal-backdrop"},jo={id:"exitModal",class:"modal"},Mo={method:"dialog",class:"modal-box w-6/12"},Vo={method:"dialog",class:"modal-backdrop"};function Co(o,e,l,r,s,a){const i=w("PoolListItem"),x=w("Swap"),f=w("JoinPool"),P=w("ExitPool");return c(),d(S,null,[(c(!0),d(S,null,R(s.pools,h=>(c(),g(i,{pool:h,key:h,account:l.account,onSwap:a.swap,onJoin:a.join,onExit:a.exit},null,8,["pool","account","onSwap","onJoin","onExit"]))),128)),t("dialog",qo,[t("form",Po,[t("button",{class:"btn btn-sm btn-circle btn-ghost absolute right-2 top-2",onClick:e[0]||(e[0]=h=>s.swapPool=null)}," ✕ "),s.swapPool?(c(),g(x,{key:0,pool:{...s.swapPool},account:l.account},null,8,["pool","account"])):_("",!0)]),t("form",ko,[t("button",{onClick:e[1]||(e[1]=h=>s.swapPool=null)},"close")])]),t("dialog",Ro,[t("form",Ao,[t("button",{class:"btn btn-sm btn-circle btn-ghost absolute right-2 top-2",onClick:e[2]||(e[2]=h=>a.join=null)}," ✕ "),s.joinPool?(c(),g(f,{key:0,pool:s.joinPool,account:l.account},null,8,["pool","account"])):_("",!0)]),t("form",Bo,[t("button",{onClick:e[3]||(e[3]=h=>s.joinPool=null)})])]),t("dialog",jo,[t("form",Mo,[t("button",{class:"btn btn-sm btn-circle btn-ghost absolute right-2 top-2",onClick:e[4]||(e[4]=h=>s.exitPool=null)}," ✕ "),s.exitPool?(c(),g(P,{pool:s.exitPool,account:l.account,key:s.exitPool.pool_id},null,8,["pool","account"])):_("",!0)]),t("form",Vo,[t("button",{onClick:e[5]||(e[5]=h=>s.exitPool=null)})])])],64)}const Fo=p(So,[["render",Co]]);export{Fo as default};
