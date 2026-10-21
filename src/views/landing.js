/* Home page: IRA expansion, hero with animated Tamil Nadu match map, and the two account doors. */
import { S } from '../core/state.js';
import { ICON } from '../core/ui.js';
import { TN_DISTRICTS, TN_OUTLINE } from '../data/catalog.js';
import { R } from './institution.js';

/* ======================= 3) LANDING ================================ */
export const proj = ([lat,lon]) => [(lon-76)*100,(13.8-lat)*100];
export function heroMap(){
  const outline=TN_OUTLINE.map(p=>proj([p[1],p[0]]).join(',')).join(' ');
  const dots=Object.values(TN_DISTRICTS).map((ll,i)=>{const [x,y]=proj(ll);return `<circle class="hm-dot" cx="${x}" cy="${y}" r="2.6" style="animation-delay:${.6+i*.025}s"/>`}).join('');
  const pairs=[['Madurai','Coimbatore'],['Tirunelveli','Chennai'],['Salem','Coimbatore'],['Thanjavur','Tiruchirappalli'],['Vellore','Chennai']];
  const arcs=pairs.map(([a,b],i)=>{const [x1,y1]=proj(TN_DISTRICTS[a]),[x2,y2]=proj(TN_DISTRICTS[b]);const mx=(x1+x2)/2,my=(y1+y2)/2-Math.hypot(x2-x1,y2-y1)*.35;const d=1.4+i*.28;
    return `<circle class="hm-fac" cx="${x1}" cy="${y1}" r="6" style="animation-delay:${d-.2}s"/><path class="hm-arc" d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" style="animation-delay:${d}s"/><circle class="hm-col" cx="${x2}" cy="${y2}" r="7" style="animation-delay:${d+.8}s"/>`}).join('');
  const [cx,cy]=proj(TN_DISTRICTS.Coimbatore),[chx,chy]=proj(TN_DISTRICTS.Chennai);
  const tag=(x,y,t,d)=>`<g class="hm-tag" style="animation-delay:${d}s" transform="translate(${x},${y})"><rect x="0" y="-13" rx="8" width="${t.length*6.3+18}" height="26"/><text x="9" y="4">${t}</text></g>`;
  return `<svg viewBox="-30 -20 520 640" aria-hidden="true"><polygon class="hm-outline" points="${outline}"/>${dots}${arcs}
    <circle class="hm-pulse" cx="${cx}" cy="${cy}" r="10"/><circle class="hm-pulse" cx="${chx}" cy="${chy}" r="10" style="animation-delay:3.2s"/>
    ${tag(cx-60,cy+40,'94% match: Asst. Professor, CSE',3.2)}${tag(chx-215,chy+34,'HOD, Mechanical: shortlisted',3.6)}</svg>`;
}
export function renderLanding(){
  const role = S.session?.role;
  const isFac = role === 'faculty';
  const isInst = role === 'institution';

  const showFacultyDoor = !isInst;
  const showInstDoor = !isFac;
  const singleDoor = isFac || isInst;

  return `<section class="hero"><div class="hero-in">
      <div>
        <p class="ira-word" aria-label="IRA stands for Intelligent Recruitment Assistant"><span><b>I</b>ntelligent</span><span><b>R</b>ecruitment</span><span><b>A</b>ssistant</span></p>
        <h1>The right professor for <span class="hl">every classroom.</span></h1>
        <p class="lead">IRA connects faculty members with colleges across Tamil Nadu. Faculty build one profile, institutions describe the role in a chat, and IRA finds the people who truly fit.</p>
        <div class="flow"><span><b>1</b>Build a profile</span><span><b>2</b>Take a short assessment</span><span><b>3</b>Get matched</span><span><b>4</b>Interview</span></div>
      </div>
      <div class="hero-map">${heroMap()}</div>
    </div></section>
    <section class="doors" style="${singleDoor ? 'grid-template-columns: minmax(280px, 480px); justify-content: center;' : ''}">
      ${showFacultyDoor ? `<div class="door fac"><div class="ico">${ICON.cap}</div><h3>I'm a faculty member</h3><p>Create your profile once and hear from colleges whenever a role matches you.</p><button class="btn gold" data-act="goFaculty">${isFac ? 'Go to my faculty profile' : 'Create faculty profile'}</button></div>` : ''}
      ${showInstDoor ? `<div class="door ins"><div class="ico">${ICON.inst}</div><h3>I'm hiring for an institution</h3><p>Describe the vacancy in your own words. IRA asks what's missing and shows ranked profiles.</p><button class="btn jade" data-act="goInst">${isInst ? 'Go to recruitment portal' : 'Post a vacancy'}</button></div>` : ''}
    </section>
    <p class="foot">IRA · Intelligent Recruitment Assistant · Powered by Supabase PostgreSQL</p>`;
}
