/* Sign up / log in for faculty and institutions, and the "signed in as the other role" block screen. */
import { go } from '../app/render.js';
import { $, D, S, attach, blankF, blankI, esc, hash, save, toast } from '../core/state.js';
import { ICON } from '../core/ui.js';
import { INST_TYPES, districtsOf } from '../data/catalog.js';
import { newReq } from './institution.js';
import { signUpUser, signInUser } from '../core/supabase.js';

/* ======================= ACCOUNTS ================================== */
export const af=(l,id,type,ph,auto)=>`<div class="field"><label for="${id}">${l}<span class="req">*</span></label><input class="in" id="${id}" type="${type}" placeholder="${esc(ph)}" autocomplete="${auto||'off'}"></div>`;
export function renderAuth(role){
  const fac=role==='faculty', tab=S.authTab[role];
  const side=fac?`<h2>One profile. Every college that fits.</h2><p>Create your faculty account to build your profile and get matched with colleges across Tamil Nadu.</p>`
                :`<h2>Describe the role. IRA finds the people.</h2><p>Create an institution account to post vacancies, see matched faculty and schedule interviews.</p>`;
  const pw=`<div class="grid">${af('Password','aPass','password','At least 6 characters','new-password')}${af('Confirm password','aPass2','password','Repeat password','new-password')}</div>`;
  const fields = tab==='login' ? `${af('Email ID','aEmail','email','you@email.com','email')}${af('Password','aPass','password','Your password','current-password')}`
    : fac ? `${af('Full name','aName','text','As in your certificates','name')}${af('Email ID','aEmail','email','you@email.com','email')}${af('Mobile number','aMobile','tel','98xxx xxxxx','tel')}${pw}`
    : `${af('Institution name','aInst','text','e.g. Sri Ramakrishna College of Arts & Science','organization')}
       <div class="grid"><div class="field"><label for="aType">Institution type<span class="req">*</span></label><select class="in" id="aType">${Object.keys(INST_TYPES).map(t=>`<option>${t}</option>`).join('')}</select></div>
       <div class="field"><label for="aDist">District<span class="req">*</span></label><select class="in" id="aDist">${districtsOf('Tamil Nadu').map(t=>`<option ${t==='Coimbatore'?'selected':''}>${t}</option>`).join('')}</select></div></div>
       <div class="grid">${af('Contact person','aName','text','Your name','name')}${af('Your designation','aDesig','text','e.g. HR Manager','organization-title')}</div>
       ${af('Official email','aEmail','email','hr@college.edu.in','email')}${pw}`;
  return `<div class="login"><div class="side"><span class="pill gold" style="align-self:flex-start;margin-bottom:18px">${fac?'For faculty':'For institutions'}</span>${side}</div>
   <div class="form"><div>
     <h3>${tab==='login'?(fac?'Faculty log in':'Institution log in'):(fac?'Create your faculty account':'Create your institution account')}</h3>
     <div class="authtabs"><button class="${tab==='signup'?'on':''}" data-act="authTab" data-role="${role}" data-v="signup">Create account</button><button class="${tab==='login'?'on':''}" data-act="authTab" data-role="${role}" data-v="login">Log in</button></div>
     <form id="authForm" data-role="${role}" data-mode="${tab}" novalidate style="display:flex;flex-direction:column;gap:14px">${fields}
       <div class="err" id="authErr" role="alert"></div>
       <button class="btn primary" type="submit">${tab==='login'?'Log in':'Create account'}</button></form>
     <p class="muted" style="font-size:12px;margin:0">${tab==='login'?'New here? Choose Create account above.':'Already registered? Choose Log in above.'} Prototype accounts are stored in this browser only.</p>
   </div></div></div>`;
}
export function renderBlocked(target){
  const a=S.accounts[S.session.email]||{name:''}, mine=S.session.role, other=target==='faculty'?'faculty':'institution';
  return `<div class="blocked ${S.enter?'enter':''}"><div class="fcard" style="text-align:center;padding:38px">
    <div class="seal" style="margin:0 auto 16px;background:var(--marigold);color:var(--navy)">${ICON.lock.replace(/"11"/g,'"24"')}</div>
    <h3 style="margin:0 0 8px;font-size:24px">You're signed in as ${mine==='faculty'?'a faculty member':'an institution'}</h3>
    <p class="muted" style="margin:0 auto 22px;max-width:430px">${esc(a.name)} (${esc(S.session.email)}). The ${other} side needs its own ${other} account. Sign out first, then log in or create a ${other} account.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn" data-act="${mine==='faculty'?'goFaculty':'goInst'}">Back to my ${mine==='faculty'?'profile':'dashboard'}</button><button class="btn primary" data-act="signOut" data-next="${target}">Sign out and continue</button></div>
  </div></div>`;
}
document.addEventListener('submit',e=>{
  if(e.target.id!=='authForm')return; e.preventDefault();
  const f=e.target, role=f.dataset.role, mode=f.dataset.mode;
  const v=id=>{const el=f.querySelector('#'+id);return el?el.value.trim():''};
  const err=m=>{$('#authErr').textContent=m};
  const email=v('aEmail').toLowerCase(), pass=f.querySelector('#aPass').value;
  if(!/^\S+@\S+\.\S+$/.test(email))return err('Enter a valid email ID.');
  if(mode==='login'){
    const a=S.accounts[email];
    if(!a||a.pass!==hash(pass))return err('Email or password is incorrect.');
    if(a.role!==role)return err(`This email is registered as ${a.role==='faculty'?'a faculty':'an institution'} account. Use the ${a.role==='faculty'?'faculty':'institution'} log in instead.`);
  } else {
    if(S.accounts[email])return err('An account with this email already exists. Choose Log in instead.');
    const name=v(role==='faculty'?'aName':'aInst');
    if(!name)return err(role==='faculty'?'Enter your full name.':'Enter the institution name.');
    if(role==='faculty'&&v('aMobile').replace(/\D/g,'').length<10)return err('Enter a valid 10-digit mobile number.');
    if(role==='institution'&&!v('aName'))return err('Enter the contact person name.');
    if(pass.length<6)return err('Use a password of at least 6 characters.');
    if(pass!==f.querySelector('#aPass2').value)return err('The two passwords do not match.');
    S.accounts[email]={role,pass:hash(pass),name,created:Date.now()};
    if(role==='faculty'){const p=blankF();p.d.name=name;p.d.email=email;p.d.mobile=v('aMobile');S.profiles[email]=p}
    else S.instData[email]={...blankI(),name,email,type:v('aType'),dist:v('aDist'),contact:v('aName'),contactDesig:v('aDesig'),reqs:[newReq()],cur:0};
    signUpUser({
      email,
      password: pass,
      role,
      fullName: name,
      phone: role === 'faculty' ? v('aMobile') : '',
      institutionName: role === 'institution' ? name : ''
    }).catch(e => console.debug('Supabase signUp sync:', e?.message));
  }
  if(mode==='login'){
    signInUser(email, pass).catch(e => console.debug('Supabase signIn sync:', e?.message));
  }
  S.session={email,role};attach();save();
  toast(mode==='login'?`Welcome back, ${S.accounts[email].name}`:'Account created');
  go(()=>S.view=role==='faculty'?'faculty':'inst');
});
