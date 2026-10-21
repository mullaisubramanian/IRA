/* Entry point: loads styles, wires events and starts the app. */
import './styles/base.css';
import './styles/topbar.css';
import './styles/landing.css';
import './styles/controls.css';
import './styles/faculty.css';
import './styles/institution.css';
import './styles/overlays.css';
import './styles/responsive.css';
import './app/events.js';
import './views/auth.js';
import { render } from './app/render.js';
import { D, S, attach, blankI, load } from './core/state.js';
import { R, newReq } from './views/institution.js';
import { allMatches } from './logic/matching.js';
import { districtsOf, STATE_DISTRICTS } from './data/catalog.js';
import { supabase } from './core/supabase.js';

load();
Object.values(S.instData).forEach(I=>I.reqs.forEach(r=>{r.typing=false;r.msgs.forEach(m=>m.fresh=false)}));S.rec=null;
render();

// Sync Supabase Auth session on initialization and auth state changes
async function syncUserSession(u) {
  if (!u) {
    S.session = null;
    attach();
    render();
    return;
  }
  S.session = {
    id: u.id,
    email: u.email,
    role: u.user_metadata?.role || S.session?.role || 'faculty',
    name: u.user_metadata?.full_name || u.email?.split('@')[0]
  };
  attach();

  // If faculty member, retrieve persisted profile from Supabase public schema
  if (S.session.role === 'faculty') {
    try {
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*, faculty_profiles(*)')
        .eq('id', u.id)
        .single();
      if (!error && prof) {
        const fp = Array.isArray(prof.faculty_profiles) ? prof.faculty_profiles[0] : prof.faculty_profiles;
        if (fp && (fp.qualification || fp.specialization || (fp.details && Object.keys(fp.details).length))) {
          if (fp.details && typeof fp.details === 'object' && Object.keys(fp.details).length > 0) {
            Object.assign(D, fp.details);
          } else {
            if (prof.full_name) D.name = prof.full_name;
            if (prof.email) D.email = prof.email;
            if (fp.phone) D.mobile = fp.phone;
            if (fp.location) D.district = fp.location.split(',')[0].trim();
            if (fp.resume_url) D.resume = { name: 'Uploaded Resume', url: fp.resume_url };
          }
          S.f.submitted = true;
          for (let i = 0; i < 13; i++) S.f.done[i] = true;
          S.f.max = 12;
        }
      }
    } catch (err) {
      console.warn('[Supabase profile sync exception]', err);
    }
  } else if (S.session.role === 'institution') {
    try {
      const { data: inst, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', u.id)
        .single();
      if (!error && inst) {
        const existing = S.instData[u.email] || {};
        S.instData[u.email] = {
          ...blankI(),
          ...existing,
          name: inst.institution_name || S.session.name || existing.name || '',
          email: u.email,
          type: inst.type || existing.type || 'Engineering & Technology',
          dist: inst.city || existing.dist || 'Coimbatore',
          contact: inst.contact_person || existing.contact || '',
          phone: inst.phone || existing.phone || '',
          reqs: existing.reqs && existing.reqs.length > 0 ? existing.reqs : [newReq()],
          cur: existing.cur !== undefined && existing.cur >= 0 ? existing.cur : 0
        };
        attach();
      }
    } catch (err) {
      console.warn('[Supabase institution sync exception]', err);
    }
  }
  render();
}

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    syncUserSession(session.user);
  }
}).catch(err => console.warn('[Supabase session check]', err));

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    syncUserSession(session.user);
  } else if (event === 'SIGNED_OUT') {
    syncUserSession(null);
  }
});

// Debug handle for automated tests in development only.
if (import.meta.env.DEV) window.__ira = { S, get D() { return D; }, R, allMatches, districtsOf, STATE_DISTRICTS, supabase };
