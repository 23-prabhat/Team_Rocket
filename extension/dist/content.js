(function(){"use strict";const S=[{value:"en",label:"English"},{value:"hi",label:"Hindi"},{value:"mr",label:"Marathi"}],Y={en:"en-US",hi:"hi-IN",mr:"mr-IN"};function D(t){return t<=30?"Likely credible":t<=60?"Needs verification":t<=80?"Likely misleading":"High fake-news risk"}function O(){window.speechSynthesis?.cancel()}function q(){window.speechSynthesis?.pause()}function F(){window.speechSynthesis?.resume()}function X(t,e,n){O();const a=new SpeechSynthesisUtterance(t);a.lang=Y[e]??"en-US",a.rate=.95,a.onend=n,a.onerror=n,window.speechSynthesis?.speak(a)}const W=12e3,K=300,$="veritron-extension-root",Q=["breaking","viral","exclusive","government","minister","police","election","health","cure","alert","claim","report","official","youtube","whatsapp","facebook","instagram","shocking","truth","fact","fake","misleading"],V=["article","[role='main']","main",".article",".post-content",".entry-content",".story",".content","body"];let m=null,r={status:"idle"},x=null,s="en",p="idle";chrome.runtime.onMessage.addListener(t=>{if(t.type==="TRIGGER_ANALYSIS"){T(t.targetLanguage);return}if(t.type==="ANALYSIS_RESULT"){x=window.location.href,s=B(t.data.language),r={status:"success",data:t.data,targetLanguage:s},N().render(r);return}t.type==="ANALYSIS_ERROR"&&(x=window.location.href,r={status:"error",message:t.message,targetLanguage:s},N().render(r))});function T(t){s=B(t);const e=N();if(e.open(),x===window.location.href&&r.status==="success"&&r.targetLanguage===s){e.render(r);return}if(x===window.location.href&&r.status==="loading"&&r.targetLanguage===s){e.render(r);return}r={status:"loading",targetLanguage:s},x=window.location.href,R(),e.render(r);const n=Z();if(!n){const a="No article-like content with enough text was found on this page.";r={status:"error",message:a,targetLanguage:s},e.render(r),chrome.runtime.sendMessage({type:"ANALYSIS_ERROR",message:a});return}chrome.runtime.sendMessage({type:"ANALYZE_REQUEST",text:n,url:window.location.href,targetLanguage:s})}function Z(){let t=null;for(const e of V){const n=Array.from(document.querySelectorAll(e));for(const a of n){if(!ee(a))continue;const i=P(J(a));if(i.length<K)continue;const u=te(i,e);(!t||u>t.score)&&(t={text:i.slice(0,W),score:u})}}return t?.text??null}function P(t){return t.replace(/\b(accept all|reject all|sign in|log in|skip to content|share this|advertisement)\b/gi," ").replace(/\s+/g," ").trim()}function J(t){const e=t.cloneNode(!0);e.querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form").forEach(a=>{a.remove()});const n=Array.from(e.querySelectorAll("p, h1, h2, h3, li")).map(a=>a.textContent?.trim()??"").filter(a=>a.length>0);return n.length>4?n.join(" "):e.innerText||e.textContent||""}function ee(t){const e=window.getComputedStyle(t);return e.display!=="none"&&e.visibility!=="hidden"&&t.innerText.trim().length>0}function te(t,e){const n=t.toLowerCase(),a=Q.reduce((l,b)=>l+(n.includes(b)?1:0),0),i=e==="article"||e==="main"||e==="[role='main']"?7:e==="body"?0:4,u=Math.min((t.match(/[.?!]/g)??[]).length,12),f=t.length>2500?6:t.length>1200?3:0;return a*3+i+u+f}function N(){if(m)return m;const t=document.getElementById($);if(t?.shadowRoot){const u=t.shadowRoot.getElementById("veritron-sidebar");if(u)return m=j(t,u),m}const e=document.createElement("div");e.id=$,document.body.appendChild(e);const n=e.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=ae();const i=document.createElement("div");return i.id="veritron-sidebar",n.append(a,i),m=j(e,i),m}function j(t,e){const n={host:t,container:e,render:a=>v(e,a,n),open:()=>{t.style.display="block"},close:()=>{t.style.display="none",R()}};return n.render(r),n}function v(t,e,n){t.replaceChildren();const a=document.createElement("aside");a.className="panel";const i=document.createElement("div");i.className="header";const u=document.createElement("div");u.innerHTML=`
    <p class="eyebrow">Veritron</p>
    <h2 class="title">Misinformation Scan</h2>
    <p class="subtitle">Regional-language fake news analysis for the current page.</p>
  `;const f=document.createElement("button");f.type="button",f.className="closeButton",f.setAttribute("aria-label","Close sidebar"),f.textContent="X",f.addEventListener("click",()=>n.close()),i.append(u,f),a.appendChild(i);const l=document.createElement("div");l.className="content";const b=document.createElement("section");b.className="sectionCard";const z=document.createElement("p");z.className="sectionLabel",z.textContent="Output language";const I=document.createElement("p");I.className="helperText",I.textContent="Switch the explanation language and rerun the scan.";const y=document.createElement("select");y.className="languageSelect",y.value=e.status==="idle"?s:e.targetLanguage;for(const o of S){const c=document.createElement("option");c.value=o.value,c.textContent=o.label,y.appendChild(c)}if(y.addEventListener("change",o=>{const c=B(o.target.value);s=c,chrome.storage.sync.set({preferredLanguage:c}),T(c)}),b.append(z,I,y),l.appendChild(b),e.status==="loading"){const o=document.createElement("div");o.className="loadingCard",o.innerHTML=`
      <div class="spinner" aria-hidden="true"></div>
      <p class="loadingText">Checking this page for misinformation signals...</p>
    `,l.appendChild(o)}if(e.status==="error"){const o=document.createElement("div");o.className="errorCard",o.innerHTML=`
      <p class="errorTitle">Analysis failed</p>
      <p class="errorMessage">${g(e.message)}</p>
    `,l.appendChild(o)}if(e.status==="success"){const o=document.createElement("div");o.className="riskCard",o.innerHTML=`
      <div>
        <p class="sectionLabel">Fake news percentage</p>
        <p class="score">${e.data.riskScore}<span>%</span></p>
        <p class="helperText">${g(D(e.data.riskScore))}</p>
      </div>
      <span class="riskBadge risk-${e.data.riskLevel}">${g(e.data.riskLevel)}</span>
    `,l.appendChild(o);const c=document.createElement("section");c.className="sectionCard",c.innerHTML=`
      <p class="sectionLabel">Why it was flagged</p>
      <p class="summaryText">${g(A(e.data.summary,360))}</p>
      <p class="helperText">Output language: ${g(ne(e.targetLanguage))}</p>
    `,l.appendChild(c);const L=document.createElement("section");L.className="sectionCard";const _=document.createElement("p");_.className="sectionLabel",_.textContent="Key reasons",L.appendChild(_);const k=document.createElement("div");k.className="reasons";const H=e.data.hiddenClauses.slice(0,3);if(H.length===0){const d=document.createElement("p");d.className="emptyText",d.textContent="No detailed reasons were returned for this page.",k.appendChild(d)}else for(const d of H){const C=document.createElement("article");C.className="reasonItem",C.innerHTML=`
          <div class="reasonHeader">
            <span class="reasonCategory">${g(d.category)}</span>
            <span class="severity severity-${d.severity}">${g(d.severity)}</span>
          </div>
          <p class="reasonExplanation">${g(A(d.explanation,180))}</p>
          <p class="reasonOriginal">${g(A(d.text,180))}</p>
        `,k.appendChild(C)}L.appendChild(k),l.appendChild(L);const M=document.createElement("section");M.className="sectionCard";const U=document.createElement("p");U.className="sectionLabel",U.textContent="Read aloud";const G=document.createElement("div");G.className="actionRow";const w=document.createElement("button");w.type="button",w.className="secondaryButton",w.textContent=p==="playing"?"Pause audio":p==="paused"?"Resume audio":"Play audio",w.addEventListener("click",()=>{const d=[e.data.summary,...H.map(C=>C.explanation)].join(". ");p==="playing"?(q(),p="paused"):p==="paused"?(F(),p="playing"):(X(d,e.targetLanguage,()=>{p="idle",v(t,e,n)}),p="playing"),v(t,e,n)});const h=document.createElement("button");h.type="button",h.className="ghostButton",h.textContent="Stop",h.disabled=p==="idle",h.addEventListener("click",()=>{R(),v(t,e,n)}),G.append(w,h),M.append(U,G),l.appendChild(M)}const E=document.createElement("button");E.type="button",E.className="primaryButton",E.textContent="Scan page again",E.addEventListener("click",()=>T(s)),l.appendChild(E),a.appendChild(l),t.appendChild(a)}function A(t,e){const n=P(t);return n.length<=e?n:`${n.slice(0,e-3).trimEnd()}...`}function g(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function B(t){return S.find(n=>n.value===t)?.value??"en"}function ne(t){return S.find(e=>e.value===t)?.label??"English"}function R(){O(),p="idle"}function ae(){return`
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
