/* Match scoring, Best fit / Similar / Worth a look tiers, candidate cards, profile modal, interviews and scheduling. */
import { $, S, esc, initials, inr } from '../core/state.js';
import { ICON } from '../core/ui.js';
import { TRAITS } from '../data/catalog.js';
import { fetchLiveFacultyProfiles } from '../core/supabase.js';
import { render } from '../app/render.js';
import { personaText, radar } from '../views/assessment.js';
import { facultyAsCandidate } from '../views/facultyDone.js';
import { R } from '../views/institution.js';

/* ======================= 7) MATCHING ENGINE ========================= */
export const QRANK={'UG':0,'PG':1,'PG + NET/SET':2,'PhD (pursuing accepted)':2.5,'PhD (pursuing)':2.5,'PhD':3};
export const deptMatch=(c,d)=>c.depts.some(x=>x.toLowerCase()===String(d).toLowerCase()||(d==='MBA'&&['Marketing','Finance','HR','Operations','Business Analytics','Entrepreneurship'].includes(x)));
export function evaluate(c,r,dist){
  if(!r||!r.dept||!deptMatch(c,r.dept))return null;
  const gaps=[],hard=[];let s=0,q=0;
  const rs=r.subjects||[];const hit=rs.filter(x=>c.subj.some(y=>y.toLowerCase().includes(x.toLowerCase())||x.toLowerCase().includes(y.toLowerCase()))).length;
  const sv=rs.length?25*hit/rs.length:25;s+=sv;q+=sv;
  if(rs.length&&hit<rs.length)(hit===0?hard:gaps).push(`Teaches ${hit} of ${rs.length} subjects`);
  const cr=QRANK[c.qual]||1,rr=QRANK[r.qual]||1;
  if(cr>=rr){s+=15;q+=15}else if(rr-cr<=.5){s+=9;q+=9;gaps.push('PhD in progress')}else hard.push('Below required qualification');
  const ex=c.expA+c.expI;
  if(!r.exp||ex>=r.exp.min){s+=15;q+=15}else if(r.exp.min-ex<=1.5){s+=9;q+=9;gaps.push(`${ex} yrs experience`)}else{s+=3;q+=3;hard.push(`Only ${ex} yrs experience`)}
  if(!r.salary||c.sal<=r.salary.max)s+=15;else{const over=(c.sal-r.salary.max)/r.salary.max;if(over<=.12){s+=9;gaps.push(`Expects ${inr(c.sal-r.salary.max)} more`)}else hard.push(`Expects ${inr(c.sal)}/month`)}
  const D_=dist||S.i.dist;
  if(c.dist===D_||c.reloc.includes(D_)||c.reloc.includes('Anywhere in Tamil Nadu'))s+=10;else hard.push(c.reloc.length?`Prefers ${c.reloc[0]}`:`Not relocating from ${c.dist}`);
  const rv=Math.min(8,c.pubs*.8+c.scopus*.4);s+=rv;q+=rv;
  const cv=Math.min(5,c.coord.length*2.5);s+=cv;q+=cv;
  const av=Math.max(0,['Beginner','Proficient','Advanced','Distinguished'].indexOf(c.ai))/3*4;s+=av;q+=av;
  let tv=3;if(r.traits&&r.traits.length){const keys=r.traits.map(t=>Object.keys(TRAITS).find(k=>TRAITS[k]===t)).filter(Boolean);tv=keys.length?3*keys.reduce((a,k)=>a+(c.traits[k]||5),0)/(keys.length*10):3}s+=tv;q+=tv;
  if(r.gender&&r.gender!=='Any'&&c.g&&c.g!==r.gender)gaps.push('Gender preference');
  if(r.age&&/\d/.test(r.age)){const [a1,a2]=r.age.split('-').map(x=>parseInt(x));if(c.age<a1||(a2&&c.age>a2))gaps.push(`Age ${c.age}`)}
  const jd={Immediate:7,'Within 30 days':30,'Within 60 days':60,'Within 90 days':90}[r.joining]||90;
  if(c.notice>jd)gaps.push(`${c.notice}-day notice`);
  if(c.desig&&r.role&&!c.desig.includes(r.role))gaps.push(`Seeking ${c.desig[0]}`);
  const score=Math.round(s),quality=Math.round(q/75*100);
  let tier=null;
  if(!hard.length&&!gaps.length&&score>=78)tier='best';
  else if(!hard.length&&score>=62)tier='similar';
  else if(hard.length<=2&&quality>=78&&(c.pubs>=8||ex>=8||c.qual==='PhD'))tier='suggested';
  if(!tier)return null;
  const why=[];if(c.pubs)why.push(`${c.pubs} papers`);if(c.accr.length)why.push(`${c.accr[0]} experience`);if(ex>=8)why.push(`${ex} yrs teaching`);if(['Advanced','Distinguished'].includes(c.ai))why.push(`${c.ai} AI skills`);
  return {score,quality,tier,gaps,hard,why};
}

