const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./bounce-CLB6Y4pc.js","./index-Brfk6Bdo.js","./defaultConfig-CxZCM2FP.js","./carousel-C_GFzRTL.js","./MotionPathPlugin-Bjigi6j0.js","./cheers-Ctf_B5ue.js","./choon-CQMYh73o.js","./coinflip-BHQSLqDg.js","./comets-A18GqhP0.js","./cube-BuV3VX5V.js","./cyclone-Cq7JGPsT.js","./dvd-IkVsXN75.js","./explode-DB922BLj.js","./fade-DOXSWgSk.js","./firework-CqNkZubN.js","./hypetrain-BMlZucTB.js","./invaders-o-VoLPXI.js","./lurking-nE_S14_8.js","./raiders-JGXWtyjD.js","./rain-D-3ytsg-.js","./rise-BX0Qpv3C.js","./spiral-DxshaE83.js","./tetris-Bm2j3DZC.js","./text-CR9wXBOV.js","./traffic-C3rllcXQ.js","./volcano-CqsBYj0W.js","./waves-CoNUlgM3.js"])))=>i.map(i=>d[i]);
var Y=Object.defineProperty;var K=(e,t,n)=>t in e?Y(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var I=(e,t,n)=>K(e,typeof t!="symbol"?t+"":t,n);import{d as X}from"./defaultConfig-CxZCM2FP.js";const w=class w{constructor(){I(this,"settings");this.settings={...X};try{const t=new URLSearchParams(window.location.search),n=t.get("server");n&&(this.settings.streamerBotWebsocketUrl=n);const o=t.get("user");o&&(this.settings.twitchUsername=o),t.get("debug")!==null&&(this.settings.debug=!0)}catch{}this.fetchSettings().then(()=>{console.log("Settings loaded successfully")}).catch(t=>{console.error("Error loading settings:",t)})}static getInstance(){return w.instance||(w.instance=new w),w.instance}updateSettings(t){this.settings={...this.settings,...t}}async fetchSettings(){try{const t=await fetch(`${window.location.origin}/api/settings`);if(t.ok){const n=await t.json();console.log("Settings loaded from HTTP API:",n),this.updateSettings(n)}else console.error("Failed to load settings via HTTP:",t.statusText)}catch(t){console.error("Error fetching settings:",t)}}};I(w,"instance");let L=w;const C=L.getInstance(),F=C.settings,Q=new WebSocket(F.streamerBotWebsocketUrl);let Z,ee=[],te;const E=document.documentElement;function z(){let e=Math.ceil(window.innerHeight/14),t=Math.ceil(window.innerHeight/5);E.style.setProperty("--emote-size-standard",e+"px"),E.style.setProperty("--emote-size-large",e*2+"px"),E.style.setProperty("--emote-size-small",e/2+"px"),E.style.setProperty("--avatar-size-standard",t+"px"),E.style.setProperty("--avatar-size-large",t*2+"px"),E.style.setProperty("--avatar-size-small",t/2+"px")}window.addEventListener("load",z);window.addEventListener("resize",z);const R={channelsub:Z,hypetrainCache:ee,BotChat:te,divnumber:0,ws:Q,warp:document.getElementById("confetti-container")};F.debug&&console.log(R);const ne="modulepreload",oe=function(e,t){return new URL(e,t).href},D={},m=function(t,n,o){let i=Promise.resolve();if(n&&n.length>0){const r=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),v=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));i=Promise.allSettled(n.map(a=>{if(a=oe(a,o),a in D)return;D[a]=!0;const l=a.endsWith(".css"),f=l?'[rel="stylesheet"]':"";if(!!o)for(let b=r.length-1;b>=0;b--){const y=r[b];if(y.href===a&&(!l||y.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${a}"]${f}`))return;const h=document.createElement("link");if(h.rel=l?"stylesheet":ne,l||(h.as="script"),h.crossOrigin="",h.href=a,v&&h.setAttribute("nonce",v),document.head.appendChild(h),l)return new Promise((b,y)=>{h.addEventListener("load",b),h.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${a}`)))})}))}function u(r){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=r,window.dispatchEvent(c),!c.defaultPrevented)throw r}return i.then(r=>{for(const c of r||[])c.status==="rejected"&&u(c.reason);return t().catch(u)})},N=Object.assign({"./animations/bounce.ts":()=>m(()=>import("./bounce-CLB6Y4pc.js"),__vite__mapDeps([0,1,2]),import.meta.url),"./animations/carousel.ts":()=>m(()=>import("./carousel-C_GFzRTL.js"),__vite__mapDeps([3,1,4,2]),import.meta.url),"./animations/cheers.ts":()=>m(()=>import("./cheers-Ctf_B5ue.js"),__vite__mapDeps([5,1,2]),import.meta.url),"./animations/choon.ts":()=>m(()=>import("./choon-CQMYh73o.js"),__vite__mapDeps([6,1,2]),import.meta.url),"./animations/coinflip.ts":()=>m(()=>import("./coinflip-BHQSLqDg.js"),__vite__mapDeps([7,1,2]),import.meta.url),"./animations/comets.ts":()=>m(()=>import("./comets-A18GqhP0.js"),__vite__mapDeps([8,1,2]),import.meta.url),"./animations/cube.ts":()=>m(()=>import("./cube-BuV3VX5V.js"),__vite__mapDeps([9,1,2]),import.meta.url),"./animations/cyclone.ts":()=>m(()=>import("./cyclone-Cq7JGPsT.js"),__vite__mapDeps([10,1,2]),import.meta.url),"./animations/dvd.ts":()=>m(()=>import("./dvd-IkVsXN75.js"),__vite__mapDeps([11,1,2]),import.meta.url),"./animations/explode.ts":()=>m(()=>import("./explode-DB922BLj.js"),__vite__mapDeps([12,1,2]),import.meta.url),"./animations/fade.ts":()=>m(()=>import("./fade-DOXSWgSk.js"),__vite__mapDeps([13,1,2]),import.meta.url),"./animations/firework.ts":()=>m(()=>import("./firework-CqNkZubN.js"),__vite__mapDeps([14,1,2]),import.meta.url),"./animations/hypetrain.ts":()=>m(()=>import("./hypetrain-BMlZucTB.js"),__vite__mapDeps([15,1,2]),import.meta.url),"./animations/invaders.ts":()=>m(()=>import("./invaders-o-VoLPXI.js"),__vite__mapDeps([16,1,2]),import.meta.url),"./animations/lurking.ts":()=>m(()=>import("./lurking-nE_S14_8.js"),__vite__mapDeps([17,1,2]),import.meta.url),"./animations/raiders.ts":()=>m(()=>import("./raiders-JGXWtyjD.js"),__vite__mapDeps([18,1,2]),import.meta.url),"./animations/rain.ts":()=>m(()=>import("./rain-D-3ytsg-.js"),__vite__mapDeps([19,1,2]),import.meta.url),"./animations/rise.ts":()=>m(()=>import("./rise-BX0Qpv3C.js"),__vite__mapDeps([20,1,2]),import.meta.url),"./animations/spiral.ts":()=>m(()=>import("./spiral-DxshaE83.js"),__vite__mapDeps([21,1,2]),import.meta.url),"./animations/tetris.ts":()=>m(()=>import("./tetris-Bm2j3DZC.js"),__vite__mapDeps([22,1,2]),import.meta.url),"./animations/text.ts":()=>m(()=>import("./text-CR9wXBOV.js"),__vite__mapDeps([23,1,2]),import.meta.url),"./animations/traffic.ts":()=>m(()=>import("./traffic-C3rllcXQ.js"),__vite__mapDeps([24,1,2]),import.meta.url),"./animations/volcano.ts":()=>m(()=>import("./volcano-CqsBYj0W.js"),__vite__mapDeps([25,1,4,2]),import.meta.url),"./animations/waves.ts":()=>m(()=>import("./waves-CoNUlgM3.js"),__vite__mapDeps([26,1,2]),import.meta.url)}),d={};async function re(){for(const e in N){const t=await N[e]();Object.assign(d,t)}}re();function ie(e,t){return e+Math.random()*(t-e)}function ae(){var e=Math.random();return e<.5?-200:innerHeight+200}function se(e){return e.match(/\s[0-9]+/g)}let P=0;function ce(e,t){return function(...n){const o=Date.now();o-P>=t?(e(...n),P=o):setTimeout(()=>{e(...n),P=Date.now()},t-(o-P))}}async function le(e,t=!1){let n="https://decapi.me/twitch/avatar/"+e,o;t&&(n+="?id=true");try{o=await ue(n).then(function(i){return console.log(i),i}).catch(function(i){throw console.error(i),i})}catch(i){throw console.error(i),i}return o}function ue(e){return new Promise(function(t,n){var o=new XMLHttpRequest;o.onreadystatechange=function(){o.readyState===4&&(o.status===200?t(o.responseText):n("Error: "+o.status))},o.open("GET",e,!0),o.send()})}function me(e,t){let n=se(e);return n===null?null:t=="count"?n.length==2||n.length==1?parseInt(n[0].trim()):null:t=="interval"&&n.length==2?parseInt(n[1].trim()):null}function de(e){return new Promise(t=>setTimeout(t,e))}function fe(){return Math.random()<.5?-1:1}function pe(e){const t=document.getElementById(e);t&&t.remove()}const p={delay:de,randomSign:fe,removeelement:pe,getCommandValue:me,Randomizer:ie,TopOrBottom:ae,getTwitchAvatar:le,executeWithInterval:ce},g=C.settings;let s=g.animations,T=[["rain",s.rain.count??50,s.rain.interval??50],["rise",s.rise.count??100,s.rise.interval??50],["explode",s.explode.count??100,s.explode.interval??20],["volcano",s.volcano.count??100,s.volcano.interval??20],["firework",s.firework.count??100,s.firework.interval??20],["rightwave",s.rightwave.count??100,s.rightwave.interval??20],["leftwave",s.leftwave.count??100,s.leftwave.interval??20],["carousel",s.carousel.count??100,s.carousel.interval??150],["spiral",s.spiral.count??100,s.spiral.interval??170],["comets",s.comets.count??100,s.comets.interval??50],["dvd",s.dvd.count??8,s.dvd.interval??50],["text",s.text.count??1,s.text.interval??25],["cyclone",s.cyclone.count??100,s.cyclone.interval??30],["tetris",s.tetris.count??50,s.tetris.interval??40],["cube",s.cube.count??100,s.cube.interval??50],["traffic",s.traffic.count??100,s.traffic.interval??250]];function _(e,t){return(g.enableAllFeatures||g.features[e])&&t}function ge(e){var c,v,a,l,f,x,h,b,y,V,H;const n=(((v=(c=e.data)==null?void 0:c.message)==null?void 0:v.message)||"").toLowerCase(),o=((l=(a=e.data)==null?void 0:a.message)==null?void 0:l.username)||"",i=((x=(f=e.data)==null?void 0:f.message)==null?void 0:x.userId)||"",u=ve(e),r=!g.subOnly||g.subOnly&&((b=(h=e.data)==null?void 0:h.message)==null?void 0:b.subscriber);switch(!0){case n.includes("!lurk"):_("lurk",r)?j(o):console.log("Lurk Not Enabled or User Not Subscribed");break;case n.includes("!so"):_("welcome",r)?J(n):console.log("Shoutout Not Enabled or User Not Subscribed");break;case(n.includes("!choon")||n.includes("!tune")):_("choon",r)?G(o):console.log("Choon Command Not Enabled or User Not Subscribed");break;case n.includes("!cheers"):if(_("cheers",r)){let U;n.includes("@")&&(U=n.split("@")[1]),$(o,U)}else console.log("Cheers Command Not Enabled or User Not Subscribed");break;case n.includes("!jointrain"):g.debug?d.hypetrainprogression(i):console.log("Join Train Command Not Enabled");break;case n.includes("!er"):_("emoterain",r)?_e(n,u):console.log("EmoteRain Not Enabled or User Not Subscribed");break;case n.includes("!k"):_("kappagen",r)?be(n,u):console.log("KappaGen Not Enabled or User Not Subscribed");break;case n.includes("!hypetrainpreview"):_("kappagen",r&&g.debug||((y=e.event)==null?void 0:y.source)=="Admin")?d.hypetrainpreview(o):console.log("KappaGen Not Enabled or User Not Subscribed");break;default:typeof((H=(V=e.data)==null?void 0:V.message)==null?void 0:H.emotes)<"u"&&W(u);break}}function he(e){var t;e.data,(t=e.data)==null||t.name}function ve(e){var i,u;const t=((u=(i=e.data)==null?void 0:i.message)==null?void 0:u.emotes)||[],n=t.length;let o=[];for(let r=0;r<n;r++)t[r]&&t[r].imageUrl&&(o[r]=t[r].imageUrl);return o}function B(e){return e>g.maxEmotes&&(e=g.maxEmotes),e}function be(e,t){let n=Math.round(p.Randomizer(0,T.length-1)),o=p.getCommandValue(e,"count")??T[n][1];o=B(o);let i=p.getCommandValue(e,"interval")??T[n][2],u=T[n][0];console.log(`Rolled: ${n}. Running: ${u} with ${o} emote(s) every ${i} ms`),d.hasOwnProperty(u)&&typeof d[u]=="function"?d[u](t,o,i):console.log("Animation Function Mapping Failed")}function _e(e,t){let o=/!er (\w*)/gm.exec(e);if(o&&o[1]){let i=o[1];if(console.log("Running emoteRain: "+i),i=="text"){let r="Hype";const c=T.find(f=>f[0]==="text");let v=p.getCommandValue(e,"interval")??(c?c[2]:25),l=/text (\S*)/gm.exec(e);l&&l[1]&&(r=l[1]),d.text(t,r,v);return}let u=T.find(r=>r[0]==i);if(u){let r=p.getCommandValue(e,"count")??u[1];r=B(r);let c=p.getCommandValue(e,"interval")??u[2];d[i](t,r,c)}else console.log(`Animation ${i} Not Found in animationMap`)}}function W(e){let t=e.length;switch(Math.round(p.Randomizer(1,4))){case 1:d.rain(e,t);break;case 2:d.bounce(e,t);break;case 3:d.fade(e,t);break;case 4:d.dvd(e,t);break}}async function ye(e){var o,i,u,r;const t=!g.subOnly||g.subOnly&&((i=(o=e.data)==null?void 0:o.message)==null?void 0:i.subscriber);if(!_("firstwords",t)){console.log("First Words Not Enabled");return}const n=((r=(u=e.data)==null?void 0:u.message)==null?void 0:r.username)||"";try{const c=await p.getTwitchAvatar(n);d.rain([c],g.defaultEmotes,50)}catch(c){console.error("Error getting avatar:",c)}}async function $(e,t){console.log("Cheers: "+e+(t||""));try{const n=[await p.getTwitchAvatar(e),t&&await p.getTwitchAvatar(t)||g.twitchUsername&&await p.getTwitchAvatar(g.twitchUsername)||"https://static-cdn.jtvnw.net/jtv_user_pictures/8e051a26-051f-4abe-bcfa-e13a5d13fad0-profile_image-300x300.png"];p.executeWithInterval(()=>d.cheers(n),15e3)()}catch(n){console.error("Error in cheers command:",n)}}async function G(e){try{const t=await p.getTwitchAvatar(e);d.choon([t])}catch(t){console.error("Error getting avatar:",t)}}async function j(e){try{const t=await p.getTwitchAvatar(e);d.lurking(t,3)}catch(t){console.error("Error getting avatar:",t)}}async function J(e){let t=/\@(.*)/,n=e.match(t);if(!n||!n[1])return;const o=n[1];console.log(o);try{const i=await p.getTwitchAvatar(o);d.rain([i],g.defaultEmotes,50)}catch(i){console.error("Error getting avatar:",i)}}const S={chatMessageHandler:ge,actionsHandler:he,emoteMessageHandler:W,firstWordsHander:ye,cheersCommand:$,choonCommand:G,lurkCommand:j,shoutoutCommand:J},O=C.settings;let A=R.ws,we=!1,M=!1;const Ee=e=>{const{type:t,animation:n,wsdata:o}=e.data;(t==="PREVIEW_ANIMATION"||t==="PREVIEW_FEATURE")&&k(JSON.stringify(o))};function Te(){return!!(typeof window<"u"&&window.electronAPI||typeof navigator=="object"&&typeof navigator.userAgent=="string"&&navigator.userAgent.indexOf("Electron")>=0)}function q(){if(M=Te(),M){console.log("Running in Electron environment, using IPC for messages"),xe(),window.addEventListener("message",Ee);return}"WebSocket"in window&&(A.onclose=function(){setTimeout(q,1e4)},A.onopen=function(){A.send(JSON.stringify({request:"Subscribe",events:{Twitch:["ChatMessage","FirstWord","HypeTrainStart","HypeTrainUpdate","HypeTrainLevelUp","HypeTrainEnd","Raid","Cheer","Sub","Resub","GiftBomb","GiftSub"],Raw:["Action"],General:["Custom"]},id:"123"})),A.send(JSON.stringify({request:"GetActions",id:"ActionList"}))},A.onmessage=function(e){const t=e.data;k(t)})}function xe(){typeof window<"u"&&window.electronAPI&&window.electronAPI.onWebSocketMessage(e=>{var t,n;if(console.log("Received message from Electron:",e),e.type==="test-animation"){const o={event:{type:"ChatMessage"},data:{message:{message:`!er ${e.animationType}${(t=e.params)!=null&&t.count?` count ${e.params.count}`:""}`,username:((n=e.params)==null?void 0:n.username)||"TestUser",emotes:[{imageUrl:"https://static-cdn.jtvnw.net/emoticons/v1/425618/2.0",name:"test"}],subscriber:!0}}};k(JSON.stringify(o))}else k(JSON.stringify(e))})}function k(e){var t,n,o,i,u,r,c,v;try{const a=JSON.parse(e);if(console.log(a),typeof a.actions<"u"&&typeof a.id=="string"&&a.id==="ActionList"){let f=a.actions.filter(function(x){return x.name=="ERTwitchBotChat"});console.log(f),f.length>=1&&(console.log("True"),we=!0)}if(typeof a.event>"u"){console.log("Event undefined");return}if(typeof a.event.type>"u"){console.log("Event Type undefined");return}let l=a.event.type;if(l=="ChatMessage"){S.chatMessageHandler(a),O.debug&&console.log("Passed to ChatMessageHandler");return}if(l=="FirstWord"){S.firstWordsHander(a);return}if(l=="Sub"||l=="Resub"||l=="GiftBomb"||l=="GiftSub"||l=="Cheer"){let f=(n=(t=a.data)==null?void 0:t.message)!=null&&n.username?a.data.message.username:(o=a.data)==null?void 0:o.userName;f&&(R.hypetrainCache.unshift(f),R.hypetrainCache[3]&&R.hypetrainCache.pop())}if(O.features.hypetrain||O.enableAllFeatures){if(l=="HypeTrainStart"){d.hypetrain.hypetrainstart();return}if(l=="HypeTrainLevelUp"){d.hypetrain.hypetrainlevelup();return}if(l=="HypeTrainUpdate"){const f=(u=(i=a.data)==null?void 0:i.last_contribution)==null?void 0:u.user_id;f&&d.hypetrain.hypetrainprogression(f);return}if(l=="HypeTrainEnd"){d.hypetrain.hypetrainfinish();return}}if(l=="Raid")return;if(l=="Custom"){if(((r=a.data)==null?void 0:r.coinFlipResult)=="undefined")return;((c=a.data)==null?void 0:c.coinFlipResult)=="Heads"&&d.coinflip.createCoins(1,"Heads"),((v=a.data)==null?void 0:v.coinFlipResult)=="Tails"&&d.coinflip.createCoins(1,"Tails")}if(l=="Action"){S.actionsHandler(a);return}}catch(a){console.error("Error processing WebSocket message:",a)}}const Ae={connectws:q,handleMessage:k};function Re(){const t=new URLSearchParams(window.location.search).toString().length>0,n=window.location.hostname==="gforceweb.github.io",o=window.location.hostname==="localhost";return n||t||!o}function ke(){if(!Re())return;const e=document.createElement("div");e.id="github-notice-banner",e.innerHTML=`
    <div class="banner-content">
      <div class="banner-icon">🎉</div>
      <div class="banner-text">
        <strong>Emote Overlay Tools v0.1.0</strong>
        <span class="banner-subtitle">Visit our <a href="https://github.com/gforceweb/EmoteOverlayTools" target="_blank">GitHub</a> for updates and downloads!</span>
      </div>
      <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;const t=document.createElement("style");t.textContent=`
    #github-notice-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      animation: slideDown 0.5s ease-out;
    }
    
    .banner-content {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      max-width: 100%;
    }
    
    .banner-icon {
      font-size: 1.2em;
      margin-right: 12px;
    }
    
    .banner-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .banner-text strong {
      font-size: 0.95em;
      font-weight: 600;
    }
    
    .banner-subtitle {
      font-size: 0.8em;
      opacity: 0.9;
    }
    
    .banner-subtitle a {
      color: #FFD700;
      text-decoration: none;
      font-weight: 500;
    }
    
    .banner-subtitle a:hover {
      text-decoration: underline;
    }
    
    .banner-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }
    
    .banner-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-100%);
      }
    }
  `,document.head.appendChild(t),document.body.appendChild(e),setTimeout(()=>{e.parentElement&&(e.style.animation="fadeOut 0.5s ease-in forwards",setTimeout(()=>{e.parentElement&&e.remove()},500))},1e4)}C.settings;async function Pe(){ke(),Ae.connectws(),window.animations=d,window.testChat=(e,t)=>{const n={event:{type:"message",source:"Admin"},data:{message:{username:e,userId:`test-${e}`,message:t,role:"viewer",subscriber:!0,emotes:[]}}};S.chatMessageHandler(n)}}Pe();export{R as g,p as h};
