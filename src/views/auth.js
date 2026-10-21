/* Sign up / log in for faculty and institutions, with friendly error handling. */
import { go } from '../app/render.js';
import { $, D, S, attach, blankF, blankI, esc, save, toast } from '../core/state.js';
import { ICON } from '../core/ui.js';
import { INST_TYPES, districtsOf } from '../data/catalog.js';
import { newReq } from './institution.js';
import { signUpUser, signInUser, upsertInstitutionProfile, supabase } from '../core/supabase.js';
import { getFriendlyAuthError } from '../lib/authErrors.js';

/* ======================= ACCOUNTS ================================== */
export const af = (l, id, type, ph, auto, val) => `<div class="field"><label for="${id}">${l}<span class="req">*</span></label><input class="in" id="${id}" type="${type}" placeholder="${esc(ph)}" value="${esc(val || '')}" autocomplete="${auto || 'off'}"></div>`;

export function renderAuth(role) {
  const fac = role === 'faculty', tab = S.authTab[role] || 'signup';
  const side = tab === 'reset'
    ? (fac ? `<h2>Reset faculty password.</h2><p>Enter your registered email ID to receive a password reset link.</p>`
           : `<h2>Reset institution password.</h2><p>Enter your official email ID to receive a password reset link.</p>`)
    : fac ? `<h2>One profile. Every college that fits.</h2><p>Create your faculty account to build your profile and get matched with colleges across Tamil Nadu.</p>`
          : `<h2>Describe the role. IRA finds the people.</h2><p>Create an institution account to post vacancies, see matched faculty and schedule interviews.</p>`;

  const pw = `<div class="grid">${af('Password', 'aPass', 'password', 'At least 8 characters', 'new-password')}${af('Confirm password', 'aPass2', 'password', 'Repeat password', 'new-password')}</div>`;

  const fields = tab === 'reset'
    ? `${af('Registered email ID', 'aEmail', 'email', 'you@email.com', 'email', fac ? D.email : '')}`
    : tab === 'login'
    ? `${af('Email ID', 'aEmail', 'email', 'you@email.com', 'email', fac ? D.email : '')}${af('Password', 'aPass', 'password', 'Your password', 'current-password')}
       <div style="text-align:right;margin-top:-6px"><button type="button" class="as-link" data-act="authTab" data-role="${role}" data-v="reset" style="background:none;border:none;color:var(--gold);font-size:12px;cursor:pointer;padding:0">Forgot password?</button></div>`
    : fac ? `${af('Full name', 'aName', 'text', 'As in your certificates', 'name', D.name)}${af('Email ID', 'aEmail', 'email', 'you@email.com', 'email', D.email)}${af('Mobile number', 'aMobile', 'tel', '98xxx xxxxx', 'tel', D.mobile)}${pw}`
    : `${af('Institution name', 'aInst', 'text', 'e.g. Sri Ramakrishna College of Arts & Science', 'organization')}
       <div class="grid"><div class="field"><label for="aType">Institution type<span class="req">*</span></label><select class="in" id="aType">${Object.keys(INST_TYPES).map(t => `<option>${t}</option>`).join('')}</select></div>
       <div class="field"><label for="aDist">District<span class="req">*</span></label><select class="in" id="aDist">${districtsOf('Tamil Nadu').map(t => `<option ${t === 'Coimbatore' ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
       <div class="grid">${af('Contact person', 'aName', 'text', 'Your name', 'name')}${af('Your designation', 'aDesig', 'text', 'e.g. HR Manager', 'organization-title')}</div>
       ${af('Official email', 'aEmail', 'email', 'hr@college.edu.in', 'email')}${pw}`;

  const heading = tab === 'reset'
    ? 'Reset password'
    : tab === 'login'
    ? (fac ? 'Faculty log in' : 'Institution log in')
    : (fac ? 'Create your faculty account' : 'Create your institution account');

  const btnText = tab === 'reset' ? 'Send reset link' : tab === 'login' ? 'Log in' : 'Create account';

  const footerText = tab === 'login'
    ? 'New here? Choose Create account above.'
    : tab === 'reset'
    ? 'Remember your password? Choose Log in above.'
    : 'Already registered? Choose Log in above.';

  return `<div class="login"><div class="side"><span class="pill gold" style="align-self:flex-start;margin-bottom:18px">${fac ? 'For faculty' : 'For institutions'}</span>${side}</div>
   <div class="form"><div>
     <h3>${heading}</h3>
     <div class="authtabs">
       <button class="${tab === 'signup' ? 'on' : ''}" data-act="authTab" data-role="${role}" data-v="signup">Create account</button>
       <button class="${tab === 'login' ? 'on' : ''}" data-act="authTab" data-role="${role}" data-v="login">Log in</button>
       ${tab === 'reset' ? `<button class="on" data-act="authTab" data-role="${role}" data-v="reset">Reset password</button>` : ''}
     </div>
     <form id="authForm" data-role="${role}" data-mode="${tab}" novalidate style="display:flex;flex-direction:column;gap:14px">${fields}
       <div class="err" id="authErr" role="alert"></div>
       <button class="btn primary" type="submit">${btnText}</button>
     </form>
     <p class="muted" style="font-size:12px;margin:0">${footerText}</p>
   </div></div></div>`;
}

export function renderBlocked(target) {
  const mine = S.session.role, other = target === 'faculty' ? 'faculty' : 'institution';
  const name = S.session.name || S.session.email;
  return `<div class="blocked ${S.enter ? 'enter' : ''}"><div class="fcard" style="text-align:center;padding:38px">
    <div class="seal" style="margin:0 auto 16px;background:var(--marigold);color:var(--navy)">${ICON.lock.replace(/"11"/g, '"24"')}</div>
    <h3 style="margin:0 0 8px;font-size:24px">You're signed in as ${mine === 'faculty' ? 'a faculty member' : 'an institution'}</h3>
    <p class="muted" style="margin:0 auto 22px;max-width:430px">${esc(name)} (${esc(S.session.email)}). The ${other} side needs its own ${other} account. Sign out first, then log in or create a ${other} account.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn" data-act="${mine === 'faculty' ? 'goFaculty' : 'goInst'}">Back to my ${mine === 'faculty' ? 'profile' : 'dashboard'}</button><button class="btn primary" data-act="signOut" data-next="${target}">Sign out and continue</button></div>
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
  };
  if (errEl) errEl.textContent = '';

  const email = v('aEmail').toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return err('Enter a valid email ID.');

  const submitBtn = f.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = mode === 'login' ? 'Logging in...' : mode === 'reset' ? 'Sending link...' : 'Creating account...';
  }

  try {
    // Mode: Password reset
    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) {
        return err(getFriendlyAuthError(error));
      }
      if (errEl) {
        errEl.style.color = 'var(--jade)';
        errEl.textContent = 'Check your email for the password reset link.';
      }
      toast('Check your email for the password reset link.');
      return;
    }

    // Mode: Login
    if (mode === 'login') {
      const pass = f.querySelector('#aPass')?.value || '';
      if (!pass) return err('Enter your password.');

      const { data, error } = await signInUser(email, pass);
      if (error) {
        return err(getFriendlyAuthError(error));
      }
      const user = data.user;
      const userRole = user?.user_metadata?.role || role;
      if (userRole !== role) {
        return err(`This account is registered as ${userRole === 'faculty' ? 'a faculty' : 'an institution'} account. Please use the ${userRole} login.`);
      }
      const displayName = userRole === 'institution'
        ? (user.user_metadata?.institution_name || user.user_metadata?.full_name || email.split('@')[0])
        : (user.user_metadata?.full_name || email.split('@')[0]);

      S.session = {
        id: user.id,
        email: user.email,
        role: userRole,
        name: displayName
      };

      // If institution, retrieve and hydrate from public.institutions
      if (userRole === 'institution') {
        try {
          const { data: instData } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', user.id)
            .single();
          if (instData) {
            S.instData[email] = {
              ...blankI(),
              ...(S.instData[email] || {}),
              name: instData.institution_name || displayName,
              email: email,
              type: instData.type || 'Engineering & Technology',
              dist: instData.city || 'Coimbatore',
              contact: instData.contact_person || '',
              phone: instData.phone || ''
            };
          }
        } catch (e) {
          console.error('[auth]', e);
        }
      }

      attach();
      save();
      toast(`Welcome back, ${S.session.name}`);
      go(() => S.view = role === 'faculty' ? 'faculty' : 'inst');
    } else {
      // Mode: Sign up
      const pass = f.querySelector('#aPass')?.value || '';
      if (!pass || pass.length < 8) return err('Password must be at least 8 characters.');

      const isFac = role === 'faculty';
      const facultyName = v('aName');
      const instName = v('aInst');
      const instType = v('aType');
      const instDist = v('aDist');
      const contactPerson = v('aName');
      const contactDesig = v('aDesig');
      const mobile = v('aMobile');

      // Validation
      if (isFac) {
        if (!facultyName) return err('Enter your full name.');
        if (mobile.replace(/\D/g, '').length < 10) return err('Enter a valid 10-digit mobile number.');
      } else {
        if (!instName) return err('Enter the institution name.');
        if (!contactPerson) return err('Enter the contact person name.');
        if (!instType) return err('Select the institution type.');
        if (!instDist) return err('Select the district.');
      }

      const pass2 = f.querySelector('#aPass2')?.value;
      if (pass !== pass2) return err('The two passwords do not match.');

      const { data, error } = await signUpUser({
        email,
        password: pass,
        role,
        fullName: isFac ? facultyName : contactPerson,
        phone: isFac ? mobile : '',
        institutionName: isFac ? '' : instName,
        type: isFac ? '' : instType,
        city: isFac ? '' : instDist,
        contactPerson: isFac ? '' : contactPerson,
        contactDesig: isFac ? '' : contactDesig
      });

      if (error) {
        return err(getFriendlyAuthError(error));
      }

      const user = data?.user;
      const session = data?.session;

      if (session && user) {
        const accountDisplayName = isFac ? facultyName : instName;
        S.session = {
          id: user.id,
          email: user.email,
          role,
          name: accountDisplayName
        };

        if (isFac) {
          const existing = S.profiles[email] || S.f || blankF();
          const p = {
            ...existing,
            d: {
              ...existing.d,
              name: facultyName || existing.d?.name || D.name,
              email: email || existing.d?.email || D.email,
              mobile: mobile || existing.d?.mobile || D.mobile
            }
          };
          S.profiles[email] = p;
        } else {
          try {
            await upsertInstitutionProfile(user.id, {
              institutionName: instName,
              type: instType,
              city: instDist,
              contactPerson: contactPerson,
              phone: ''
            });
          } catch (e) {
            console.error('[auth]', e);
          }

          S.instData[email] = {
            ...blankI(),
            name: instName,
            email: email,
            type: instType,
            dist: instDist,
            contact: contactPerson,
            contactDesig: contactDesig,
            reqs: [newReq()],
            cur: 0
          };
        }

        attach();
        save();
        toast(`${isFac ? 'Faculty' : 'Institution'} account created and signed in successfully!`);
        go(() => S.view = role === 'faculty' ? 'faculty' : 'inst');
      } else {
        // Email verification required
        toast('Please verify your email — check your inbox.');
        if (errEl) {
          errEl.style.color = 'var(--jade)';
          errEl.textContent = 'Account created successfully! Please verify your email — check your inbox.';
        }
      }
    }
  } catch (ex) {
    return err(getFriendlyAuthError(ex));
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? 'Log in' : mode === 'reset' ? 'Send reset link' : 'Create account';
    }
  }
});
