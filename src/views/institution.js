/* Institution workspace: chat-style requirement builder and live requirement panel. */
import { S, esc, inr } from '../core/state.js';
import { ICON, brandMark } from '../core/ui.js';
import { TRAITS } from '../data/catalog.js';
import { QUICK_DEPTS, ROLE_CHIPS, instDepts } from '../logic/chatParser.js';
import { renderInterviews, renderResults } from '../logic/matching.js';

/* ======================= 6) INSTITUTION LOGIN ======================== */
export const REQ_FLOW = [
  {k:'role',must:1,label:'Designation',q:'Which position are you hiring for?',chips:['Assistant Professor','Associate Professor','Professor','HOD','Dean','Principal']},
  {k:'dept',must:1,label:'Department',q:'Which department is this for?',chips:['CSE','IT','AI & DS','ECE','EEE','Mechanical','Civil','MBA','English','Mathematics','Commerce']},
  {k:'subjects',must:1,label:'Subjects',q:'Which subjects should this person be able to teach? Pick below or type them with commas.',multi:1},
  {k:'count',must:1,label:'Vacancies',q:'How many people do you need for this role?',chips:['1','2','3','4','5+']},
  {k:'qual',must:1,label:'Qualification',q:'What is the minimum qualification?',chips:['PG','PG + NET/SET','PhD (pursuing accepted)','PhD']},
  {k:'exp',must:1,label:'Experience',q:'How much experience do you need?',chips:['Fresher','1-3 years','3-5 years','5-10 years','10+ years']},
  {k:'salary',must:1,label:'Salary / month',q:'What salary range can you offer per month?',chips:['₹25k–35k','₹35k–50k','₹50k–75k','₹75k–1L','₹1L–1.5L']},
  {k:'gender',must:1,label:'Gender',q:'Do you have a gender preference for this role?',chips:['Any','Male','Female']},
  {k:'age',must:0,label:'Age range',q:'Is there a preferred age range?',chips:['No preference','25-35','30-40','35-50','45+']},
  {k:'joining',must:1,label:'Joining',q:'When should the person join?',chips:['Immediate','Within 30 days','Within 60 days','Within 90 days']},
  {k:'accom',must:1,label:'Accommodation',q:'Do you provide accommodation for faculty?',chips:['Yes – Free','Yes – Paid','No']},
  {k:'transport',must:1,label:'Transport',q:'Do you provide college transport?',chips:['Yes – Free','Yes – Paid','No']},
  {k:'traits',must:0,label:'Key qualities',q:'Which qualities matter most for this role? Pick up to 3 and press Done, or skip.',multi:1,chips:Object.values(TRAITS)}
];
export const newReq = () => ({id:Date.now(),msgs:[],role:'',dept:'',subjects:null,count:'',qual:'',exp:null,salary:null,gender:'',age:'',joining:'',accom:'',transport:'',traits:null,asking:null,confirmed:false,notify:true});
export const R = () => S.i.reqs[S.i.cur];

export function renderInst(){
  const I=S.i;
  const r=R();
  return `<div class="ishell">
    <aside class="inav">
      <button class="btn gold" data-act="newReq">New requirement</button>
      <div class="sec">Requirements</div>
      ${I.reqs.map((q,i)=>`<button class="item ${i===I.cur&&I.page!=='interviews'?'on':''}" data-act="openReq" data-i="${i}"><span>${esc(q.role||'New requirement')}${q.dept?', '+esc(q.dept):''}</span><small>${q.confirmed?'Live':'Draft'}</small></button>`).join('')}
      <div class="sec">Hiring</div>
      <button class="item ${I.page==='interviews'?'on':''}" data-act="page" data-v="interviews"><span>Interviews</span><small>${Object.values(I.cands).filter(c=>c.status||c.fav||c.int).length}</small></button>
      <div class="org"><b>${esc(I.name)}</b>${esc(I.type)}, ${esc(I.dist)}<br><button class="btn sm ghost" data-act="signOut">Sign out</button></div>
    </aside>
    <section class="icenter">${I.page==='interviews'?renderInterviews():(r&&r.confirmed&&I.page==='results'?renderResults():renderChat())}</section>
    <aside class="ipanel ${I.panelMob?'mob':''}">${renderReqPanel()}</aside>
  </div>`;
}