let isFetchingFaculty = false;

export function loadSupabaseFaculty(force = false) {
  if ((S.supabaseFaculty !== null && !force) || isFetchingFaculty) return;
  isFetchingFaculty = true;
  fetchLiveFacultyProfiles().then(({ data, error }) => {
    isFetchingFaculty = false;
    if (error) {
      console.error('[Supabase Faculty Load Error]', error);
      S.supabaseFaculty = [];
    } else if (data) {
      console.log('[Supabase Faculty Loaded]', data.length, 'faculty profiles from database');
      S.supabaseFaculty = data.map(row => {
        const fullName = row.profiles?.full_name || 'Faculty Member';
        const qual = row.qualification || 'PG';
        const depts = row.specialization ? row.specialization.split(',').map(s=>s.trim()).filter(Boolean) : ['CSE'];
        const subj = row.skills && row.skills.length ? row.skills : ['Core Curriculum'];
        const exp = Number(row.experience_years || 0);

        return {
          id: row.id,
          name: fullName,
          g: 'Any',
          age: 32 + Math.min(20, Math.round(exp)),
          dist: row.location || 'Coimbatore',
          reloc: ['Anywhere in Tamil Nadu'],
          desig: qual === 'PhD' ? ['Associate Professor', 'Professor'] : ['Assistant Professor'],
          depts,
          subj,
          qual,
          expA: Math.round(exp * 10) / 10,
          expI: 0,
          sal: 45000 + Math.min(60000, Math.round(exp * 5000)),
          pubs: Math.max(1, Math.round(exp * 1.5)),
          scopus: Math.max(0, Math.round(exp * 0.8)),
          accr: ['NAAC'],
          coord: ['Class advisor / mentor'],
          ai: exp > 5 ? 'Advanced' : 'Proficient',
          traits: { CA: 8, SC: 8, IN: 8, CO: 8, OW: 8, PR: 8, RE: 8 },
          notice: 30,
          stay: 'Own home',
          intro: 'Video',
          fam: 'Shared',
          color: '#0C8F8B',
          phone: row.phone || '',
          email: row.profiles?.email || ''
        };
      });
    } else {
      S.supabaseFaculty = [];
    }
    render();
  }).catch((err) => {
    isFetchingFaculty = false;
    console.error('[Supabase Faculty Load Exception]', err);
    S.supabaseFaculty = [];
    render();
  });
}

export const fullPool = () => {
  loadSupabaseFaculty();
  const localCandidates = Object.entries(S.profiles).filter(([e,p])=>p.submitted).map(([e,p])=>facultyAsCandidate(p.d,e));
  return [...localCandidates, ...(S.supabaseFaculty || [])];
};

