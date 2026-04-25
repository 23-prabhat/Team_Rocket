(function(){"use strict";const R=[{value:"en",label:"English"},{value:"hi",label:"Hindi"},{value:"mr",label:"Marathi"}],Q={en:"en-US",hi:"hi-IN",mr:"mr-IN"},Y={en:{appTitle:"Misinformation Detector",appSubtitle:"Scan this page, estimate fake-news risk, and explain the result in your chosen language.",outputLanguage:"Output language",outputLanguageHint:"Choose how Veritron explains the result.",fakeNewsPercentage:"Fake-news percentage",falseRiskPercentage:"False risk",truthLikelihoodPercentage:"Truth chance",wrongnessPercentage:"Wrongness",verdict:"Verdict",explanation:"Explanation",output:"Output",topReasons:"Top reasons",noReasons:"No detailed reasons were returned for this page.",readAloud:"Read aloud",playAudio:"Play audio",pauseAudio:"Pause audio",resumeAudio:"Resume audio",stop:"Stop",refreshAnalysis:"Refresh analysis",scanPageAgain:"Scan page again",analyzeThisPage:"Analyze this page",noAnalysisStored:"No misinformation analysis is stored for this tab yet.",openRegularPage:"Open a regular http or https page to analyze it.",currentPage:"Current page",analysisError:"Analysis error",tryAgain:"Try again",loadingTab:"Loading current tab...",checkingPage:"Checking the page for suspicious claims...",loadingSignals:"Checking this page for misinformation signals...",pageNotFound:"No article-like content with enough text was found on this page.",likelyTrue:"Likely true",mixedClaims:"Mixed or unclear claims",likelyFalse:"Likely false",highFakeRisk:"High fake-news risk"},hi:{appTitle:"भ्रामक जानकारी जांच",appSubtitle:"इस पेज की जांच करें, फेक-न्यूज़ जोखिम देखें, और चुनी हुई भाषा में कारण समझें।",outputLanguage:"आउटपुट भाषा",outputLanguageHint:"वेरिट्रॉन परिणाम किस भाषा में समझाए, यह चुनें।",fakeNewsPercentage:"फेक न्यूज़ %",falseRiskPercentage:"गलत जोखिम",truthLikelihoodPercentage:"सही संभावना",wrongnessPercentage:"गलती %",verdict:"फैसला",explanation:"व्याख्या",output:"आउटपुट",topReasons:"मुख्य कारण",noReasons:"इस पेज के लिए विस्तृत कारण नहीं मिले।",readAloud:"सुनें",playAudio:"ऑडियो चलाएं",pauseAudio:"ऑडियो रोकें",resumeAudio:"ऑडियो फिर चलाएं",stop:"बंद करें",refreshAnalysis:"विश्लेषण फिर चलाएं",scanPageAgain:"पेज फिर स्कैन करें",analyzeThisPage:"इस पेज का विश्लेषण करें",noAnalysisStored:"इस टैब के लिए अभी कोई विश्लेषण सुरक्षित नहीं है।",openRegularPage:"विश्लेषण के लिए सामान्य http या https पेज खोलें।",currentPage:"मौजूदा पेज",analysisError:"विश्लेषण त्रुटि",tryAgain:"फिर कोशिश करें",loadingTab:"मौजूदा टैब लोड हो रहा है...",checkingPage:"संदिग्ध दावों के लिए पेज की जांच हो रही है...",loadingSignals:"इस पेज पर भ्रामक संकेत जांचे जा रहे हैं...",pageNotFound:"इस पेज पर पर्याप्त लेख-जैसा टेक्स्ट नहीं मिला।",likelyTrue:"संभवतः सही",mixedClaims:"मिश्रित या अस्पष्ट दावे",likelyFalse:"संभवतः गलत",highFakeRisk:"फेक न्यूज़ का उच्च जोखिम"},mr:{appTitle:"दिशाभूल तपास",appSubtitle:"हे पान स्कॅन करा, फेक-न्यूज धोका पहा, आणि निवडलेल्या भाषेत कारण समजा.",outputLanguage:"आउटपुट भाषा",outputLanguageHint:"व्हेरिट्रॉन निकाल कोणत्या भाषेत समजावेल ते निवडा.",fakeNewsPercentage:"फेक न्यूज %",falseRiskPercentage:"खोटे धोका",truthLikelihoodPercentage:"खरे शक्यता",wrongnessPercentage:"चुकी %",verdict:"निकाल",explanation:"स्पष्टीकरण",output:"आउटपुट",topReasons:"मुख्य कारणे",noReasons:"या पानासाठी सविस्तर कारणे मिळाली नाहीत.",readAloud:"मोठ्याने वाचा",playAudio:"ऑडिओ सुरू करा",pauseAudio:"ऑडिओ थांबवा",resumeAudio:"ऑडिओ पुन्हा सुरू करा",stop:"थांबवा",refreshAnalysis:"विश्लेषण पुन्हा करा",scanPageAgain:"पान पुन्हा स्कॅन करा",analyzeThisPage:"हे पान तपासा",noAnalysisStored:"या टॅबसाठी अजून विश्लेषण साठवलेले नाही.",openRegularPage:"विश्लेषणासाठी सामान्य http किंवा https पान उघडा.",currentPage:"सध्याचे पान",analysisError:"विश्लेषण त्रुटी",tryAgain:"पुन्हा प्रयत्न करा",loadingTab:"सध्याचा टॅब लोड होत आहे...",checkingPage:"संशयास्पद दाव्यांसाठी पान तपासले जात आहे...",loadingSignals:"या पानावरील दिशाभूल संकेत तपासले जात आहेत...",pageNotFound:"या पानावर पुरेसा लेखासारखा मजकूर सापडला नाही.",likelyTrue:"बहुधा खरे",mixedClaims:"मिश्रित किंवा अस्पष्ट दावे",likelyFalse:"बहुधा खोटे",highFakeRisk:"फेक न्यूजचा उच्च धोका"}};function Z(t){return t<=30?"Likely credible":t<=60?"Needs verification":t<=80?"Likely misleading":"High fake-news risk"}function P(t){return Y[t]??Y.en}function J(t){return Math.max(0,100-D(t))}function ee(t){return D(t)}function te(t,e){const a=P(e);return t<=30?a.likelyTrue:t<=60?a.mixedClaims:t<=80?a.likelyFalse:a.highFakeRisk}function D(t){return Math.max(0,Math.min(100,Math.round(Number(t)||0)))}let A=0;const ne={en:["en-US","en-GB","en"],hi:["hi-IN","hi","en-IN","en-US"],mr:["mr-IN","mr","hi-IN","hi","en-IN","en-US"]};async function ae(t=1200){const e=window.speechSynthesis;if(!e?.getVoices)return[];const a=e.getVoices();return a.length>0?a:new Promise(o=>{let n=!1;const r=()=>{n||(n=!0,e.removeEventListener("voiceschanged",s),o(e.getVoices()))},s=()=>r();e.addEventListener("voiceschanged",s),window.setTimeout(r,t)})}function re(t,e){const o=ne[e].map(c=>c.toLowerCase()),n=t.find(c=>o.includes(c.lang.toLowerCase()));if(n)return n;const r=t.find(c=>o.some(i=>c.lang.toLowerCase().startsWith(i.split("-")[0])));return r||t.find(c=>{const i=`${c.name} ${c.lang}`.toLowerCase();return e==="hi"?i.includes("hindi"):e==="mr"?i.includes("marathi")||i.includes("hindi"):i.includes("english")})}function oe(t,e=220){const a=t.replace(/\s+/g," ").trim();if(!a)return[];const o=a.split(new RegExp("(?<=[.!?\\u0964])\\s+")).map(s=>s.trim()).filter(s=>s.length>0),n=[];let r="";for(const s of o){if(!r){r=s;continue}if(`${r} ${s}`.length<=e){r=`${r} ${s}`;continue}n.push(r),r=s}return r&&n.push(r),n.flatMap(s=>{if(s.length<=e)return[s];const c=[];for(let i=0;i<s.length;i+=e)c.push(s.slice(i,i+e).trim());return c.filter(i=>i.length>0)})}function W(){A+=1,window.speechSynthesis?.cancel()}function ie(){window.speechSynthesis?.pause()}function se(){window.speechSynthesis?.resume()}function le(t,e,a){W();const o=window.speechSynthesis;if(!o){a();return}const n=oe(t);if(n.length===0){a();return}const r=A,s=Q[e]??"en-US";(async()=>{const c=await ae();if(r!==A)return;const i=re(c,e);let d=0;const y=()=>{if(r!==A)return;if(d>=n.length){a();return}const x=new SpeechSynthesisUtterance(n[d]);x.lang=i?.lang??s,i&&(x.voice=i),x.rate=.95,x.onend=()=>{d+=1,y()},x.onerror=()=>{d+=1,y()},o.speak(x)};y()})()}const ce=12e3,de=300,q="veritron-extension-root",pe=["breaking","viral","exclusive","government","minister","police","election","health","cure","alert","claim","report","official","youtube","whatsapp","facebook","instagram","shocking","truth","fact","fake","misleading"],ue=["article","[role='main']","main",".article",".post-content",".entry-content",".story",".content","body"];let b=null,u={status:"idle"},w=null,g="en",h="idle";chrome.runtime.onMessage.addListener(t=>{if(t.type==="TRIGGER_ANALYSIS"){$(t.targetLanguage);return}if(t.type==="ANALYSIS_RESULT"){w=window.location.href,g=M(t.data.language),u={status:"success",data:t.data,targetLanguage:g},B().render(u);return}t.type==="ANALYSIS_ERROR"&&(w=window.location.href,u={status:"error",message:t.message,targetLanguage:g},B().render(u))});function $(t){g=M(t);const e=B();if(e.open(),w===window.location.href&&u.status==="success"&&u.targetLanguage===g){e.render(u);return}if(w===window.location.href&&u.status==="loading"&&u.targetLanguage===g){e.render(u);return}u={status:"loading",targetLanguage:g},w=window.location.href,H(),e.render(u);const a=ge();if(!a){const o=P(g).pageNotFound;u={status:"error",message:o,targetLanguage:g},e.render(u),chrome.runtime.sendMessage({type:"ANALYSIS_ERROR",message:o});return}chrome.runtime.sendMessage({type:"ANALYZE_REQUEST",text:a,url:window.location.href,targetLanguage:g})}function ge(){let t=null;for(const e of ue){const a=Array.from(document.querySelectorAll(e));for(const o of a){if(!me(o))continue;const n=X(fe(o));if(n.length<de)continue;const r=he(n,e);(!t||r>t.score)&&(t={text:n.slice(0,ce),score:r})}}return t?.text??null}function X(t){return t.replace(/\b(accept all|reject all|sign in|log in|skip to content|share this|advertisement)\b/gi," ").replace(/\s+/g," ").trim()}function fe(t){const e=t.cloneNode(!0);e.querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form").forEach(o=>{o.remove()});const a=Array.from(e.querySelectorAll("p, h1, h2, h3, li")).map(o=>o.textContent?.trim()??"").filter(o=>o.length>0);return a.length>4?a.join(" "):e.innerText||e.textContent||""}function me(t){const e=window.getComputedStyle(t);return e.display!=="none"&&e.visibility!=="hidden"&&t.innerText.trim().length>0}function he(t,e){const a=t.toLowerCase(),o=pe.reduce((c,i)=>c+(a.includes(i)?1:0),0),n=e==="article"||e==="main"||e==="[role='main']"?7:e==="body"?0:4,r=Math.min((t.match(/[.?!]/g)??[]).length,12),s=t.length>2500?6:t.length>1200?3:0;return o*3+n+r+s}function B(){if(b)return b;const t=document.getElementById(q);if(t?.shadowRoot){const r=t.shadowRoot.getElementById("veritron-sidebar");if(r)return b=K(t,r),b}const e=document.createElement("div");e.id=q,document.body.appendChild(e);const a=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=ye();const n=document.createElement("div");return n.id="veritron-sidebar",a.append(o,n),b=K(e,n),b}function K(t,e){const a={host:t,container:e,render:o=>T(e,o,a),open:()=>{t.style.display="block"},close:()=>{t.style.display="none",H()}};return a.render(u),a}function T(t,e,a){t.replaceChildren();const o=e.status==="idle"?g:e.targetLanguage,n=P(o),r=document.createElement("aside");r.className="panel";const s=document.createElement("div");s.className="header";const c=document.createElement("div");c.innerHTML=`
    <p class="eyebrow">Veritron</p>
    <h2 class="title">${l(n.appTitle)}</h2>
    <p class="subtitle">${l(n.appSubtitle)}</p>
  `;const i=document.createElement("button");i.type="button",i.className="closeButton",i.setAttribute("aria-label","Close sidebar"),i.textContent="X",i.addEventListener("click",()=>a.close()),s.append(c,i),r.appendChild(s);const d=document.createElement("div");d.className="content";const y=document.createElement("section");y.className="sectionCard";const x=document.createElement("p");x.className="sectionLabel",x.textContent=n.outputLanguage;const I=document.createElement("p");I.className="helperText",I.textContent=n.outputLanguageHint;const L=document.createElement("select");L.className="languageSelect",L.value=e.status==="idle"?g:e.targetLanguage;for(const p of R){const f=document.createElement("option");f.value=p.value,f.textContent=p.label,L.appendChild(f)}if(L.addEventListener("change",p=>{const f=M(p.target.value);g=f,chrome.storage.sync.set({preferredLanguage:f}),$(f)}),y.append(x,I,L),d.appendChild(y),e.status==="loading"){const p=document.createElement("div");p.className="loadingCard",p.innerHTML=`
      <div class="spinner" aria-hidden="true"></div>
      <p class="loadingText">${l(n.loadingSignals)}</p>
    `,d.appendChild(p)}if(e.status==="error"){const p=document.createElement("div");p.className="errorCard",p.innerHTML=`
      <p class="errorTitle">${l(n.analysisError)}</p>
      <p class="errorMessage">${l(e.message)}</p>
    `,d.appendChild(p)}if(e.status==="success"){const p=document.createElement("div");p.className="riskCard",p.innerHTML=`
      <div>
        <p class="sectionLabel">${l(n.fakeNewsPercentage)}</p>
        <p class="score">${e.data.riskScore}<span>%</span></p>
        <p class="helperText">${l(Z(e.data.riskScore))}</p>
      </div>
      <span class="riskBadge risk-${e.data.riskLevel}">${l(e.data.riskLevel)}</span>
    `,d.appendChild(p);const f=document.createElement("section");f.className="sectionCard",f.innerHTML=`
      <p class="sectionLabel">${l(n.verdict)}</p>
      <div class="statRow">
        <span class="statName">${l(n.falseRiskPercentage)}</span>
        <span class="statNumber">${e.data.riskScore}%</span>
      </div>
      <div class="statRow">
        <span class="statName">${l(n.truthLikelihoodPercentage)}</span>
        <span class="statNumber">${J(e.data.riskScore)}%</span>
      </div>
      <div class="statRow">
        <span class="statName">${l(n.wrongnessPercentage)}</span>
        <span class="statNumber">${ee(e.data.riskScore)}%</span>
      </div>
    `,d.appendChild(f);const U=document.createElement("section");U.className="sectionCard",U.innerHTML=`
      <p class="sectionLabel">${l(n.explanation)}</p>
      <p class="summaryText">${l(te(e.data.riskScore,e.targetLanguage))}</p>
    `,d.appendChild(U);const _=document.createElement("section");_.className="sectionCard",_.innerHTML=`
      <p class="sectionLabel">${l(n.topReasons)}</p>
      <p class="summaryText">${l(z(e.data.summary,360))}</p>
      <p class="helperText">${l(n.output)}: ${l(xe(e.targetLanguage))}</p>
    `,d.appendChild(_);const N=document.createElement("section");N.className="sectionCard";const F=document.createElement("p");F.className="sectionLabel",F.textContent=n.topReasons,N.appendChild(F);const S=document.createElement("div");S.className="reasons";const G=e.data.hiddenClauses.slice(0,3);if(G.length===0){const m=document.createElement("p");m.className="emptyText",m.textContent=n.noReasons,S.appendChild(m)}else for(const m of G){const E=document.createElement("article");E.className="reasonItem",E.innerHTML=`
          <div class="reasonHeader">
            <span class="reasonCategory">${l(m.category)}</span>
            <span class="severity severity-${m.severity}">${l(m.severity)}</span>
          </div>
          <p class="reasonExplanation">${l(z(m.explanation,180))}</p>
          <p class="reasonOriginal">${l(z(m.text,180))}</p>
        `,S.appendChild(E)}N.appendChild(S),d.appendChild(N);const O=document.createElement("section");O.className="sectionCard";const V=document.createElement("p");V.className="sectionLabel",V.textContent=n.readAloud;const j=document.createElement("div");j.className="actionRow";const v=document.createElement("button");v.type="button",v.className="secondaryButton",v.textContent=h==="playing"?n.pauseAudio:h==="paused"?n.resumeAudio:n.playAudio,v.addEventListener("click",()=>{const m=[e.data.summary,...G.map(E=>E.explanation)].join(". ");h==="playing"?(ie(),h="paused"):h==="paused"?(se(),h="playing"):(le(m,e.targetLanguage,()=>{h="idle",T(t,e,a)}),h="playing"),T(t,e,a)});const k=document.createElement("button");k.type="button",k.className="ghostButton",k.textContent=n.stop,k.disabled=h==="idle",k.addEventListener("click",()=>{H(),T(t,e,a)}),j.append(v,k),O.append(V,j),d.appendChild(O)}const C=document.createElement("button");C.type="button",C.className="primaryButton",C.textContent=n.scanPageAgain,C.addEventListener("click",()=>$(g)),d.appendChild(C),r.appendChild(d),t.appendChild(r)}function z(t,e){const a=X(t);return a.length<=e?a:`${a.slice(0,e-3).trimEnd()}...`}function l(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function M(t){return R.find(a=>a.value===t)?.value??"en"}function xe(t){return R.find(e=>e.value===t)?.label??"English"}function H(){W(),h="idle"}function ye(){return`
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      max-width: min(400px, 100vw);
      height: 100vh;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(circle at top, rgba(96, 165, 250, 0.22), transparent 28%),
        linear-gradient(180deg, #f8fbff 0%, #e9f2ff 100%);
      border-left: 1px solid #cfe1ff;
      box-shadow: -24px 0 48px rgba(37, 99, 235, 0.14);
      font-family: "Segoe UI", Arial, sans-serif;
      color: #0f2c55;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #d9e7ff;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
    }

    .eyebrow {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #2563eb;
    }

    .title {
      margin: 0;
      font-size: 22px;
      line-height: 1.15;
      font-weight: 700;
    }

    .subtitle {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.5;
      color: #52719d;
    }

    .closeButton {
      border: 1px solid #bfdbfe;
      background: #ffffff;
      color: #1d4ed8;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      flex: 0 0 auto;
    }

    .closeButton:hover {
      background: #eff6ff;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .riskCard,
    .sectionCard,
    .loadingCard,
    .errorCard {
      border-radius: 18px;
      border: 1px solid #d5e5ff;
      background: rgba(255, 255, 255, 0.92);
      padding: 16px;
      box-shadow: 0 10px 28px rgba(37, 99, 235, 0.08);
    }

    .riskCard {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .sectionLabel {
      margin: 0 0 8px;
      color: #315ea8;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .helperText,
    .summaryText,
    .reasonExplanation,
    .reasonOriginal,
    .emptyText,
    .errorMessage,
    .loadingText {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #163765;
    }

    .helperText,
    .reasonOriginal {
      color: #5377aa;
      font-size: 12px;
    }

    .score {
      margin: 0;
      font-size: 40px;
      line-height: 1;
      font-weight: 800;
    }

    .score span {
      font-size: 18px;
      color: #4e73a7;
      margin-left: 4px;
    }

    .riskBadge,
    .severity {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: capitalize;
    }

    .risk-low,
    .severity-low {
      background: #dcfce7;
      color: #166534;
    }

    .risk-medium,
    .severity-medium {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .risk-high,
    .severity-high {
      background: #fde68a;
      color: #b45309;
    }

    .risk-critical,
    .severity-critical {
      background: #fee2e2;
      color: #b91c1c;
    }

    .reasons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .statRow {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid #e2ecff;
    }

    .statName {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 700;
      color: #315ea8;
    }

    .statNumber {
      margin: 0;
      font-size: 22px;
      line-height: 1.1;
      font-weight: 800;
      color: #0f2c55;
    }

    .reasonItem {
      border-radius: 14px;
      padding: 14px;
      background: #f8fbff;
      border: 1px solid #dbeafe;
    }

    .reasonHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .reasonCategory {
      font-size: 13px;
      font-weight: 700;
      color: #17417a;
    }

    .loadingCard,
    .errorCard {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #dbeafe;
      border-top-color: #2563eb;
      animation: spin 0.8s linear infinite;
    }

    .errorTitle {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #991b1b;
    }

    .languageSelect,
    .primaryButton,
    .secondaryButton,
    .ghostButton {
      width: 100%;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
    }

    .languageSelect {
      border: 1px solid #bfdbfe;
      background: #f8fbff;
      color: #14325c;
      padding: 12px 14px;
      outline: none;
      margin-top: 10px;
    }

    .actionRow {
      display: flex;
      gap: 10px;
    }

    .primaryButton,
    .secondaryButton,
    .ghostButton {
      cursor: pointer;
      padding: 13px 14px;
    }

    .primaryButton {
      border: 0;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
    }

    .secondaryButton {
      border: 1px solid #93c5fd;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .ghostButton {
      border: 1px solid #d7e5ff;
      background: #ffffff;
      color: #4c6b9c;
    }

    .ghostButton:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}})();