export function renderChat(){
  const r=R();
  const ask=r&&r.asking;
  const qd=QUICK_DEPTS[S.i.type]||instDepts().slice(0,3), rl=ROLE_CHIPS(S.i.type);
  const quick=!r||!r.msgs.length?`<div class="chips">${[`${rl[0]} in ${qd[0]}`,`HOD for ${qd[1]||qd[0]}`,`${rl[1]} for ${qd[2]||qd[0]}`,'Principal'].map(c=>`<button class="chip" data-act="quick" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>`:'';
  const msgs=r?r.msgs.map(m=>msgHTML(m)).join(''):'';
  if(r)r.msgs.forEach(m=>m.fresh=false);
  return `<div class="chat" id="chat"><div class="chat-inner">
      ${!r||!r.msgs.length?`<div class="welcome"><div class="mark">${brandMark(30)}</div><h2>Who are you looking to hire?</h2><p style="margin-bottom:8px"><span class="pill indigo">${esc(S.i.type)}, ${esc(S.i.dist)}</span></p><p>Describe the role in your own words. IRA will ask about anything that's missing.</p><p class="muted" style="font-size:13.5px;margin-top:12px">Try: "Need 2 ${rl[0].toLowerCase()}s for ${qd[0]} with PhD, 3-5 years experience, around 50-60k"</p></div>`:''}
      ${msgs}
      ${r&&r.typing?`<div class="msg bot"><div class="av">IRA</div><div class="bubble typing"><span></span><span></span><span></span></div></div>`:''}
    </div></div>
    <div class="composer">${quick}
      <div class="box"><textarea id="cin" rows="1" placeholder="${ask?'Type your answer, or tap an option above':'Describe the vacancy'}"></textarea><button class="send" data-act="send" aria-label="Send">${ICON.send}</button></div>
      <div class="fine">Check the requirement before confirming. <a href="#" data-act="togglePanel">Show requirement</a></div>
    </div>`;
}
export function msgHTML(m){
  const fr=m.fresh?' fresh':'';
  if(m.from==='user') return `<div class="msg user${fr}"><div class="av">You</div><div class="bubble">${esc(m.text)}</div></div>`;
  let extra='';
  const r=R();
  if(m.chips&&m.live&&r&&r.asking===m.k){
    const f=REQ_FLOW.find(x=>x.k===m.k);
    const cur=f.multi?(r['_'+m.k]||[]):[];
    extra=`<div class="chips">${m.chips.map(c=>`<button class="chip ${cur.includes(c)?'on':''}" data-act="${f.multi?'pickMulti':'pick'}" data-v="${esc(c)}">${esc(c)}</button>`).join('')}${f.multi?`<button class="chip" data-act="multiDone" style="border-color:var(--indigo);color:var(--indigo)">Done</button>`:''}${!f.must?`<button class="chip" data-act="skip">Skip</button>`:''}</div>`;
  }
  if(m.summary) extra=`<div class="summary"><h5>Your requirement</h5>${esc(m.summary)}${m.live&&!r.confirmed?`<div class="acts"><button class="btn primary sm" data-act="confirmReq">Confirm and find matches</button><button class="btn sm" data-act="togglePanel">Edit details</button></div>`:''}</div>`;
  if(m.results) extra=`<div style="margin-top:12px"><button class="btn primary sm" data-act="page" data-v="results">View matched profiles</button></div>`;
  return `<div class="msg bot${fr}"><div class="av">IRA</div><div class="bubble">${m.html||esc(m.text)}${extra}</div></div>`;
}
export function fmtReq(r,k){
  const v=r[k];
  if(v==null||v==='')return '';
  if(k==='salary')return `${inr(v.min)} – ${inr(v.max)}`;
  if(k==='exp')return v.label;
  if(Array.isArray(v))return v.length?v.join(', '):'None';
  return String(v);
}
export function renderReqPanel(){
  const r=R();
  if(!r) return `<h3>Requirement</h3><p class="muted">Start a chat to build a requirement.</p>`;
  const filled=REQ_FLOW.filter(f=>f.must&&fmtReq(r,f.k)).length, total=REQ_FLOW.filter(f=>f.must).length;
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h3>Requirement</h3>${S.i.panelMob?'<button class="btn sm ghost" data-act="togglePanel">Close</button>':''}</div>
    <div class="muted" style="font-size:12.5px;margin:4px 0 10px">${filled} of ${total} required details. Click any value to edit.</div>
    <div class="track" style="background:var(--mist);margin-bottom:12px"><i style="width:${filled/total*100}%;background:var(--indigo)"></i></div>
    ${REQ_FLOW.map(f=>{const v=fmtReq(r,f.k);return `<div class="reqrow ${f.must?'must':''} ${r._flash&&r._flash.includes(f.k)?'flash':''}"><span class="k">${f.label}</span>${S.i.editing===f.k?`<input class="in" id="reqEdit" value="${esc(v)}" data-ek="${f.k}">`:`<span class="v ${v?'':'unset'}" data-act="editReq" data-k="${f.k}">${v?esc(v):'Not set'}</span>`}</div>`}).join('')}
    <div class="reqrow"><span class="k">Location</span><span class="v" style="cursor:default">${esc(S.i.dist)}</span></div>
    ${r.gender&&r.gender!=='Any'?`<div class="note" style="margin-top:14px">Gender is used as a preference, not a strict filter. Is it needed for this role, such as a hostel warden post?</div>`:''}
    ${r.confirmed?`<div style="margin-top:16px"><label class="toggle"><input type="checkbox" data-act="notify" ${r.notify?'checked':''}><i></i>Email me when new matches join</label></div>`:''}`;
}
