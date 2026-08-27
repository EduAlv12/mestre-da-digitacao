// Foco da área de digitação para desktop e navegadores móveis.
(() => {
  const init = () => {
    const input=document.getElementById('hidden-input'),wrapper=document.querySelector('.typing-wrapper');
    if(!input||!wrapper||wrapper.dataset.keyboardFocusReady==='true')return;
    wrapper.dataset.keyboardFocusReady='true';input.setAttribute('inputmode','text');input.setAttribute('enterkeyhint','done');
    const style=document.createElement('style');style.id='keyboard-focus-style';style.textContent=`
      body,.app-card,.app-card button,.app-card label,.app-card span,.app-card p,.app-card h1,.app-card h2,.app-card h3,.app-card div:not(#hidden-input){-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;}
      a{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;}
      input,textarea{-webkit-user-select:text;user-select:text;}
      .typing-wrapper{position:relative;scroll-margin-top:18vh;scroll-margin-bottom:18vh;}
      .typing-wrapper #hidden-input{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:0!important;z-index:10!important;display:block!important;pointer-events:auto!important;background:transparent!important;border:0!important;outline:0!important;color:transparent!important;caret-color:transparent!important;}
      .typing-wrapper #text-display,.typing-wrapper .focus-hint{pointer-events:none!important;}
      .mode-status-info-row{display:flex;align-items:center;justify-content:center;gap:6px;min-width:0;flex-wrap:wrap;}
      .mode-info-btn{width:30px;height:30px;flex:0 0 30px;border:1px solid var(--card-border);border-radius:50%;background:var(--card-bg);color:var(--text);font-size:16px;line-height:1;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;touch-action:manipulation;}
      .mode-info-btn:active{transform:scale(.95);}
      #continue-mode-btn{grid-column:1 / -1;width:100%;min-height:48px;justify-self:stretch;}
      .keyboard-follow-transition{scroll-behavior:smooth;}
    `;document.head.appendChild(style);
    document.addEventListener('contextmenu',event=>{if(!event.target.closest('input,textarea,button,a'))event.preventDefault();},{passive:false});

    let savedScrollY=window.scrollY;
    let keyboardOpen=false;
    let restoring=false;
    let lastViewportHeight=window.visualViewport?.height||window.innerHeight;
    const isKeyboardViewport=()=>{const vv=window.visualViewport;if(!vv)return false;return vv.height<window.innerHeight*0.78;};
    const smoothScrollToTyping=()=>{
      if(restoring)return;
      wrapper.classList.add('keyboard-follow-transition');
      requestAnimationFrame(()=>wrapper.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'}));
    };
    const onViewportResize=()=>{
      const height=window.visualViewport?.height||window.innerHeight;
      const opening=height<lastViewportHeight-80&&isKeyboardViewport();
      const closing=keyboardOpen&&height>lastViewportHeight+80&&!isKeyboardViewport();
      lastViewportHeight=height;
      if(opening){keyboardOpen=true;smoothScrollToTyping();}
      if(closing){keyboardOpen=false;restoring=true;window.scrollTo({top:savedScrollY,behavior:'smooth'});setTimeout(()=>{restoring=false;wrapper.classList.remove('keyboard-follow-transition');},380);}
    };
    const onFocus=()=>{
      savedScrollY=window.scrollY;
      wrapper.classList.add('typing-focused');
      setTimeout(smoothScrollToTyping,90);
    };
    const onBlur=()=>{wrapper.classList.remove('typing-focused');};
    input.addEventListener('focus',onFocus);input.addEventListener('blur',onBlur);
    if(window.visualViewport)window.visualViewport.addEventListener('resize',onViewportResize);
    window.addEventListener('resize',onViewportResize,{passive:true});

    const focusTypingInput=event=>{if(event){const target=event.target;if(target&&target.closest('button,a,textarea,select'))return;}if(input.disabled||document.body.classList.contains('tutorial-open'))return;input.focus({preventScroll:true});};
    wrapper.addEventListener('pointerdown',focusTypingInput);wrapper.addEventListener('click',focusTypingInput);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();