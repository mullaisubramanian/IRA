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
import { D, S, load } from './core/state.js';
import { R } from './views/institution.js';
import { allMatches } from './logic/matching.js';
import { districtsOf, STATE_DISTRICTS } from './data/catalog.js';

load();
Object.values(S.instData).forEach(I=>I.reqs.forEach(r=>{r.typing=false;r.msgs.forEach(m=>m.fresh=false)}));S.rec=null;
render();

// Debug handle for automated tests in development only.
if (import.meta.env.DEV) window.__ira = { S, get D() { return D; }, R, allMatches, districtsOf, STATE_DISTRICTS };
