/* Top-level render: routes views and gates them behind the right account type. */
import { $, S, esc, initials, toast } from '../core/state.js';
import { renderAuth, renderBlocked } from '../views/auth.js';
import { animateMap, renderFaculty } from '../views/faculty.js';
import { R, renderInst } from '../views/institution.js';
import { renderLanding } from '../views/landing.js';

/* ======================= 8) RENDER, EVENTS, BOOT ======================= */
export let rendering=false;
export function render(){
  if(rendering){queueMicrotask(render);return}
  rendering=true;try{renderNow()}finally{rendering=false}
}
export function renderNow(){
  const isFac = S.session && S.session.role === 'faculty';
  const isInst = S.session && S.session.role === 'institution';

  if (isFac && S.view === 'inst') {
    S.view = 'faculty';
    toast('You are signed in as faculty. Sign out to switch portals.', true);
  } else if (isInst && S.view === 'faculty') {
    S.view = 'inst';
    toast('You are signed in as an institution. Sign out to switch portals.', true);
  }

  $('#topbar').classList.toggle('dark',S.view==='landing');
  $('#nav-home').classList.toggle('on',S.view==='landing');
  $('#nav-fac').classList.toggle('on',S.view==='faculty');
  $('#nav-inst').classList.toggle('on',S.view==='inst');

  const navFac = $('#nav-fac');
  const navInst = $('#nav-inst');
  if (navFac) navFac.style.display = isInst ? 'none' : '';
  if (navInst) navInst.style.display = isFac ? 'none' : '';

  const app=$('#app');
  const chatScroll=$('#chat')?$('#chat').scrollTop:null;
  if(S.view==='landing')app.innerHTML=renderLanding();
  const gate=(role,fn)=>!S.session?renderAuth(role):S.session.role!==role?renderBlocked(role):fn();
  if(S.view==='faculty')app.innerHTML=gate('faculty',renderFaculty);
  if(S.view==='inst')app.innerHTML=gate('institution',renderInst);
  const ac=$('#acct');
  if(S.session){
    const a=S.accounts[S.session.email]||{name:''};
    const displayName=S.session.name||a.name||(S.session.email?S.session.email.split('@')[0]:'User');
    ac.innerHTML=`<div class="av">${initials(displayName||'U')}</div><div class="who">${esc(displayName)}<small>${S.session.role==='faculty'?'Faculty account':'Institution account'}</small></div><button class="out" data-act="signOut">Sign out</button>`;
    ac.style.display='flex';
  }
  else{ac.innerHTML='';ac.style.display='none'}
  if(chatScroll!=null&&$('#chat'))$('#chat').scrollTop=chatScroll;
  S.enter=false;
  const r=R();if(r)r._flash=null;
  animateMap();
  if(S.refocus){const el=document.querySelector(S.refocus);if(el)el.focus();S.refocus=null}
  if(S.rec&&S.rec.stream&&$('#live'))$('#live').srcObject=S.rec.stream;
  const re=$('#reqEdit');if(re){re.focus();re.select()}
}
export const go = fn => {S.enter=true;fn();render();window.scrollTo(0,0)};