export function allMatches(r){return fullPool().map(c=>({c,e:evaluate(c,r)})).filter(x=>x.e).sort((a,b)=>b.e.score-a.e.score)}
export function candState(id){return S.i.cands[id]||(S.i.cands[id]={fav:false,int:false,status:''})}
export function ring(v,color){const C=151;return `<div class="ringwrap"><svg viewBox="0 0 58 58"><circle class="bg" cx="29" cy="29" r="24"/><circle class="fg" cx="29" cy="29" r="24" stroke="${color}" stroke-dasharray="${C}" stroke-dashoffset="${C-C*v/100}"/></svg><b>${v}</b></div>`}
export function renderResults(){
  const r=R();
  loadSupabaseFaculty();
  const isLoading = S.supabaseFaculty === null;
  const m=allMatches(r),tabs={best:'Best fit',similar:'Similar',suggested:'Worth a look'};
  const by=k=>m.filter(x=>x.e.tier===k);
  const list=by(S.i.tab);
  return `<div class="results ${S.enter?'enter':''}"><div class="results-inner">
    <div class="rhead" style="display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap">
      <div><button class="btn sm ghost" data-act="page" data-v="chat" style="padding-left:0">Back to chat</button><h2>${esc(r.count)} ${esc(r.role)}${+r.count>1?'s':''}, ${esc(r.dept)}</h2><div class="muted">${r.salary?inr(r.salary.min)+' to '+inr(r.salary.max)+' a month, ':''}${esc(S.i.dist)}</div></div>
      <label class="toggle"><input type="checkbox" data-act="notify" ${r.notify?'checked':''}><i></i>Email me new matches</label>
    </div>
    ${isLoading ? `
      <div class="empty" style="padding:48px 16px;text-align:center;">
        <div class="seal" style="margin:0 auto 16px;background:var(--mist);color:var(--indigo);animation:pulse 1.4s infinite;">${ICON.search || '🔍'}</div>
        <h4 style="margin:0 0 6px;color:var(--navy);">Querying Faculty Profiles from Supabase...</h4>
        <p class="muted" style="margin:0;font-size:13px;">Analyzing public.faculty_profiles database records against your requirements.</p>
      </div>
    ` : `
      ${!by('best').length?`<div class="info" style="margin-top:16px">No profile meets every requirement yet. This requirement stays live and we'll email ${esc(S.i.email)} when someone matches.</div>`:''}
      <div class="tabs">${Object.entries(tabs).map(([k,l])=>`<button class="${S.i.tab===k?'on':''}" data-act="tab" data-v="${k}">${l}<span class="cnt">${by(k).length}</span></button>`).join('')}</div>
      ${list.length?`<div class="cands">${list.map(x=>candCard(x.c,x.e)).join('')}</div>`:`<div class="empty">No profiles found in this group yet from Supabase. Try the other tabs, or widen the requirement from the panel.</div>`}
    `}
  </div></div>`;
}
export function candCard(c,e){
  const st=candState(c.id), short=st.fav||st.int||st.status;
  const name=short||c.isNew?c.name:c.name.replace(/^(Dr\.\s*)?(.*)$/,(a,d,n)=>(d||'')+n.split(' ').map(w=>w[0]+'.').join(' '));
  const v=e.tier==='suggested'?e.quality:e.score, col=e.tier==='best'?'#2F9E5E':e.tier==='similar'?'#0C8F8B':'#F2A93B';
  const rel=c.dist===S.i.dist?'Local':c.reloc.length?'Will relocate':'Not relocating';
  let flag='';
  if(e.tier==='similar'&&e.gaps.length) flag=`<div class="flag gap">${esc(e.gaps[0])}${e.gaps.length>1?` and ${e.gaps.length-1} more`:''}</div>`;
  if(e.tier==='suggested') flag=`<div class="flag miss">${esc([...e.hard,...e.gaps].slice(0,2).join(', '))}</div><div class="flag ok">Strong because: ${esc(e.why.slice(0,2).join(', '))}</div>`;
  return `<div class="cand">
    <div class="cand-h"><div class="ava" style="background:${c.color}">${initials(c.name)}</div><div><h4>${esc(name)}${c.isNew?' <span class="pill indigo">New</span>':''}</h4><div class="meta">${esc((c.desig||[])[0]||'')}, ${esc(c.dist)}</div></div>${ring(v,col)}</div>
    <div class="keyfacts"><span>${esc(c.qual)}</span><span>${Math.round(c.expA+c.expI)} yrs</span><span>${inr(c.sal)}/mo</span><span>${rel}</span></div>
    ${flag}
    <div class="cand-a">
      <button class="iconbtn ${st.fav?'on':''}" data-act="fav" data-id="${c.id}" aria-label="Favourite" title="Favourite">${ICON.star}</button>
      <button class="btn sm int ${st.int?'on':''}" data-act="int" data-id="${c.id}">${st.int?'Interested':'Mark interested'}</button>
      <button class="btn sm ghost" data-act="profile" data-id="${c.id}">View profile</button>
      <span class="grow"></span>
      ${st.status?`<span class="pill jade">${esc(st.status)}</span>`:`<button class="btn sm primary" data-act="schedule" data-id="${c.id}" ${short?'':'disabled title="Mark favourite or interested first"'}>Schedule</button>`}
    </div>
  </div>`;
}
export function openProfile(id){
  const c=fullPool().find(x=>x.id===id),r=R(),e=r?evaluate(c,r):null,st=candState(id),short=st.fav||st.int||st.status||c.isNew;
  const md=c.media||{},vu=md.voice&&md.voice.url,cu=md.video&&md.video.url;
  const media=(vu||cu)?`${vu?`<audio controls src="${vu}" style="width:100%"></audio>`:''}${cu?`<video controls src="${cu}" style="width:100%;border-radius:12px;margin-top:8px"></video>`:''}`:`<div class="rec" style="justify-content:center">${c.intro.includes('Video')?ICON.cam:ICON.mic}&nbsp; ${esc(c.intro)} intro</div>`;
  $('#modal').innerHTML=`<div class="modal-bg" data-act="closeModal"><div class="modal">
    <div class="cand-h"><div class="ava" style="background:${c.color}">${initials(c.name)}</div><div><h3>${esc(short?c.name:initials(c.name))}</h3><div class="muted">${esc(c.desig.join(', '))}</div></div>${e?ring(e.tier==='suggested'?e.quality:e.score,'#0C8F8B'):''}</div>
    <div class="detail">
      <div><span>Departments</span>${esc(c.depts.join(', '))}</div><div><span>Subjects</span>${esc(c.subj.join(', '))}</div>
      <div><span>Qualification</span>${esc(c.qual)}</div><div><span>Experience</span>${c.expA} academic, ${c.expI} industry</div>
      <div><span>Publications</span>${c.pubs} (${c.scopus} Scopus)</div><div><span>Accreditation</span>${esc(c.accr.join(', ')||'None')}</div>
      <div><span>Coordinator roles</span>${esc(c.coord.join('; ')||'None')}</div><div><span>AI skills</span>${c.ai}</div>
      <div><span>Expected salary</span>${inr(c.sal)} a month</div><div><span>Location</span>${esc(c.dist)}${c.reloc.length?', will move to '+esc(c.reloc.join(', ')):''}</div>
      ${short?`<div><span>Family</span>${esc(c.fam||'Not shared')}</div><div><span>Preferred stay</span>${esc(c.stay||'Not shared')}</div>`:''}
    </div>
    ${e&&(e.hard.length||e.gaps.length)?`<div class="flag gap" style="margin-top:16px"><b>Differences from your requirement:</b> ${esc([...e.hard,...e.gaps].join(', '))}</div>`:''}
    <h4 style="margin:22px 0 10px">Introduction</h4>${media}
    <h4 style="margin:22px 0 4px">Personality</h4>
    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:center">${radar(c.traits,220)}<div>${personaText(c.traits)}</div></div>
    ${short?'':'<p class="muted" style="font-size:12.5px">Full name and family details appear once you mark this profile as favourite or interested.</p>'}
    <div class="acts"><button class="btn" data-act="closeModal">Close</button></div></div></div>`;
}
export const PIPE=['Invite sent','Scheduled','Interviewed','Selected','Offer sent','Joined','On hold','Not selected'];
export function renderInterviews(){
  const rows=fullPool().filter(c=>S.i.cands[c.id]&&(S.i.cands[c.id].status||S.i.cands[c.id].fav||S.i.cands[c.id].int));
  return `<div class="results ${S.enter?'enter':''}"><div class="results-inner"><div class="rhead"><h2>Interviews</h2><p class="muted" style="margin:0 0 18px">Everyone you have shortlisted, and where they are in the process.</p></div>
    ${rows.length?`<table class="list"><tr><th>Candidate</th><th>Interview</th><th>Status</th><th></th></tr>${rows.map(c=>{const st=S.i.cands[c.id];return `<tr><td><b>${esc(c.name)}</b><div class="muted">${esc(c.depts.join(', '))}</div></td>
      <td>${st.iv?`<b>${esc(st.iv.mode)}</b><div class="muted">${st.iv.slots.filter(Boolean).map(s=>new Date(s).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})).join('<br>')}</div>`:'<span class="muted">Not scheduled</span>'}</td>
      <td>${st.status?`<select class="in" data-act="setStatus" data-id="${c.id}" style="padding:6px 30px 6px 9px">${PIPE.map(p=>`<option ${st.status===p?'selected':''}>${p}</option>`).join('')}</select>`:`<span class="pill gold">${st.fav?'Favourite':'Interested'}</span>`}</td>
      <td>${st.status?'':`<button class="btn sm primary" data-act="schedule" data-id="${c.id}">Schedule</button>`}</td></tr>`}).join('')}</table>`:`<div class="empty">No one shortlisted yet. Open a requirement's matches and mark profiles as favourite or interested.</div>`}
    <div class="info" style="margin-top:16px">Candidates and panel members get reminders 24 hours and 1 hour before each interview.</div>
  </div></div>`;
}
export function openSchedule(id){
  const c=fullPool().find(x=>x.id===id);
  const d=new Date();d.setDate(d.getDate()+2);d.setHours(10,30,0,0);
  const iso=x=>new Date(x-x.getTimezoneOffset()*6e4).toISOString().slice(0,16);
  const s2=new Date(d);s2.setHours(14,30);const s3=new Date(d);s3.setDate(d.getDate()+1);
  $('#modal').innerHTML=`<div class="modal-bg" data-act="closeModal"><div class="modal">
    <h3>Schedule an interview</h3><p class="muted" style="margin-top:0">with ${esc(c.name)}</p>
    <div class="grid">
      <div class="field full"><label>Mode</label><div class="chips" id="ivMode">${['Online','In person','Demo class'].map((m,i)=>`<button type="button" class="chip ${i===0?'on':''}" data-mode="${m}">${m}</button>`).join('')}</div></div>
      <div class="field full"><label>Interview panel</label><input class="in" id="ivPanel" placeholder="e.g. Principal, HOD-CSE, Dean Academics"></div>
      <div class="field full"><label>Offer up to 3 time slots</label><input class="in" type="datetime-local" id="ivS1" value="${iso(d)}"><input class="in" type="datetime-local" id="ivS2" value="${iso(s2)}" style="margin-top:6px"><input class="in" type="datetime-local" id="ivS3" value="${iso(s3)}" style="margin-top:6px"></div>
      <div class="field full"><label>Message to the candidate</label><textarea class="in" id="ivMsg">Dear ${esc(c.name.split(' ').slice(-1)[0])}, we were impressed by your profile and would like to invite you for an interview. Please choose a slot that suits you.</textarea></div>
    </div>
    <div class="acts"><button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="sendInvite" data-id="${id}">Send invite</button></div>
  </div></div>`;
  document.querySelectorAll('#ivMode .chip').forEach(b=>b.onclick=()=>{document.querySelectorAll('#ivMode .chip').forEach(x=>x.classList.remove('on'));b.classList.add('on')});
}
