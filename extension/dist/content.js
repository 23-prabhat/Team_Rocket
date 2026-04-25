(function(){"use strict";const T=[{value:"en",label:"English"},{value:"hi",label:"Hindi"},{value:"mr",label:"Marathi"}],K={en:"en-US",hi:"hi-IN",mr:"mr-IN"},Y={en:{appTitle:"Misinformation Detector",appSubtitle:"Scan this page, estimate fake-news risk, and explain the result in your chosen language.",outputLanguage:"Output language",outputLanguageHint:"Choose how Veritron explains the result.",fakeNewsPercentage:"Fake-news percentage",falseRiskPercentage:"False risk",truthLikelihoodPercentage:"Truth chance",wrongnessPercentage:"Wrongness",verdict:"Verdict",explanation:"Explanation",output:"Output",topReasons:"Top reasons",noReasons:"No detailed reasons were returned for this page.",readAloud:"Read aloud",playAudio:"Play audio",pauseAudio:"Pause audio",resumeAudio:"Resume audio",stop:"Stop",refreshAnalysis:"Refresh analysis",scanPageAgain:"Scan page again",analyzeThisPage:"Analyze this page",noAnalysisStored:"No misinformation analysis is stored for this tab yet.",openRegularPage:"Open a regular http or https page to analyze it.",currentPage:"Current page",analysisError:"Analysis error",tryAgain:"Try again",loadingTab:"Loading current tab...",checkingPage:"Checking the page for suspicious claims...",loadingSignals:"Checking this page for misinformation signals...",pageNotFound:"No article-like content with enough text was found on this page.",likelyTrue:"Likely true",mixedClaims:"Mixed or unclear claims",likelyFalse:"Likely false",highFakeRisk:"High fake-news risk"},hi:{appTitle:"भ्रामक जानकारी जांच",appSubtitle:"इस पेज की जांच करें, फेक-न्यूज़ जोखिम देखें, और चुनी हुई भाषा में कारण समझें।",outputLanguage:"आउटपुट भाषा",outputLanguageHint:"वेरिट्रॉन परिणाम किस भाषा में समझाए, यह चुनें।",fakeNewsPercentage:"फेक न्यूज़ %",falseRiskPercentage:"गलत जोखिम",truthLikelihoodPercentage:"सही संभावना",wrongnessPercentage:"गलती %",verdict:"फैसला",explanation:"व्याख्या",output:"आउटपुट",topReasons:"मुख्य कारण",noReasons:"इस पेज के लिए विस्तृत कारण नहीं मिले।",readAloud:"सुनें",playAudio:"ऑडियो चलाएं",pauseAudio:"ऑडियो रोकें",resumeAudio:"ऑडियो फिर चलाएं",stop:"बंद करें",refreshAnalysis:"विश्लेषण फिर चलाएं",scanPageAgain:"पेज फिर स्कैन करें",analyzeThisPage:"इस पेज का विश्लेषण करें",noAnalysisStored:"इस टैब के लिए अभी कोई विश्लेषण सुरक्षित नहीं है।",openRegularPage:"विश्लेषण के लिए सामान्य http या https पेज खोलें।",currentPage:"मौजूदा पेज",analysisError:"विश्लेषण त्रुटि",tryAgain:"फिर कोशिश करें",loadingTab:"मौजूदा टैब लोड हो रहा है...",checkingPage:"संदिग्ध दावों के लिए पेज की जांच हो रही है...",loadingSignals:"इस पेज पर भ्रामक संकेत जांचे जा रहे हैं...",pageNotFound:"इस पेज पर पर्याप्त लेख-जैसा टेक्स्ट नहीं मिला।",likelyTrue:"संभवतः सही",mixedClaims:"मिश्रित या अस्पष्ट दावे",likelyFalse:"संभवतः गलत",highFakeRisk:"फेक न्यूज़ का उच्च जोखिम"},mr:{appTitle:"दिशाभूल तपास",appSubtitle:"हे पान स्कॅन करा, फेक-न्यूज धोका पहा, आणि निवडलेल्या भाषेत कारण समजा.",outputLanguage:"आउटपुट भाषा",outputLanguageHint:"व्हेरिट्रॉन निकाल कोणत्या भाषेत समजावेल ते निवडा.",fakeNewsPercentage:"फेक न्यूज %",falseRiskPercentage:"खोटे धोका",truthLikelihoodPercentage:"खरे शक्यता",wrongnessPercentage:"चुकी %",verdict:"निकाल",explanation:"स्पष्टीकरण",output:"आउटपुट",topReasons:"मुख्य कारणे",noReasons:"या पानासाठी सविस्तर कारणे मिळाली नाहीत.",readAloud:"मोठ्याने वाचा",playAudio:"ऑडिओ सुरू करा",pauseAudio:"ऑडिओ थांबवा",resumeAudio:"ऑडिओ पुन्हा सुरू करा",stop:"थांबवा",refreshAnalysis:"विश्लेषण पुन्हा करा",scanPageAgain:"पान पुन्हा स्कॅन करा",analyzeThisPage:"हे पान तपासा",noAnalysisStored:"या टॅबसाठी अजून विश्लेषण साठवलेले नाही.",openRegularPage:"विश्लेषणासाठी सामान्य http किंवा https पान उघडा.",currentPage:"सध्याचे पान",analysisError:"विश्लेषण त्रुटी",tryAgain:"पुन्हा प्रयत्न करा",loadingTab:"सध्याचा टॅब लोड होत आहे...",checkingPage:"संशयास्पद दाव्यांसाठी पान तपासले जात आहे...",loadingSignals:"या पानावरील दिशाभूल संकेत तपासले जात आहेत...",pageNotFound:"या पानावर पुरेसा लेखासारखा मजकूर सापडला नाही.",likelyTrue:"बहुधा खरे",mixedClaims:"मिश्रित किंवा अस्पष्ट दावे",likelyFalse:"बहुधा खोटे",highFakeRisk:"फेक न्यूजचा उच्च धोका"}};function Q(e){return e<=30?"Likely credible":e<=60?"Needs verification":e<=80?"Likely misleading":"High fake-news risk"}function S(e){return Y[e]??Y.en}function Z(e){return Math.max(0,100-D(e))}function J(e){return D(e)}function ee(e,t){const a=S(t);return e<=30?a.likelyTrue:e<=60?a.mixedClaims:e<=80?a.likelyFalse:a.highFakeRisk}function D(e){return Math.max(0,Math.min(100,Math.round(Number(e)||0)))}function V(){window.speechSynthesis?.cancel()}function te(){window.speechSynthesis?.pause()}function ne(){window.speechSynthesis?.resume()}function ae(e,t,a){V();const o=new SpeechSynthesisUtterance(e),n=K[t]??"en-US",l=window.speechSynthesis?.getVoices?.()??[],f=l.find(m=>m.lang.toLowerCase()===n.toLowerCase())??l.find(m=>m.lang.toLowerCase().startsWith(n.split("-")[0].toLowerCase()));o.lang=n,f&&(o.voice=f),o.rate=.95,o.onend=a,o.onerror=a,window.speechSynthesis?.speak(o)}const oe=12e3,re=300,W="veritron-extension-root",ie=["breaking","viral","exclusive","government","minister","police","election","health","cure","alert","claim","report","official","youtube","whatsapp","facebook","instagram","shocking","truth","fact","fake","misleading"],se=["article","[role='main']","main",".article",".post-content",".entry-content",".story",".content","body"];let x=null,s={status:"idle"},b=null,c="en",g="idle";chrome.runtime.onMessage.addListener(e=>{if(e.type==="TRIGGER_ANALYSIS"){N(e.targetLanguage);return}if(e.type==="ANALYSIS_RESULT"){b=window.location.href,c=$(e.data.language),s={status:"success",data:e.data,targetLanguage:c},R().render(s);return}e.type==="ANALYSIS_ERROR"&&(b=window.location.href,s={status:"error",message:e.message,targetLanguage:c},R().render(s))});function N(e){c=$(e);const t=R();if(t.open(),b===window.location.href&&s.status==="success"&&s.targetLanguage===c){t.render(s);return}if(b===window.location.href&&s.status==="loading"&&s.targetLanguage===c){t.render(s);return}s={status:"loading",targetLanguage:c},b=window.location.href,z(),t.render(s);const a=le();if(!a){const o=S(c).pageNotFound;s={status:"error",message:o,targetLanguage:c},t.render(s),chrome.runtime.sendMessage({type:"ANALYSIS_ERROR",message:o});return}chrome.runtime.sendMessage({type:"ANALYZE_REQUEST",text:a,url:window.location.href,targetLanguage:c})}function le(){let e=null;for(const t of se){const a=Array.from(document.querySelectorAll(t));for(const o of a){if(!de(o))continue;const n=q(ce(o));if(n.length<re)continue;const l=pe(n,t);(!e||l>e.score)&&(e={text:n.slice(0,oe),score:l})}}return e?.text??null}function q(e){return e.replace(/\b(accept all|reject all|sign in|log in|skip to content|share this|advertisement)\b/gi," ").replace(/\s+/g," ").trim()}function ce(e){const t=e.cloneNode(!0);t.querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form").forEach(o=>{o.remove()});const a=Array.from(t.querySelectorAll("p, h1, h2, h3, li")).map(o=>o.textContent?.trim()??"").filter(o=>o.length>0);return a.length>4?a.join(" "):t.innerText||t.textContent||""}function de(e){const t=window.getComputedStyle(e);return t.display!=="none"&&t.visibility!=="hidden"&&e.innerText.trim().length>0}function pe(e,t){const a=e.toLowerCase(),o=ie.reduce((m,h)=>m+(a.includes(h)?1:0),0),n=t==="article"||t==="main"||t==="[role='main']"?7:t==="body"?0:4,l=Math.min((e.match(/[.?!]/g)??[]).length,12),f=e.length>2500?6:e.length>1200?3:0;return o*3+n+l+f}function R(){if(x)return x;const e=document.getElementById(W);if(e?.shadowRoot){const l=e.shadowRoot.getElementById("veritron-sidebar");if(l)return x=X(e,l),x}const t=document.createElement("div");t.id=W,document.body.appendChild(t);const a=t.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=ge();const n=document.createElement("div");return n.id="veritron-sidebar",a.append(o,n),x=X(t,n),x}function X(e,t){const a={host:e,container:t,render:o=>v(t,o,a),open:()=>{e.style.display="block"},close:()=>{e.style.display="none",z()}};return a.render(s),a}function v(e,t,a){e.replaceChildren();const o=t.status==="idle"?c:t.targetLanguage,n=S(o),l=document.createElement("aside");l.className="panel";const f=document.createElement("div");f.className="header";const m=document.createElement("div");m.innerHTML=`
    <p class="eyebrow">Veritron</p>
    <h2 class="title">${r(n.appTitle)}</h2>
    <p class="subtitle">${r(n.appSubtitle)}</p>
  `;const h=document.createElement("button");h.type="button",h.className="closeButton",h.setAttribute("aria-label","Close sidebar"),h.textContent="X",h.addEventListener("click",()=>a.close()),f.append(m,h),l.appendChild(f);const d=document.createElement("div");d.className="content";const B=document.createElement("section");B.className="sectionCard";const H=document.createElement("p");H.className="sectionLabel",H.textContent=n.outputLanguage;const M=document.createElement("p");M.className="helperText",M.textContent=n.outputLanguageHint;const k=document.createElement("select");k.className="languageSelect",k.value=t.status==="idle"?c:t.targetLanguage;for(const i of T){const p=document.createElement("option");p.value=i.value,p.textContent=i.label,k.appendChild(p)}if(k.addEventListener("change",i=>{const p=$(i.target.value);c=p,chrome.storage.sync.set({preferredLanguage:p}),N(p)}),B.append(H,M,k),d.appendChild(B),t.status==="loading"){const i=document.createElement("div");i.className="loadingCard",i.innerHTML=`
      <div class="spinner" aria-hidden="true"></div>
      <p class="loadingText">${r(n.loadingSignals)}</p>
    `,d.appendChild(i)}if(t.status==="error"){const i=document.createElement("div");i.className="errorCard",i.innerHTML=`
      <p class="errorTitle">${r(n.analysisError)}</p>
      <p class="errorMessage">${r(t.message)}</p>
    `,d.appendChild(i)}if(t.status==="success"){const i=document.createElement("div");i.className="riskCard",i.innerHTML=`
      <div>
        <p class="sectionLabel">${r(n.fakeNewsPercentage)}</p>
        <p class="score">${t.data.riskScore}<span>%</span></p>
        <p class="helperText">${r(Q(t.data.riskScore))}</p>
      </div>
      <span class="riskBadge risk-${t.data.riskLevel}">${r(t.data.riskLevel)}</span>
    `,d.appendChild(i);const p=document.createElement("section");p.className="sectionCard",p.innerHTML=`
      <p class="sectionLabel">${r(n.verdict)}</p>
      <div class="statRow">
        <span class="statName">${r(n.falseRiskPercentage)}</span>
        <span class="statNumber">${t.data.riskScore}%</span>
      </div>
      <div class="statRow">
        <span class="statName">${r(n.truthLikelihoodPercentage)}</span>
        <span class="statNumber">${Z(t.data.riskScore)}%</span>
      </div>
      <div class="statRow">
        <span class="statName">${r(n.wrongnessPercentage)}</span>
        <span class="statNumber">${J(t.data.riskScore)}%</span>
      </div>
    `,d.appendChild(p);const I=document.createElement("section");I.className="sectionCard",I.innerHTML=`
      <p class="sectionLabel">${r(n.explanation)}</p>
      <p class="summaryText">${r(ee(t.data.riskScore,t.targetLanguage))}</p>
    `,d.appendChild(I);const _=document.createElement("section");_.className="sectionCard",_.innerHTML=`
      <p class="sectionLabel">${r(n.topReasons)}</p>
      <p class="summaryText">${r(P(t.data.summary,360))}</p>
      <p class="helperText">${r(n.output)}: ${r(ue(t.targetLanguage))}</p>
    `,d.appendChild(_);const E=document.createElement("section");E.className="sectionCard";const F=document.createElement("p");F.className="sectionLabel",F.textContent=n.topReasons,E.appendChild(F);const A=document.createElement("div");A.className="reasons";const U=t.data.hiddenClauses.slice(0,3);if(U.length===0){const u=document.createElement("p");u.className="emptyText",u.textContent=n.noReasons,A.appendChild(u)}else for(const u of U){const C=document.createElement("article");C.className="reasonItem",C.innerHTML=`
          <div class="reasonHeader">
            <span class="reasonCategory">${r(u.category)}</span>
            <span class="severity severity-${u.severity}">${r(u.severity)}</span>
          </div>
          <p class="reasonExplanation">${r(P(u.explanation,180))}</p>
          <p class="reasonOriginal">${r(P(u.text,180))}</p>
        `,A.appendChild(C)}E.appendChild(A),d.appendChild(E);const O=document.createElement("section");O.className="sectionCard";const G=document.createElement("p");G.className="sectionLabel",G.textContent=n.readAloud;const j=document.createElement("div");j.className="actionRow";const L=document.createElement("button");L.type="button",L.className="secondaryButton",L.textContent=g==="playing"?n.pauseAudio:g==="paused"?n.resumeAudio:n.playAudio,L.addEventListener("click",()=>{const u=[t.data.summary,...U.map(C=>C.explanation)].join(". ");g==="playing"?(te(),g="paused"):g==="paused"?(ne(),g="playing"):(ae(u,t.targetLanguage,()=>{g="idle",v(e,t,a)}),g="playing"),v(e,t,a)});const y=document.createElement("button");y.type="button",y.className="ghostButton",y.textContent=n.stop,y.disabled=g==="idle",y.addEventListener("click",()=>{z(),v(e,t,a)}),j.append(L,y),O.append(G,j),d.appendChild(O)}const w=document.createElement("button");w.type="button",w.className="primaryButton",w.textContent=n.scanPageAgain,w.addEventListener("click",()=>N(c)),d.appendChild(w),l.appendChild(d),e.appendChild(l)}function P(e,t){const a=q(e);return a.length<=t?a:`${a.slice(0,t-3).trimEnd()}...`}function r(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function $(e){return T.find(a=>a.value===e)?.value??"en"}function ue(e){return T.find(t=>t.value===e)?.label??"English"}function z(){V(),g="idle"}function ge(){return`
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
