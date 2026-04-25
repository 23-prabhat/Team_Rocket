(function(){"use strict";const $=[{value:"en",label:"English"},{value:"hi",label:"Hindi"},{value:"mr",label:"Marathi"}],ne={en:"en-US",hi:"hi-IN",mr:"mr-IN"},X={en:{appTitle:"Misinformation Detector",appSubtitle:"Scan this page, estimate fake-news risk, and explain the result in your chosen language.",outputLanguage:"Output language",outputLanguageHint:"Choose how Veritron explains the result.",fakeNewsPercentage:"Fake-news percentage",falseRiskPercentage:"False risk",truthLikelihoodPercentage:"Truth chance",wrongnessPercentage:"Wrongness",verdict:"Verdict",explanation:"Explanation",output:"Output",topReasons:"Top reasons",noReasons:"No detailed reasons were returned for this page.",readAloud:"Read aloud",playAudio:"Play audio",pauseAudio:"Pause audio",resumeAudio:"Resume audio",stop:"Stop",refreshAnalysis:"Refresh analysis",scanPageAgain:"Scan page again",analyzeThisPage:"Analyze this page",noAnalysisStored:"No misinformation analysis is stored for this tab yet.",openRegularPage:"Open a regular http or https page to analyze it.",currentPage:"Current page",analysisError:"Analysis error",tryAgain:"Try again",loadingTab:"Loading current tab...",checkingPage:"Checking the page for suspicious claims...",loadingSignals:"Checking this page for misinformation signals...",pageNotFound:"No article-like content with enough text was found on this page.",likelyTrue:"Likely true",mixedClaims:"Mixed or unclear claims",likelyFalse:"Likely false",highFakeRisk:"High fake-news risk"},hi:{appTitle:"भ्रामक जानकारी जांच",appSubtitle:"इस पेज की जांच करें, फेक-न्यूज़ जोखिम देखें, और चुनी हुई भाषा में कारण समझें।",outputLanguage:"आउटपुट भाषा",outputLanguageHint:"वेरिट्रॉन परिणाम किस भाषा में समझाए, यह चुनें।",fakeNewsPercentage:"फेक न्यूज़ %",falseRiskPercentage:"गलत जोखिम",truthLikelihoodPercentage:"सही संभावना",wrongnessPercentage:"गलती %",verdict:"फैसला",explanation:"व्याख्या",output:"आउटपुट",topReasons:"मुख्य कारण",noReasons:"इस पेज के लिए विस्तृत कारण नहीं मिले।",readAloud:"सुनें",playAudio:"ऑडियो चलाएं",pauseAudio:"ऑडियो रोकें",resumeAudio:"ऑडियो फिर चलाएं",stop:"बंद करें",refreshAnalysis:"विश्लेषण फिर चलाएं",scanPageAgain:"पेज फिर स्कैन करें",analyzeThisPage:"इस पेज का विश्लेषण करें",noAnalysisStored:"इस टैब के लिए अभी कोई विश्लेषण सुरक्षित नहीं है।",openRegularPage:"विश्लेषण के लिए सामान्य http या https पेज खोलें।",currentPage:"मौजूदा पेज",analysisError:"विश्लेषण त्रुटि",tryAgain:"फिर कोशिश करें",loadingTab:"मौजूदा टैब लोड हो रहा है...",checkingPage:"संदिग्ध दावों के लिए पेज की जांच हो रही है...",loadingSignals:"इस पेज पर भ्रामक संकेत जांचे जा रहे हैं...",pageNotFound:"इस पेज पर पर्याप्त लेख-जैसा टेक्स्ट नहीं मिला।",likelyTrue:"संभवतः सही",mixedClaims:"मिश्रित या अस्पष्ट दावे",likelyFalse:"संभवतः गलत",highFakeRisk:"फेक न्यूज़ का उच्च जोखिम"},mr:{appTitle:"दिशाभूल तपास",appSubtitle:"हे पान स्कॅन करा, फेक-न्यूज धोका पहा, आणि निवडलेल्या भाषेत कारण समजा.",outputLanguage:"आउटपुट भाषा",outputLanguageHint:"व्हेरिट्रॉन निकाल कोणत्या भाषेत समजावेल ते निवडा.",fakeNewsPercentage:"फेक न्यूज %",falseRiskPercentage:"खोटे धोका",truthLikelihoodPercentage:"खरे शक्यता",wrongnessPercentage:"चुकी %",verdict:"निकाल",explanation:"स्पष्टीकरण",output:"आउटपुट",topReasons:"मुख्य कारणे",noReasons:"या पानासाठी सविस्तर कारणे मिळाली नाहीत.",readAloud:"मोठ्याने वाचा",playAudio:"ऑडिओ सुरू करा",pauseAudio:"ऑडिओ थांबवा",resumeAudio:"ऑडिओ पुन्हा सुरू करा",stop:"थांबवा",refreshAnalysis:"विश्लेषण पुन्हा करा",scanPageAgain:"पान पुन्हा स्कॅन करा",analyzeThisPage:"हे पान तपासा",noAnalysisStored:"या टॅबसाठी अजून विश्लेषण साठवलेले नाही.",openRegularPage:"विश्लेषणासाठी सामान्य http किंवा https पान उघडा.",currentPage:"सध्याचे पान",analysisError:"विश्लेषण त्रुटी",tryAgain:"पुन्हा प्रयत्न करा",loadingTab:"सध्याचा टॅब लोड होत आहे...",checkingPage:"संशयास्पद दाव्यांसाठी पान तपासले जात आहे...",loadingSignals:"या पानावरील दिशाभूल संकेत तपासले जात आहेत...",pageNotFound:"या पानावर पुरेसा लेखासारखा मजकूर सापडला नाही.",likelyTrue:"बहुधा खरे",mixedClaims:"मिश्रित किंवा अस्पष्ट दावे",likelyFalse:"बहुधा खोटे",highFakeRisk:"फेक न्यूजचा उच्च धोका"}};function ae(t){return t<=30?"Likely credible":t<=60?"Needs verification":t<=80?"Likely misleading":"High fake-news risk"}function B(t){return X[t]??X.en}function ie(t){return Math.max(0,100-K(t))}function oe(t){return K(t)}function re(t,e){const a=B(e);return t<=30?a.likelyTrue:t<=60?a.mixedClaims:t<=80?a.likelyFalse:a.highFakeRisk}function K(t){return Math.max(0,Math.min(100,Math.round(Number(t)||0)))}let T=0,z=[],N=null,Q=!1;const M=new Map,se={en:["en-US","en-GB","en"],hi:["hi-IN","hi","en-IN","en-US"],mr:["mr-IN","mr","hi-IN","hi","en-IN","en-US"]};function H(){const t=window.speechSynthesis;if(!t?.getVoices)return[];const e=t.getVoices();return e.length>0&&(z=e,M.clear()),e}function le(){const t=window.speechSynthesis;!t?.addEventListener||Q||(Q=!0,t.addEventListener("voiceschanged",()=>{H()}))}async function ce(t=300){const e=window.speechSynthesis;if(!e?.getVoices)return[];if(z.length>0)return z;const a=H();return a.length>0?a:(N||(N=new Promise(o=>{let n=!1;const i=()=>{if(n)return;n=!0,e.removeEventListener("voiceschanged",s);const c=H();N=null,o(c)},s=()=>i();e.addEventListener("voiceschanged",s),window.setTimeout(i,t)})),N)}function de(t,e){const o=se[e].map(c=>c.toLowerCase()),n=t.find(c=>o.includes(c.lang.toLowerCase()));if(n)return n;const i=t.find(c=>o.some(r=>c.lang.toLowerCase().startsWith(r.split("-")[0])));return i||t.find(c=>{const r=`${c.name} ${c.lang}`.toLowerCase();return e==="hi"?r.includes("hindi"):e==="mr"?r.includes("marathi")||r.includes("hindi"):r.includes("english")})}function pe(t,e=220){const a=t.replace(/\s+/g," ").trim();if(!a)return[];const o=a.split(new RegExp("(?<=[.!?\\u0964])\\s+")).map(s=>s.trim()).filter(s=>s.length>0),n=[];let i="";for(const s of o){if(!i){i=s;continue}if(`${i} ${s}`.length<=e){i=`${i} ${s}`;continue}n.push(i),i=s}return i&&n.push(i),n.flatMap(s=>{if(s.length<=e)return[s];const c=[];for(let r=0;r<s.length;r+=e)c.push(s.slice(r,r+e).trim());return c.filter(r=>r.length>0)})}function Z(){T+=1,window.speechSynthesis?.cancel()}function ue(){window.speechSynthesis?.pause()}function ge(){window.speechSynthesis?.resume()}function fe(t,e,a){Z();const o=window.speechSynthesis;if(!o){a();return}const n=pe(t);if(n.length===0){a();return}const i=T,s=ne[e]??"en-US";(async()=>{le();const c=await ce();if(i!==T)return;const r=M.get(e),d=r&&c.includes(r)?r:de(c,e);d&&M.set(e,d);let y=0;const b=()=>{if(i!==T)return;if(y>=n.length){a();return}const x=new SpeechSynthesisUtterance(n[y]);x.lang=d?.lang??s,d&&(x.voice=d),x.rate=.95,x.onend=()=>{y+=1,b()},x.onerror=()=>{y+=1,b()},o.speak(x)};b()})()}const me=12e3,he=300,J="veritron-extension-root",xe=["breaking","viral","exclusive","government","minister","police","election","health","cure","alert","claim","report","official","youtube","whatsapp","facebook","instagram","shocking","truth","fact","fake","misleading"],ye=["article","[role='main']","main",".article",".post-content",".entry-content",".story",".content","body"];let w=null,u={status:"idle"},L=null,g="en",h="idle";chrome.runtime.onMessage.addListener(t=>{if(t.type==="TRIGGER_ANALYSIS"){I(t.targetLanguage);return}if(t.type==="ANALYSIS_RESULT"){L=window.location.href,g=F(t.data.language),u={status:"success",data:t.data,targetLanguage:g},U().render(u);return}t.type==="ANALYSIS_ERROR"&&(L=window.location.href,u={status:"error",message:t.message,targetLanguage:g},U().render(u))});function I(t){g=F(t);const e=U();if(e.open(),L===window.location.href&&u.status==="success"&&u.targetLanguage===g){e.render(u);return}if(L===window.location.href&&u.status==="loading"&&u.targetLanguage===g){e.render(u);return}u={status:"loading",targetLanguage:g},L=window.location.href,G(),e.render(u);const a=be();if(!a){const o=B(g).pageNotFound;u={status:"error",message:o,targetLanguage:g},e.render(u),chrome.runtime.sendMessage({type:"ANALYSIS_ERROR",message:o});return}chrome.runtime.sendMessage({type:"ANALYZE_REQUEST",text:a,url:window.location.href,targetLanguage:g})}function be(){let t=null;for(const e of ye){const a=Array.from(document.querySelectorAll(e));for(const o of a){if(!ke(o))continue;const n=ee(we(o));if(n.length<he)continue;const i=Le(n,e);(!t||i>t.score)&&(t={text:n.slice(0,me),score:i})}}return t?.text??null}function ee(t){return t.replace(/\b(accept all|reject all|sign in|log in|skip to content|share this|advertisement)\b/gi," ").replace(/\s+/g," ").trim()}function we(t){const e=t.cloneNode(!0);e.querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form").forEach(o=>{o.remove()});const a=Array.from(e.querySelectorAll("p, h1, h2, h3, li")).map(o=>o.textContent?.trim()??"").filter(o=>o.length>0);return a.length>4?a.join(" "):e.innerText||e.textContent||""}function ke(t){const e=window.getComputedStyle(t);return e.display!=="none"&&e.visibility!=="hidden"&&t.innerText.trim().length>0}function Le(t,e){const a=t.toLowerCase(),o=xe.reduce((c,r)=>c+(a.includes(r)?1:0),0),n=e==="article"||e==="main"||e==="[role='main']"?7:e==="body"?0:4,i=Math.min((t.match(/[.?!]/g)??[]).length,12),s=t.length>2500?6:t.length>1200?3:0;return o*3+n+i+s}function U(){if(w)return w;const t=document.getElementById(J);if(t?.shadowRoot){const i=t.shadowRoot.getElementById("veritron-sidebar");if(i)return w=te(t,i),w}const e=document.createElement("div");e.id=J,document.body.appendChild(e);const a=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=Ce();const n=document.createElement("div");return n.id="veritron-sidebar",a.append(o,n),w=te(e,n),w}function te(t,e){const a={host:t,container:e,render:o=>S(e,o,a),open:()=>{t.style.display="block"},close:()=>{t.style.display="none",G()}};return a.render(u),a}function S(t,e,a){t.replaceChildren();const o=e.status==="idle"?g:e.targetLanguage,n=B(o),i=document.createElement("aside");i.className="panel";const s=document.createElement("div");s.className="header";const c=document.createElement("div");c.innerHTML=`
    <p class="eyebrow">Veritron</p>
    <h2 class="title">${l(n.appTitle)}</h2>
    <p class="subtitle">${l(n.appSubtitle)}</p>
  `;const r=document.createElement("button");r.type="button",r.className="closeButton",r.setAttribute("aria-label","Close sidebar"),r.textContent="X",r.addEventListener("click",()=>a.close()),s.append(c,r),i.appendChild(s);const d=document.createElement("div");d.className="content";const y=document.createElement("section");y.className="sectionCard";const b=document.createElement("p");b.className="sectionLabel",b.textContent=n.outputLanguage;const x=document.createElement("p");x.className="helperText",x.textContent=n.outputLanguageHint;const v=document.createElement("select");v.className="languageSelect",v.value=e.status==="idle"?g:e.targetLanguage;for(const p of $){const f=document.createElement("option");f.value=p.value,f.textContent=p.label,v.appendChild(f)}if(v.addEventListener("change",p=>{const f=F(p.target.value);g=f,chrome.storage.sync.set({preferredLanguage:f}),I(f)}),y.append(b,x,v),d.appendChild(y),e.status==="loading"){const p=document.createElement("div");p.className="loadingCard",p.innerHTML=`
      <div class="spinner" aria-hidden="true"></div>
      <p class="loadingText">${l(n.loadingSignals)}</p>
    `,d.appendChild(p)}if(e.status==="error"){const p=document.createElement("div");p.className="errorCard",p.innerHTML=`
      <p class="errorTitle">${l(n.analysisError)}</p>
      <p class="errorMessage">${l(e.message)}</p>
    `,d.appendChild(p)}if(e.status==="success"){const p=document.createElement("div");p.className="riskCard",p.innerHTML=`
      <div>
        <p class="sectionLabel">${l(n.fakeNewsPercentage)}</p>
        <p class="score">${e.data.riskScore}<span>%</span></p>
        <p class="helperText">${l(ae(e.data.riskScore))}</p>
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
        <span class="statNumber">${ie(e.data.riskScore)}%</span>
      </div>
      <div class="statRow">
        <span class="statName">${l(n.wrongnessPercentage)}</span>
        <span class="statNumber">${oe(e.data.riskScore)}%</span>
      </div>
    `,d.appendChild(f);const O=document.createElement("section");O.className="sectionCard",O.innerHTML=`
      <p class="sectionLabel">${l(n.explanation)}</p>
      <p class="summaryText">${l(re(e.data.riskScore,e.targetLanguage))}</p>
    `,d.appendChild(O);const V=document.createElement("section");V.className="sectionCard",V.innerHTML=`
      <p class="sectionLabel">${l(n.topReasons)}</p>
      <p class="summaryText">${l(_(e.data.summary,360))}</p>
      <p class="helperText">${l(n.output)}: ${l(ve(e.targetLanguage))}</p>
    `,d.appendChild(V);const R=document.createElement("section");R.className="sectionCard";const j=document.createElement("p");j.className="sectionLabel",j.textContent=n.topReasons,R.appendChild(j);const P=document.createElement("div");P.className="reasons";const Y=e.data.hiddenClauses.slice(0,3);if(Y.length===0){const m=document.createElement("p");m.className="emptyText",m.textContent=n.noReasons,P.appendChild(m)}else for(const m of Y){const A=document.createElement("article");A.className="reasonItem",A.innerHTML=`
          <div class="reasonHeader">
            <span class="reasonCategory">${l(m.category)}</span>
            <span class="severity severity-${m.severity}">${l(m.severity)}</span>
          </div>
          <p class="reasonExplanation">${l(_(m.explanation,180))}</p>
          <p class="reasonOriginal">${l(_(m.text,180))}</p>
        `,P.appendChild(A)}R.appendChild(P),d.appendChild(R);const D=document.createElement("section");D.className="sectionCard";const W=document.createElement("p");W.className="sectionLabel",W.textContent=n.readAloud;const q=document.createElement("div");q.className="actionRow";const E=document.createElement("button");E.type="button",E.className="secondaryButton",E.textContent=h==="playing"?n.pauseAudio:h==="paused"?n.resumeAudio:n.playAudio,E.addEventListener("click",()=>{const m=[e.data.summary,...Y.map(A=>A.explanation)].join(". ");h==="playing"?(ue(),h="paused"):h==="paused"?(ge(),h="playing"):(fe(m,e.targetLanguage,()=>{h="idle",S(t,e,a)}),h="playing"),S(t,e,a)});const k=document.createElement("button");k.type="button",k.className="ghostButton",k.textContent=n.stop,k.disabled=h==="idle",k.addEventListener("click",()=>{G(),S(t,e,a)}),q.append(E,k),D.append(W,q),d.appendChild(D)}const C=document.createElement("button");C.type="button",C.className="primaryButton",C.textContent=n.scanPageAgain,C.addEventListener("click",()=>I(g)),d.appendChild(C),i.appendChild(d),t.appendChild(i)}function _(t,e){const a=ee(t);return a.length<=e?a:`${a.slice(0,e-3).trimEnd()}...`}function l(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function F(t){return $.find(a=>a.value===t)?.value??"en"}function ve(t){return $.find(e=>e.value===t)?.label??"English"}function G(){Z(),h="idle"}function Ce(){return`
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
