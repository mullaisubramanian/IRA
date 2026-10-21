/* Sign up / log in for faculty and institutions, connected directly to Supabase Auth. */
import { go } from '../app/render.js';
import { $, D, S, attach, blankF, blankI, esc, save, toast } from '../core/state.js';
import { ICON } from '../core/ui.js';
import { INST_TYPES, districtsOf } from '../data/catalog.js';
import { newReq } from './institution.js';
import { signUpUser, signInUser } from '../core/supabase.js';

/* ======================= ACCOUNTS ================================== */
export const af=(l,id,type,ph,auto,val)=>`<div class="field"><label for="${id}">${l}<span class="req">*</span></label><input class="in" id="${id}" type="${type}" placeholder="${esc(ph)}" value="${esc(val||'')}" autocomplete="${auto||'off'}"></div>`;

export function renderAuth(role){
  const fac=role==='faculty', tab=S.authTab[role];
  const side=fac?`<h2>One profile. Every college that fits.</h2><p>Create your faculty account to build your profile and get matched with colleges across Tamil Nadu.</p>`
                :`<h2>Describe the role. IRA finds the people.</h2><p>Create an institution account to post vacancies, see matched faculty and schedule interviews.</p>`;
  const pw=`<div class="grid">${af('Password','aPass','password','At least 6 characters','new-password')}${af('Confirm password','aPass2','password','Repeat password','new-password')}</div>`;
  const fields = tab==='login' ? `${af('Email ID','aEmail','email','you@email.com','email',fac?D.email:'')}${af('Password','aPass','password','Your password','current-password')}`
    : fac ? `${af('Full name','aName','text','As in your certificates','name',D.name)}${af('Email ID','aEmail','email','you@email.com','email',D.email)}${af('Mobile number','aMobile','tel','98xxx xxxxx','tel',D.mobile)}${pw}`
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
     <p class="muted" style="font-size:12px;margin:0">${tab==='login'?'New here? Choose Create account above.':'Already registered? Choose Log in above.'} Connected to Supabase Authentication.</p>
   </div></div></div>`;
}

export function renderBlocked(target){
  const mine=S.session.role, other=target==='faculty'?'faculty':'institution';
  const name=S.session.name || S.session.email;
  return `<div class="blocked ${S.enter?'enter':''}"><div class="fcard" style="text-align:center;padding:38px">
    <div class="seal" style="margin:0 auto 16px;background:var(--marigold);color:var(--navy)">${ICON.lock.replace(/"11"/g,'"24"')}</div>
    <h3 style="margin:0 0 8px;font-size:24px">You're signed in as ${mine==='faculty'?'a faculty member':'an institution'}</h3>
    <p class="muted" style="margin:0 auto 22px;max-width:430px">${esc(name)} (${esc(S.session.email)}). The ${other} side needs its own ${other} account. Sign out first, then log in or create a ${other} account.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn" data-act="${mine==='faculty'?'goFaculty':'goInst'}">Back to my ${mine==='faculty'?'profile':'dashboard'}</button><button class="btn primary" data-act="signOut" data-next="${target}">Sign out and continue</button></div>
  </div></div>`;
}

document.addEventListener('submit', async e => {
  if (e.target.id !== 'authForm') return;
  e.preventDefault();
  const f = e.target, role = f.dataset.role, mode = f.dataset.mode;
  const v = id => { const el = f.querySelector('#' + id); return el ? el.value.trim() : ''; };
  const errEl = $('#authErr');
  const err = m => {
    if (errEl) {
      errEl.style.color = 'var(--coral)';
      errEl.textContent = m;
    }
    console.error('[IRA Auth Form Error]', m);
  };
  if (errEl) errEl.textContent = '';

  const email = v('aEmail').toLowerCase(), pass = f.querySelector('#aPass')?.value || '';
  if (!/^\S+@\S+\.\S+$/.test(email)) return err('Enter a valid email ID.');
  if (!pass || pass.length < 6) return err('Password must be at least 6 characters.');

  const submitBtn = f.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = mode === 'login' ? 'Logging in...' : 'Creating account...';
  }

  try {
    if (mode === 'login') {
      const { data, error } = await signInUser(email, pass);
      if (error) {
        console.error('[Supabase signIn error]', error);
        return err(error.message || 'Email or password is incorrect.');
      }
      const user = data.user;
      const userRole = user?.user_metadata?.role || role;
      if (userRole !== role) {
        return err(`This account is registered as ${userRole === 'faculty' ? 'a faculty' : 'an institution'} account. Please use the ${userRole} login.`);
      }
      S.session = {
        id: user.id,
        email: user.email,
        role: userRole,
        name: user.user_metadata?.full_name || email.split('@')[0]
      };
      attach();
      save();
      toast(`Welcome back, ${S.session.name}`);
      go(() => S.view = role === 'faculty' ? 'faculty' : 'inst');
    } else {
      // Sign up mode
      const name = v(role === 'faculty' ? 'aName' : 'aInst');
      if (!name) return err(role === 'faculty' ? 'Enter your full name.' : 'Enter the institution name.');
      const pass2 = f.querySelector('#aPass2')?.value;
      if (pass !== pass2) return err('The two passwords do not match.');
      if (role === 'faculty' && v('aMobile').replace(/\D/g, '').length < 10) return err('Enter a valid 10-digit mobile number.');
      if (role === 'institution' && !v('aName')) return err('Enter the contact person name.');

      const { data, error } = await signUpUser({
        email,
        password: pass,
        role,
        fullName: name,
        phone: role === 'faculty' ? v('aMobile') : '',
        institutionName: role === 'institution' ? name : ''
      });

      if (error) {
        console.error('[Supabase signUp error]', error);
        return err(error.message);
      }

      const user = data?.user;
      const session = data?.session;

      if (session && user) {
        S.session = {
          id: user.id,
          email: user.email,
          role,
          name
        };
        if (role === 'faculty') {
          const existing = S.profiles[email] || S.f || blankF();
          const p = {
            ...existing,
            d: {
              ...D0(),
              ...D,
              ...existing.d,
              name: name || existing.d?.name || D.name,
              email: email || existing.d?.email || D.email,
              mobile: v('aMobile') || existing.d?.mobile || D.mobile
            }
          };
          S.profiles[email] = p;
        } else {
          S.instData[email] = {
            ...blankI(),
            name,
            email,
            type: v('aType'),
            dist: v('aDist'),
            contact: v('aName'),
            contactDesig: v('aDesig'),
            reqs: [newReq()],
            cur: 0
          };
        }
        attach();
        save();
        toast('Account created and signed in successfully!');
        go(() => S.view = role === 'faculty' ? 'faculty' : 'inst');
      } else {
        // Email confirmation is required by Supabase auth configuration
        toast('Account created! Please check your email to confirm, then log in.');
        if (errEl) {
          errEl.style.color = 'var(--jade)';
          errEl.textContent = 'Account created successfully! If email confirmation is enabled on your Supabase project, please check your inbox and verify your email, then switch to the Log in tab.';
        }
      }
    }
  } catch (ex) {
    console.error('[Supabase Auth Exception]', ex);
    const m = ex.message || '';
    if (m.toLowerCase().includes('failed to fetch') || m.toLowerCase().includes('networkerror')) {
      err('Connection error: Unable to reach Supabase API. Check your internet connection and verify VITE_SUPABASE_URL in Cloudflare settings is https://vlgviaijtzrxufbzvzps.supabase.co.');
    } else {
      err(m || 'An unexpected error occurred during authentication.');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? 'Log in' : 'Create account';
    }
  }
});
