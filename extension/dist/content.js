(function(){"use strict";const B=[{value:"en",label:"English"},{value:"hi",label:"Hindi"},{value:"mr",label:"Marathi"}],te={en:"en-US",hi:"hi-IN",mr:"mr-IN"},W={en:{appTitle:"Misinformation Detector",appSubtitle:"Scan this page, estimate fake-news risk, and explain the result in your chosen language.",outputLanguage:"Output language",outputLanguageHint:"Choose how Veritron explains the result.",fakeNewsPercentage:"Fake-news percentage",falseRiskPercentage:"False risk",truthLikelihoodPercentage:"Truth chance",wrongnessPercentage:"Wrongness",verdict:"Verdict",explanation:"Explanation",output:"Output",topReasons:"Top reasons",noReasons:"No detailed reasons were returned for this page.",readAloud:"Read aloud",playAudio:"Play audio",pauseAudio:"Pause audio",resumeAudio:"Resume audio",stop:"Stop",refreshAnalysis:"Refresh analysis",scanPageAgain:"Scan page again",analyzeThisPage:"Analyze this page",noAnalysisStored:"No misinformation analysis is stored for this tab yet.",openRegularPage:"Open a regular http or https page to analyze it.",currentPage:"Current page",analysisError:"Analysis error",tryAgain:"Try again",loadingTab:"Loading current tab...",checkingPage:"Checking the page for suspicious claims...",loadingSignals:"Checking this page for misinformation signals...",pageNotFound:"No article-like content with enough text was found on this page.",likelyTrue:"Likely true",mixedClaims:"Mixed or unclear claims",likelyFalse:"Likely false",highFakeRisk:"High fake-news risk"},hi:{appTitle:"भ्रामक जानकारी जांच",appSubtitle:"इस पेज की जांच करें, फेक-न्यूज़ जोखिम देखें, और चुनी हुई भाषा में कारण समझें।",outputLanguage:"आउटपुट भाषा",outputLanguageHint:"वेरिट्रॉन परिणाम किस भाषा में समझाए, यह चुनें।",fakeNewsPercentage:"फेक न्यूज़ %",falseRiskPercentage:"गलत जोखिम",truthLikelihoodPercentage:"सही संभावना",wrongnessPercentage:"गलती %",verdict:"फैसला",explanation:"व्याख्या",output:"आउटपुट",topReasons:"मुख्य कारण",noReasons:"इस पेज के लिए विस्तृत कारण नहीं मिले।",readAloud:"सुनें",playAudio:"ऑडियो चलाएं",pauseAudio:"ऑडियो रोकें",resumeAudio:"ऑडियो फिर चलाएं",stop:"बंद करें",refreshAnalysis:"विश्लेषण फिर चलाएं",scanPageAgain:"पेज फिर स्कैन करें",analyzeThisPage:"इस पेज का विश्लेषण करें",noAnalysisStored:"इस टैब के लिए अभी कोई विश्लेषण सुरक्षित नहीं है।",openRegularPage:"विश्लेषण के लिए सामान्य http या https पेज खोलें।",currentPage:"मौजूदा पेज",analysisError:"विश्लेषण त्रुटि",tryAgain:"फिर कोशिश करें",loadingTab:"मौजूदा टैब लोड हो रहा है...",checkingPage:"संदिग्ध दावों के लिए पेज की जांच हो रही है...",loadingSignals:"इस पेज पर भ्रामक संकेत जांचे जा रहे हैं...",pageNotFound:"इस पेज पर पर्याप्त लेख-जैसा टेक्स्ट नहीं मिला।",likelyTrue:"संभवतः सही",mixedClaims:"मिश्रित या अस्पष्ट दावे",likelyFalse:"संभवतः गलत",highFakeRisk:"फेक न्यूज़ का उच्च जोखिम"},mr:{appTitle:"दिशाभूल तपास",appSubtitle:"हे पान स्कॅन करा, फेक-न्यूज धोका पहा, आणि निवडलेल्या भाषेत कारण समजा.",outputLanguage:"आउटपुट भाषा",outputLanguageHint:"व्हेरिट्रॉन निकाल कोणत्या भाषेत समजावेल ते निवडा.",fakeNewsPercentage:"फेक न्यूज %",falseRiskPercentage:"खोटे धोका",truthLikelihoodPercentage:"खरे शक्यता",wrongnessPercentage:"चुकी %",verdict:"निकाल",explanation:"स्पष्टीकरण",output:"आउटपुट",topReasons:"मुख्य कारणे",noReasons:"या पानासाठी सविस्तर कारणे मिळाली नाहीत.",readAloud:"मोठ्याने वाचा",playAudio:"ऑडिओ सुरू करा",pauseAudio:"ऑडिओ थांबवा",resumeAudio:"ऑडिओ पुन्हा सुरू करा",stop:"थांबवा",refreshAnalysis:"विश्लेषण पुन्हा करा",scanPageAgain:"पान पुन्हा स्कॅन करा",analyzeThisPage:"हे पान तपासा",noAnalysisStored:"या टॅबसाठी अजून विश्लेषण साठवलेले नाही.",openRegularPage:"विश्लेषणासाठी सामान्य http किंवा https पान उघडा.",currentPage:"सध्याचे पान",analysisError:"विश्लेषण त्रुटी",tryAgain:"पुन्हा प्रयत्न करा",loadingTab:"सध्याचा टॅब लोड होत आहे...",checkingPage:"संशयास्पद दाव्यांसाठी पान तपासले जात आहे...",loadingSignals:"या पानावरील दिशाभूल संकेत तपासले जात आहेत...",pageNotFound:"या पानावर पुरेसा लेखासारखा मजकूर सापडला नाही.",likelyTrue:"बहुधा खरे",mixedClaims:"मिश्रित किंवा अस्पष्ट दावे",likelyFalse:"बहुधा खोटे",highFakeRisk:"फेक न्यूजचा उच्च धोका"}};function ne(t){return t<=30?"Likely credible":t<=60?"Needs verification":t<=80?"Likely misleading":"High fake-news risk"}function z(t){return W[t]??W.en}function X(t,e){const n=z(e);return t<=30?n.likelyTrue:t<=60?n.mixedClaims:t<=80?n.likelyFalse:n.highFakeRisk}let T=0,$=[],S=null,K=!1;const I=new Map,ae={en:["en-US","en-GB","en"],hi:["hi-IN","hi","en-IN","en-US"],mr:["mr-IN","mr","hi-IN","hi","en-IN","en-US"]};function H(){const t=window.speechSynthesis;if(!t?.getVoices)return[];const e=t.getVoices();return e.length>0&&($=e,I.clear()),e}function ie(){const t=window.speechSynthesis;!t?.addEventListener||K||(K=!0,t.addEventListener("voiceschanged",()=>{H()}))}async function oe(t=300){const e=window.speechSynthesis;if(!e?.getVoices)return[];if($.length>0)return $;const n=H();return n.length>0?n:(S||(S=new Promise(o=>{let a=!1;const i=()=>{if(a)return;a=!0,e.removeEventListener("voiceschanged",s);const l=H();S=null,o(l)},s=()=>i();e.addEventListener("voiceschanged",s),window.setTimeout(i,t)})),S)}function re(t,e){const o=ae[e].map(l=>l.toLowerCase()),a=t.find(l=>o.includes(l.lang.toLowerCase()));if(a)return a;const i=t.find(l=>o.some(r=>l.lang.toLowerCase().startsWith(r.split("-")[0])));return i||t.find(l=>{const r=`${l.name} ${l.lang}`.toLowerCase();return e==="hi"?r.includes("hindi"):e==="mr"?r.includes("marathi")||r.includes("hindi"):r.includes("english")})}function se(t,e=220){const n=t.replace(/\s+/g," ").trim();if(!n)return[];const o=n.split(new RegExp("(?<=[.!?\\u0964])\\s+")).map(s=>s.trim()).filter(s=>s.length>0),a=[];let i="";for(const s of o){if(!i){i=s;continue}if(`${i} ${s}`.length<=e){i=`${i} ${s}`;continue}a.push(i),i=s}return i&&a.push(i),a.flatMap(s=>{if(s.length<=e)return[s];const l=[];for(let r=0;r<s.length;r+=e)l.push(s.slice(r,r+e).trim());return l.filter(r=>r.length>0)})}function Q(){T+=1,window.speechSynthesis?.cancel()}function le(){window.speechSynthesis?.pause()}function ce(){window.speechSynthesis?.resume()}function de(t,e,n){Q();const o=window.speechSynthesis;if(!o){n();return}const a=se(t);if(a.length===0){n();return}const i=T,s=te[e]??"en-US";(async()=>{ie();const l=await oe();if(i!==T)return;const r=I.get(e),d=r&&l.includes(r)?r:re(l,e);d&&I.set(e,d);let y=0;const b=()=>{if(i!==T)return;if(y>=a.length){n();return}const x=new SpeechSynthesisUtterance(a[y]);x.lang=d?.lang??s,d&&(x.voice=d),x.rate=.95,x.onend=()=>{y+=1,b()},x.onerror=()=>{y+=1,b()},o.speak(x)};b()})()}const pe=12e3,ue=300,Z="veritron-extension-root",ge=["breaking","viral","exclusive","government","minister","police","election","health","cure","alert","claim","report","official","youtube","whatsapp","facebook","instagram","shocking","truth","fact","fake","misleading"],fe=["article","[role='main']","main",".article",".post-content",".entry-content",".story",".content","body"];let w=null,u={status:"idle"},L=null,g="en",h="idle";chrome.runtime.onMessage.addListener(t=>{if(t.type==="TRIGGER_ANALYSIS"){M(t.targetLanguage);return}if(t.type==="ANALYSIS_RESULT"){L=window.location.href,g=F(t.data.language),u={status:"success",data:t.data,targetLanguage:g},U().render(u);return}t.type==="ANALYSIS_ERROR"&&(L=window.location.href,u={status:"error",message:t.message,targetLanguage:g},U().render(u))});function M(t){g=F(t);const e=U();if(e.open(),L===window.location.href&&u.status==="success"&&u.targetLanguage===g){e.render(u);return}if(L===window.location.href&&u.status==="loading"&&u.targetLanguage===g){e.render(u);return}u={status:"loading",targetLanguage:g},L=window.location.href,G(),e.render(u);const n=me();if(!n){const o=z(g).pageNotFound;u={status:"error",message:o,targetLanguage:g},e.render(u),chrome.runtime.sendMessage({type:"ANALYSIS_ERROR",message:o});return}chrome.runtime.sendMessage({type:"ANALYZE_REQUEST",text:n,url:window.location.href,targetLanguage:g})}function me(){let t=null;for(const e of fe){const n=Array.from(document.querySelectorAll(e));for(const o of n){if(!xe(o))continue;const a=J(he(o));if(a.length<ue)continue;const i=ye(a,e);(!t||i>t.score)&&(t={text:a.slice(0,pe),score:i})}}return t?.text??null}function J(t){return t.replace(/\b(accept all|reject all|sign in|log in|skip to content|share this|advertisement)\b/gi," ").replace(/\s+/g," ").trim()}function he(t){const e=t.cloneNode(!0);e.querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form").forEach(o=>{o.remove()});const n=Array.from(e.querySelectorAll("p, h1, h2, h3, li")).map(o=>o.textContent?.trim()??"").filter(o=>o.length>0);return n.length>4?n.join(" "):e.innerText||e.textContent||""}function xe(t){const e=window.getComputedStyle(t);return e.display!=="none"&&e.visibility!=="hidden"&&t.innerText.trim().length>0}function ye(t,e){const n=t.toLowerCase(),o=ge.reduce((l,r)=>l+(n.includes(r)?1:0),0),a=e==="article"||e==="main"||e==="[role='main']"?7:e==="body"?0:4,i=Math.min((t.match(/[.?!]/g)??[]).length,12),s=t.length>2500?6:t.length>1200?3:0;return o*3+a+i+s}function U(){if(w)return w;const t=document.getElementById(Z);if(t?.shadowRoot){const i=t.shadowRoot.getElementById("veritron-sidebar");if(i)return w=ee(t,i),w}const e=document.createElement("div");e.id=Z,document.body.appendChild(e);const n=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=we();const a=document.createElement("div");return a.id="veritron-sidebar",n.append(o,a),w=ee(e,a),w}function ee(t,e){const n={host:t,container:e,render:o=>N(e,o,n),open:()=>{t.style.display="block"},close:()=>{t.style.display="none",G()}};return n.render(u),n}function N(t,e,n){t.replaceChildren();const o=e.status==="idle"?g:e.targetLanguage,a=z(o),i=document.createElement("aside");i.className="panel";const s=document.createElement("div");s.className="header";const l=document.createElement("div");l.innerHTML=`
    <p class="eyebrow">Veritron</p>
    <h2 class="title">${c(a.appTitle)}</h2>
    <p class="subtitle">${c(a.appSubtitle)}</p>
  `;const r=document.createElement("button");r.type="button",r.className="closeButton",r.setAttribute("aria-label","Close sidebar"),r.textContent="X",r.addEventListener("click",()=>n.close()),s.append(l,r),i.appendChild(s);const d=document.createElement("div");d.className="content";const y=document.createElement("section");y.className="sectionCard";const b=document.createElement("p");b.className="sectionLabel",b.textContent=a.outputLanguage;const x=document.createElement("p");x.className="helperText",x.textContent=a.outputLanguageHint;const C=document.createElement("select");C.className="languageSelect",C.value=e.status==="idle"?g:e.targetLanguage;for(const p of B){const f=document.createElement("option");f.value=p.value,f.textContent=p.label,C.appendChild(f)}if(C.addEventListener("change",p=>{const f=F(p.target.value);g=f,chrome.storage.sync.set({preferredLanguage:f}),M(f)}),y.append(b,x,C),d.appendChild(y),e.status==="loading"){const p=document.createElement("div");p.className="loadingCard",p.innerHTML=`
      <div class="spinner" aria-hidden="true"></div>
      <p class="loadingText">${c(a.loadingSignals)}</p>
    `,d.appendChild(p)}if(e.status==="error"){const p=document.createElement("div");p.className="errorCard",p.innerHTML=`
      <p class="errorTitle">${c(a.analysisError)}</p>
      <p class="errorMessage">${c(e.message)}</p>
    `,d.appendChild(p)}if(e.status==="success"){const p=document.createElement("div");p.className="riskCard",p.innerHTML=`
      <div>
        <p class="sectionLabel">${c(a.verdict)}</p>
        <p class="summaryText">${c(X(e.data.riskScore,e.targetLanguage))}</p>
        <p class="helperText">${c(ne(e.data.riskScore))}</p>
      </div>
      <span class="riskBadge risk-${e.data.riskLevel}">${c(e.data.riskLevel)}</span>
    `,d.appendChild(p);const f=document.createElement("section");f.className="sectionCard",f.innerHTML=`
      <p class="sectionLabel">${c(a.explanation)}</p>
      <p class="summaryText">${c(X(e.data.riskScore,e.targetLanguage))}</p>
    `,d.appendChild(f);const O=document.createElement("section");O.className="sectionCard",O.innerHTML=`
      <p class="sectionLabel">${c(a.topReasons)}</p>
      <p class="summaryText">${c(_(e.data.summary,360))}</p>
      <p class="helperText">${c(a.output)}: ${c(be(e.targetLanguage))}</p>
    `,d.appendChild(O);const R=document.createElement("section");R.className="sectionCard";const V=document.createElement("p");V.className="sectionLabel",V.textContent=a.topReasons,R.appendChild(V);const P=document.createElement("div");P.className="reasons";const j=e.data.hiddenClauses.slice(0,3);if(j.length===0){const m=document.createElement("p");m.className="emptyText",m.textContent=a.noReasons,P.appendChild(m)}else for(const m of j){const A=document.createElement("article");A.className="reasonItem",A.innerHTML=`
          <div class="reasonHeader">
            <span class="reasonCategory">${c(m.category)}</span>
            <span class="severity severity-${m.severity}">${c(m.severity)}</span>
          </div>
          <p class="reasonExplanation">${c(_(m.explanation,180))}</p>
          <p class="reasonOriginal">${c(_(m.text,180))}</p>
        `,P.appendChild(A)}R.appendChild(P),d.appendChild(R);const Y=document.createElement("section");Y.className="sectionCard";const D=document.createElement("p");D.className="sectionLabel",D.textContent=a.readAloud;const q=document.createElement("div");q.className="actionRow";const E=document.createElement("button");E.type="button",E.className="secondaryButton",E.textContent=h==="playing"?a.pauseAudio:h==="paused"?a.resumeAudio:a.playAudio,E.addEventListener("click",()=>{const m=[e.data.summary,...j.map(A=>A.explanation)].join(". ");h==="playing"?(le(),h="paused"):h==="paused"?(ce(),h="playing"):(de(m,e.targetLanguage,()=>{h="idle",N(t,e,n)}),h="playing"),N(t,e,n)});const k=document.createElement("button");k.type="button",k.className="ghostButton",k.textContent=a.stop,k.disabled=h==="idle",k.addEventListener("click",()=>{G(),N(t,e,n)}),q.append(E,k),Y.append(D,q),d.appendChild(Y)}const v=document.createElement("button");v.type="button",v.className="primaryButton",v.textContent=a.scanPageAgain,v.addEventListener("click",()=>M(g)),d.appendChild(v),i.appendChild(d),t.appendChild(i)}function _(t,e){const n=J(t);return n.length<=e?n:`${n.slice(0,e-3).trimEnd()}...`}function c(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function F(t){return B.find(n=>n.value===t)?.value??"en"}function be(t){return B.find(e=>e.value===t)?.label??"English"}function G(){Q(),h="idle"}function we(){return`
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
