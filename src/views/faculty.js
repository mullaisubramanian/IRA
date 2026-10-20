/* Faculty profile wizard: 13 locked steps, conditional fields, validation and the relocation map. */
import { $, D, S, esc, getP, slug, toast } from '../core/state.js';
import { ICON, NOW_Y, YEARS, age, chips, domainChips, fld, inp, monthYear, sel, ta, tagInput, upload, yearsBetween, ym, yn } from '../core/ui.js';
import { ACCR_BODIES, AI_LEVELS, AI_PURPOSES, AI_TOOLS, COORD_ROLES, DESIGNATIONS, INST_TYPES, MONTHS, OTHER_CITIES, PG_DEGREES, STATES, STEPS, SUBJECTS, TN_DISTRICTS, TN_OUTLINE, UG_DEGREES, districtsOf } from '../data/catalog.js';
import { quizDone, renderQuiz } from './assessment.js';
import { renderFacultyDone } from './facultyDone.js';
import { proj } from './landing.js';

/* ======================= 4) FACULTY LOGIN ========================== */
export function renderFaculty(){
  if(S.f.submitted) return renderFacultyDone();
  const st=S.f.step, pct=Math.round(Object.keys(S.f.done).length/STEPS.length*100);
  return `<div class="fshell">
    <aside class="rail">
      <div class="who"><h3>${esc(D.name||'Your faculty profile')}</h3><div class="pct"><span>Profile completion</span><span>${pct}%</span></div><div class="track"><i style="width:${pct}%"></i></div></div>
      <ol>${STEPS.map((s,i)=>{const lock=i>S.f.max;return `<li class="${i===st?'on':''} ${S.f.done[i]&&i!==st?'done':''} ${lock?'lock':''}"><button data-act="goStep" data-i="${i}" ${lock?'aria-disabled="true" title="Complete the earlier steps first"':''}><span class="n">${lock?ICON.lock:S.f.done[i]&&i!==st?ICON.check:i+1}</span><span class="lbl">${s[0]}</span></button></li>`}).join('')}</ol>
    </aside>
    <section class="fmain ${S.enter?'enter':''}">
      <div class="fhead"><div class="k">Step ${st+1} of ${STEPS.length}</div><h2>${STEPS[st][0]}</h2><p>${STEPS[st][1]}</p></div>
      ${STEP_FN[st]()}
      <div class="ffoot">
        <button class="btn ghost" data-act="prev" ${st===0?'style="visibility:hidden"':''}>Back</button>
        <div style="display:flex;gap:8px"><button class="btn" data-act="saveDraft">Save draft</button>
        <button class="btn primary" data-act="next" id="nextBtn">${st===STEPS.length-1?'Submit profile':'Save and continue'}</button></div>
      </div>
    </section></div>`;
}

export const STEP_FN = [
/* 1 Personal */ () => {
  const a=age(D.dob);
  let m='';
  if(D.marital==='Married') m=`<div class="reveal grid">${fld('Spouse name',inp('spouse','Husband or wife name'),{req:1})}${fld('Do you have children?',yn('hasKids'),{req:1})}${D.hasKids==='Yes'?fld('Number of children',chips('kids',['1','2','3','More than 3']),{req:1,full:1}):''}</div>`;
  if(D.marital==='Single parent') m=`<div class="reveal grid">${fld('Do you have children?',yn('spHasKids'),{req:1,full:1})}${D.spHasKids==='Yes'?fld('Number of children',chips('spKids',['1','2','3','More than 3']),{req:1,full:1}):''}</div>`;
  if(D.marital==='Unmarried') m=`<div class="reveal grid">${fld("Father's name",inp('father'),{req:1})}${fld("Mother's name",inp('mother'),{req:1})}${fld('Parent or guardian phone',inp('parentPhone','+91','tel'),{hint:'Optional emergency contact'})}</div>`;
  const days=Array.from({length:31},(_,i)=>String(i+1));
  return `<div class="fcard"><div class="grid">
    ${fld('Full name',inp('name','As in your certificates'),{req:1,full:1})}
    ${fld('Gender',chips('gender',['Male','Female','Other','Prefer not to say']),{req:1,full:1})}
    ${fld('Date of birth',`<div class="dob">${sel('dobD',days,'Day',true)}${sel('dobM',MONTHS.map((m,i)=>[String(i+1),m]),'Month',true)}${sel('dobY',YEARS(1950,NOW_Y-18),'Year',true)}</div>`,{req:1,hint:a?`You are <b>${a} years</b> old.`:'Your age is calculated automatically.'})}
    ${fld('Profile photo',upload('photo','image/*','Upload photo'))}
    ${fld('Email ID',inp('email','name@email.com','email','readonly'),{req:1,hint:'Your login email.'})}
    ${fld('Mobile number',inp('mobile','98xxx xxxxx','tel','maxlength="14"'),{req:1,hint:'For interview reminders.'})}
    ${fld('LinkedIn profile',inp('linkedin','https://linkedin.com/in/your-name','url'),{req:1,full:1})}
    ${fld('Marital status',chips('marital',['Married','Unmarried','Single parent']),{req:1,full:1})}
    ${m?`<div class="full">${m}</div>`:''}
  </div></div>
  <div class="fcard"><div class="info">Family details are shown to a college only after it shortlists you, and they are never used to score matches.</div></div>`;
},
/* 2 Location */ () => {
  const allPlaces=['Anywhere in Tamil Nadu',...Object.keys(TN_DISTRICTS),...Object.keys(OTHER_CITIES)];
  const showTime=['Own vehicle','Both'].includes(D.commute);
  return `<div class="fcard"><div class="grid">
    ${fld('Current state',sel('state',STATES,'Select state',true),{req:1})}
    ${D.state==='Other'?`${fld('Your state',inp('stateOther','Type your state'),{req:1})}${fld('Your district or city',inp('district','Type your district'),{req:1})}`:fld(`District in ${esc(D.state)}`,sel('district',districtsOf(D.state),'Select district',true),{req:1,hint:`${districtsOf(D.state).length} districts`})}
    ${fld('Are you willing to relocate to Tamil Nadu?',yn('relocate'),{req:1,full:1})}
  </div></div>
  ${D.relocate==='Yes'?`<div class="fcard"><h4>Where would you like to work?</h4>
    <div class="split">
      <div class="left">${fld('Preferred districts or cities',tagInput('relocList',allPlaces,'Type or choose a district, e.g. Chennai'),{req:1,hint:'You can also tap a dot on the map. Your first choice goes first.'})}</div>
      <div class="right"><div class="maplegend"><span><i style="background:#fff"></i>You are here</span><span><i style="background:var(--marigold)"></i>Preferred</span></div><div class="mapwrap">${mapSVG()}</div></div>
    </div></div>`:''}
  <div class="fcard"><div class="grid">
    ${fld('Preferred stay',chips('stay',['Own home','Rented house','PG','College hostel / staff quarters']),{req:1,full:1})}
    ${fld('How will you commute?',chips('commute',['Own vehicle','College transport','Both']),{req:1,full:1})}
    ${showTime?`<div class="full reveal">${fld('Daily travel time you are comfortable with (one way)',chips('maxCommute',['Up to 30 min','Up to 1 hour','Up to 1.5 hours','Up to 2 hours']),{req:1})}</div>`:''}
  </div></div>`;
},
/* 3 Education */ () => {
  const deg=(k,t,list)=>{const v=getP(D,k+'.deg');return `<h4>${t}</h4><div class="grid g3">
    ${fld('Degree',sel(k+'.deg',list,'Select degree',true),{req:1})}
    ${v==='Other'?fld('Type your degree',inp(k+'.other','e.g. B.Sc Fashion Technology'),{req:1}):''}
    ${fld('Specialisation',inp(k+'.spec','e.g. Computer Science'))}
    ${fld('College or university',inp(k+'.college'))}
    ${fld('Year of passing',sel(k+'.year',YEARS(1970,NOW_Y),'Year',k==='ug'))}
    ${fld('Percentage or CGPA',inp(k+'.pct','e.g. 78% or 8.2'))}</div>`};
  const ugRecent=+D.ug.year>=NOW_Y;
  return `<div class="fcard">${deg('ug','UG degree',UG_DEGREES)}</div>
  ${ugRecent?`<div class="fcard"><div class="info">You completed your UG in ${esc(D.ug.year)}, so PG and PhD details are not needed.</div></div>`:
    `<div class="fcard"><div class="grid">
      ${fld('Have you completed Post Graduation (PG)?',yn('hasPg'),{req:1,full:1})}
    </div></div>
    ${D.hasPg==='Yes'?`<div class="fcard reveal">${deg('pg','PG degree',PG_DEGREES)}</div>`:''}
    <div class="fcard"><div class="grid">
      ${fld('Have you completed or pursuing a Doctorate / Ph.D.?',yn('hasPhd'),{req:1,full:1})}
      ${D.hasPhd==='Yes'?`<div class="full reveal grid g3">
        ${fld('PhD status',chips('phd',['Completed','Pursuing','Thesis submitted']),{req:1,full:1})}
        ${fld('University',inp('phdUni'),{req:1})}
        ${fld('Research topic',inp('phdTopic'))}
        ${fld(D.phd==='Completed'?'Year awarded':'Year registered',sel('phdYear',YEARS(1980,NOW_Y),'Year'))}
        ${D.phd==='Completed'?fld('Have you completed a post-doctorate?',yn('postdoc'),{req:1,full:1}):''}
        ${D.phd==='Completed'&&D.postdoc==='Yes'?`<div class="full reveal">${fld('Where did you complete it? (institution, country)',inp('postdocInst'),{req:1})}</div>`:''}
      </div>`:''}
      ${fld('Eligibility tests cleared',chips('tests',['UGC-NET','CSIR-NET','SET','SLET','GATE','None'],true),{full:1})}
      ${fld('Professional certifications',ta('certs','e.g. AWS Solutions Architect (2024), Six Sigma Green Belt'),{full:1})}
    </div></div>`}`;
},
/* 4 Area of interest */ () => {
  let lvl2='';
  D.types.forEach(t=>{
    const dk='depts.'+slug(t);
    lvl2+=`<div class="fcard"><h4>${esc(t)}: departments</h4>${chips(dk,INST_TYPES[t],true)}`;
    (getP(D,dk)||[]).forEach(dep=>{
      lvl2+=`<div class="reveal" style="margin-top:16px">${fld(`${esc(dep)}: subjects you teach best`,tagInput('subjects.'+slug(dep),SUBJECTS[dep]||[],'Type a subject or select from list'),{req:1,hint:'Add 1 to 10 subjects. Click from the list or type.'})}</div>`;
    });
    lvl2+=`</div>`;
  });
  return `<div class="fcard">${fld('Which domain or institution type do you prefer?',domainChips('types',Object.keys(INST_TYPES)),{req:1,hint:'Select your core domain. Incompatible domains are automatically restricted.'})}</div>
  ${lvl2}
  <div class="fcard">${fld('Designation you are applying for',chips('desig',DESIGNATIONS,true),{req:1})}</div>`;
},
/* 5 Experience */ () => {
  const fresher=D.expType==='Fresher';
  const acad=D.acad.map((e,i)=>`<div class="rep"><button class="btn sm ghost rm" data-act="rmRow" data-k="acad" data-i="${i}">Remove</button><h5>College ${i+1}</h5><div class="grid">
    ${fld('College name',inp(`acad.${i}.college`),{req:1})}${fld('Designation',sel(`acad.${i}.desig`,DESIGNATIONS))}
    ${fld('Department',inp(`acad.${i}.dept`))}${fld('Subjects or papers handled',inp(`acad.${i}.subj`,'Separate with commas'))}
    ${fld('From',monthYear(`acad.${i}.from`),{req:1})}${fld('To',monthYear(`acad.${i}.to`),{hint:'Leave empty if you work here now'})}</div></div>`).join('');
  const ind=D.ind.map((e,i)=>`<div class="rep"><button class="btn sm ghost rm" data-act="rmRow" data-k="ind" data-i="${i}">Remove</button><h5>Company ${i+1}</h5><div class="grid">
    ${fld('Company name',inp(`ind.${i}.company`),{req:1})}${fld('Role',inp(`ind.${i}.role`))}
    ${fld('Domain',inp(`ind.${i}.domain`,'e.g. Automotive, IT services'))}${fld('Key work',inp(`ind.${i}.work`))}
    ${fld('From',monthYear(`ind.${i}.from`),{req:1})}${fld('To',monthYear(`ind.${i}.to`),{hint:'Leave empty if you work here now'})}</div></div>`).join('');
  const span=e=>yearsBetween(ym(e.fromY,e.fromM),ym(e.toY,e.toM));
  const ya=D.acad.reduce((s,e)=>s+span(e),0), yi=D.ind.reduce((s,e)=>s+span(e),0);
  const showA=['Academic only','Both'].includes(D.expType), showI=['Industry only','Both'].includes(D.expType);
  return `<div class="fcard">${fld('Your experience is in',chips('expType',['Academic only','Industry only','Both','Fresher']),{req:1})}</div>
  ${showA?`<div class="fcard"><h4>Academic experience</h4>${acad}<button class="btn sm" data-act="addRow" data-k="acad">Add a college</button></div>`:''}
  ${showI?`<div class="fcard"><h4>Industry experience</h4>${ind}<button class="btn sm" data-act="addRow" data-k="ind">Add a company</button></div>`:''}
  ${(showA||showI)&&(ya+yi)>0?`<div class="fcard"><div class="info">Total experience: <b>${(ya+yi).toFixed(1)} years</b> (academic ${ya.toFixed(1)}, industry ${yi.toFixed(1)})</div></div>`:''}
  ${D.expType?`<div class="fcard"><h4>Salary</h4><div class="grid">
    ${fld('Show amounts as',chips('salUnit',['Per month','LPA (per year)']),{full:1})}
    ${fresher?'':fld('Current or last salary',inp('curSal','e.g. 45000','number'),{req:1})}
    ${fresher?'':fld('Is your salary negotiable?',yn('negotiable'))}
    ${fld('Expected salary: minimum',inp('expMin','Lowest you will accept','number'),{req:1})}
    ${fld('Expected salary: target',inp('expMax','What you expect','number'),{req:1})}
    ${fresher?'':fld('Notice period',sel('notice',['Immediate','15 days','30 days','60 days','90 days']),{req:1})}
    ${fresher?'':fld('Reason for change',inp('reason','Optional, one line'))}
  </div></div>`:''}`;
},
/* 6 Coordinator roles */ () => {
  const rows=D.coord.filter(r=>r!=='None').map(r=>{const k='coordDur.'+slug(r);return `<div class="rep"><h5>${esc(r)}</h5><div class="grid g3">
    ${fld('Duration',inp(k+'.n','e.g. 3','number','min="1"'),{req:1})}${fld('Unit',sel(k+'.u',['Years','Months'],'Years or months'),{req:1})}${fld('Key achievement',inp(k+'.ach','e.g. Placed 180 students in 2025'))}</div></div>`}).join('');
  return `<div class="fcard">${fld('Which responsibilities have you handled?',chips('coord',COORD_ROLES,true),{req:1,hint:'Choose every role you have held, or None.'})}</div>
  ${rows?`<div class="fcard"><h4>How long did you handle each role?</h4>${rows}</div>`:''}`;
},
/* 7 Accreditation */ () => {
  const rows=D.accr.map(b=>{const k='accrWork.'+slug(b);return `<div class="rep"><h5>${esc(b)}</h5><div class="grid">
    ${fld('What work did you do?',ta(k+'.w','e.g. Prepared Criterion 3 of the NAAC SSR'),{req:1,full:1})}
    ${fld('Year',sel(k+'.y',YEARS(2000,NOW_Y),'Year'))}${fld('Outcome',inp(k+'.o','e.g. A+ grade'))}</div></div>`}).join('');
  return `<div class="fcard">${fld('Have you worked on accreditation or ranking?',yn('accrDone'),{req:1})}
    ${D.accrDone==='Yes'?`<div class="reveal" style="margin-top:14px">${fld('Which ones?',chips('accr',ACCR_BODIES,true),{req:1})}</div>`:''}</div>
  ${D.accrDone==='Yes'&&rows?`<div class="fcard">${rows}</div>`:''}`;
},
/* 8 Research */ () => {
  const n=Math.min(+D.papers||0,20);
  while(D.paperList.length<n)D.paperList.push({title:'',journal:'',year:'',level:'',index:[],url:'',file:null});
  D.paperList.length=n;
  const papers=D.paperList.map((p,i)=>`<div class="rep"><h5>Paper ${i+1}</h5><div class="grid">
    ${fld('Title',inp(`paperList.${i}.title`),{req:1,full:1})}
    ${fld('Journal or conference',inp(`paperList.${i}.journal`))}${fld('Year',sel(`paperList.${i}.year`,YEARS(1990,NOW_Y),'Year'))}
    ${fld('Level',chips(`paperList.${i}.level`,['International','National','Other']),{req:1,full:1})}
    ${fld('Indexing',chips(`paperList.${i}.index`,['Scopus','Web of Science','UGC-CARE','SCI','Other','None'],true),{full:1})}
    ${fld('Proof: DOI or link',inp(`paperList.${i}.url`,'https://doi.org/...','url'))}${fld('Or upload the PDF',upload(`paperList.${i}.file`,'application/pdf','Upload PDF'))}
  </div></div>`).join('');
  return `<div class="fcard"><div class="grid">${fld('How many papers have you published?',inp('papers','0','number','data-rr min="0" max="200"'),{req:1,hint:'Enter 0 if none. A detail card opens for each paper.'})}</div></div>
  ${n?`<div class="fcard"><h4>Publication details</h4>${papers}</div>
  <div class="fcard"><div class="grid">${fld('Patents',ta('patents','Title, status (filed, published or granted), number'))}${fld('Books or book chapters',ta('books','Title, publisher, ISBN'))}</div></div>`:''}
  <div class="fcard"><div class="grid">
    ${fld('Are you a recognised PhD guide?',yn('guide'),{req:1,full:1})}
    ${D.guide==='Yes'?`<div class="full reveal grid">${fld('Which university?',inp('guideUni'),{req:1})}${fld('Scholars guided (completed and ongoing)',inp('scholars','','number'))}</div>`:''}
  </div></div>`;
},
/* 9 Industry */ () => {
  const proj=D.projects.map((p,i)=>`<div class="rep"><button class="btn sm ghost rm" data-act="rmRow" data-k="projects" data-i="${i}">Remove</button><h5>Project ${i+1}</h5><div class="grid">
    ${fld('Project title',inp(`projects.${i}.title`),{req:1})}${fld('Client or company',inp(`projects.${i}.client`))}
    ${fld('Year',sel(`projects.${i}.year`,YEARS(1990,NOW_Y),'Year'))}${fld('Proof link',inp(`projects.${i}.link`,'https://...','url'))}
    ${fld('Short description',ta(`projects.${i}.desc`),{full:1})}
    ${fld('Proof: image or document',upload(`projects.${i}.file`,'image/*,.pdf','Upload proof'),{full:1,hint:'Add a link or a file as proof.'})}</div></div>`).join('');
  const su=D.startups.map((p,i)=>`<div class="rep"><button class="btn sm ghost rm" data-act="rmRow" data-k="startups" data-i="${i}">Remove</button><h5>Startup ${i+1}</h5><div class="grid">
    ${fld('Startup name',inp(`startups.${i}.name`),{req:1})}${fld('Type of support',sel(`startups.${i}.type`,['Mentoring','Idea validation','Technical support','Funding guidance','Market access']))}
    ${fld('Incubator (if any)',inp(`startups.${i}.inc`,'e.g. Atal Incubation Centre'))}${fld('Duration',inp(`startups.${i}.dur`,'e.g. 8 months'))}</div></div>`).join('');
  return `<div class="fcard">${fld('Have you done industry projects?',yn('indProj'),{req:1})}
    ${D.indProj==='Yes'?`<div class="reveal" style="margin-top:14px">${proj}<button class="btn sm" data-act="addRow" data-k="projects">Add a project</button></div>`:''}</div>
  <div class="fcard">${fld('Have you mentored startups or supported business ideas?',yn('startup'),{req:1})}
    ${D.startup==='Yes'?`<div class="reveal" style="margin-top:14px">${su}<button class="btn sm" data-act="addRow" data-k="startups">Add a startup</button></div>`:''}</div>
  <div class="fcard">${fld('Consultancy work for industry',ta('consult','Client, work done, revenue generated (optional)'))}</div>`;
},
/* 10 AI skills */ () => {
  const cards=D.aiTools.map((t,i)=>`<div class="rep"><button class="btn sm ghost rm" data-act="rmRow" data-k="aiTools" data-i="${i}">Remove</button><div class="grid">
    ${fld('AI tool',sel(`aiTools.${i}.tool`,AI_TOOLS,'Select tool',true),{req:1})}
    ${t.tool==='Other'?fld('Tool name',inp(`aiTools.${i}.other`),{req:1}):'<div></div>'}
    ${fld('What do you use it for?',chips(`aiTools.${i}.purposes`,AI_PURPOSES,true),{req:1,full:1})}
    ${fld('Rate yourself',chips(`aiTools.${i}.level`,AI_LEVELS.map(x=>x[0]))+(t.level?`<div class="hint">${AI_LEVELS.find(x=>x[0]===t.level)[1]}</div>`:''),{req:1,full:1})}
    ${fld('One real example',inp(`aiTools.${i}.ex`,'e.g. Built a 40-question MCQ bank for DBMS in 20 minutes'),{full:1})}
  </div></div>`).join('');
  return `<div class="fcard"><h4>AI tools you use</h4>
    ${D.aiNone?'<p class="muted" style="margin-top:0">You have told us you do not use AI tools yet.</p>':cards}
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">${D.aiNone?'':'<button class="btn sm" data-act="addRow" data-k="aiTools">Add an AI tool</button>'}
    <label class="check" style="font-size:13.5px"><input type="checkbox" data-k="aiNone" data-rr ${D.aiNone?'checked':''}> I don't use AI tools yet</label></div></div>`;
},
/* 11 Personality */ () => renderQuiz(),
/* 12 Intro */ () => {
  const wantV=['Voice','Both'].includes(D.introType), wantC=['Video','Both'].includes(D.introType);
  const recBox=type=>{const r=S.rec&&S.rec.type===type?S.rec:null, m=D[type==='Voice'?'voice':'video'], lim=type==='Video'?60:120;
    return `<div class="fcard"><h4>${type==='Voice'?'Voice intro, up to 2 minutes':'Video intro, up to 1 minute'}</h4>
    <div class="rec">${r?`<span class="dot"></span><b id="recTime">0:00</b><span style="opacity:.6">of ${Math.floor(lim/60)}:${String(lim%60).padStart(2,'0')}</span>${type==='Video'?'<video id="live" autoplay muted playsinline></video>':''}<button class="btn sm" data-act="recStop">Stop recording</button>`
      :`<button class="btn gold sm" data-act="recStart" data-type="${type}" ${S.rec?'disabled':''}>${type==='Voice'?ICON.mic:ICON.cam} ${m?'Record again':'Start recording'}</button>
        ${m&&m.url?(type==='Voice'?`<audio controls src="${m.url}"></audio>`:`<video controls src="${m.url}"></video>`):''}
        ${m?`<span class="pill jade">${m.name?esc(m.name):'Recorded, '+m.dur+'s'}</span>`:'<span style="opacity:.65;font-size:13px">Nothing recorded yet</span>'}`}</div>
    <div class="grid" style="margin-top:14px">${fld('Or upload a file',upload(type==='Voice'?'voiceFile':'videoFile',type==='Voice'?'audio/*':'video/*','Upload'))}
    ${type==='Video'?fld('Or paste a YouTube or Drive link',inp('videoLink','https://...','url')):''}</div></div>`};
  return `<div class="fcard">${fld('How would you like to introduce yourself?',chips('introType',['Voice','Video','Both']),{req:1,hint:'Choose Both if you are comfortable with voice and video. At least one recording is required.'})}</div>
  ${wantV?recBox('Voice'):''}${wantC?recBox('Video'):''}
  ${D.introType?`<div class="fcard"><h4>What to talk about</h4><ol style="margin:0;padding-left:18px;color:var(--ink-2)"><li>Who you are and where you work now</li><li>The subjects you teach best</li><li>One achievement you are proud of</li><li>Why you are looking for this move</li></ol></div>`:''}`;
},
/* 13 Documents */ () => `<div class="fcard"><div class="grid">
    ${fld('Resume or CV (PDF)',upload('resume','application/pdf','Upload resume'),{req:1})}
    ${fld('Certificates',upload('certFiles','.pdf,image/*','Upload'),{hint:'Degree, PhD and experience letters'})}
    ${fld('Who can see your profile?',chips('visibility',['All institutions','Only colleges I apply to','Hide from my current employer']),{req:1,full:1})}
  </div></div>
  <div class="fcard"><label class="check"><input type="checkbox" data-k="consent" ${D.consent?'checked':''}><span>I agree to IRA storing my data and sharing my profile with matched institutions under the Digital Personal Data Protection Act, 2023. I can withdraw consent and delete my profile at any time.</span></label></div>`
];

/* --- step validation: a step must be complete before moving on --- */
export const blank = v => v==null || String(v).trim()==='';
export const REQUIRED = {
  0:()=>{
    if(blank(D.name))return 'Enter your full name';
    if(!D.gender)return 'Select your gender';
    if(!D.dob)return 'Select your full date of birth';
    if(!/^\S+@\S+\.\S+$/.test(D.email))return 'Enter a valid email ID';
    if(D.mobile.replace(/\D/g,'').length<10)return 'Enter a valid 10-digit mobile number';
    if(blank(D.linkedin))return 'Add your LinkedIn profile link';
    if(!D.marital)return 'Select your marital status';
    if(D.marital==='Married'){if(blank(D.spouse))return 'Enter your spouse name';if(!D.hasKids)return 'Tell us if you have children';if(D.hasKids==='Yes'&&!D.kids)return 'Select the number of children'}
    if(D.marital==='Single parent'){if(!D.spHasKids)return 'Tell us if you have children';if(D.spHasKids==='Yes'&&!D.spKids)return 'Select the number of children'}
    if(D.marital==='Unmarried'&&(blank(D.father)||blank(D.mother)))return "Enter your parents' names";
    return ''},
  1:()=>(D.state==='Other'&&blank(D.stateOther))?'Type your state':blank(D.district)?'Select your current district':!D.relocate?'Tell us if you are willing to relocate to Tamil Nadu':(D.relocate==='Yes'&&!D.relocList.length)?'Add at least one place you would move to':!D.stay?'Choose your preferred stay':!D.commute?'Choose how you will commute':(['Own vehicle','Both'].includes(D.commute)&&!D.maxCommute)?'Choose your comfortable travel time':'',
  2:()=>{
    const ug=D.ug;
    if(!ug.deg)return 'Select your UG degree';
    if(ug.deg==='Other'&&blank(ug.other))return 'Type your UG degree';
    const ugRecent=+ug.year>=NOW_Y;
    if(ugRecent)return '';
    if(!D.hasPg)return 'Tell us if you have completed Post Graduation (PG)';
    if(D.hasPg==='Yes'){
      if(!D.pg.deg)return 'Select your PG degree';
      if(D.pg.deg==='Other'&&blank(D.pg.other))return 'Type your PG degree';
    }
    if(!D.hasPhd)return 'Tell us if you have completed or pursuing a Doctorate / Ph.D.';
    if(D.hasPhd==='Yes'){
      if(!D.phd||D.phd==='Not applicable')return 'Select your PhD status';
      if(blank(D.phdUni))return 'Enter your PhD university';
      if(D.phd==='Completed'&&!D.postdoc)return 'Tell us if you completed a post-doctorate';
      if(D.phd==='Completed'&&D.postdoc==='Yes'&&blank(D.postdocInst))return 'Enter where you completed your post-doctorate';
    }
    return ''},
  3:()=>{if(!D.types.length)return 'Choose at least one institution type';
    for(const t of D.types){const deps=getP(D,'depts.'+slug(t))||[];if(!deps.length)return `Choose a department under ${t}`;for(const d of deps)if(!(getP(D,'subjects.'+slug(d))||[]).length)return `Add at least one subject for ${d}`}
    return !D.desig.length?'Choose the designation you are applying for':''},
  4:()=>{if(!D.expType)return 'Select your experience type';
    if(['Academic only','Both'].includes(D.expType)){if(!D.acad.length)return 'Add at least one college';for(const e of D.acad)if(blank(e.college)||!e.fromM||!e.fromY)return 'Complete the college name and start date'}
    if(['Industry only','Both'].includes(D.expType)){if(!D.ind.length)return 'Add at least one company';for(const e of D.ind)if(blank(e.company)||!e.fromM||!e.fromY)return 'Complete the company name and start date'}
    if(D.expType!=='Fresher'){if(blank(D.curSal))return 'Enter your current or last salary';if(!D.notice)return 'Select your notice period'}
    if(blank(D.expMin)||blank(D.expMax))return 'Enter your expected salary';return ''},
  5:()=>{if(!D.coord.length)return 'Choose your responsibilities, or None';for(const r of D.coord.filter(x=>x!=='None')){const c=getP(D,'coordDur.'+slug(r))||{};if(blank(c.n)||!c.u)return `Enter how long you were ${r}`}return ''},
  6:()=>{if(!D.accrDone)return 'Tell us if you have worked on accreditation';if(D.accrDone==='Yes'){if(!D.accr.length)return 'Choose at least one accreditation';for(const b of D.accr){const w=getP(D,'accrWork.'+slug(b))||{};if(blank(w.w))return `Describe your ${b} work`}}return ''},
  7:()=>{if(blank(D.papers))return 'Enter the number of papers (0 if none)';for(const [i,p] of D.paperList.entries()){if(blank(p.title))return `Enter the title of paper ${i+1}`;if(!p.level)return `Select the level of paper ${i+1}`}if(!D.guide)return 'Tell us if you are a PhD guide';if(D.guide==='Yes'&&blank(D.guideUni))return 'Enter the university for your guideship';return ''},
  8:()=>{if(!D.indProj)return 'Tell us about industry projects';if(D.indProj==='Yes'){if(!D.projects.length)return 'Add at least one project';for(const p of D.projects){if(blank(p.title))return 'Enter the project title';if(blank(p.link)&&!p.file)return `Add a proof link or file for "${p.title}"`}}
    if(!D.startup)return 'Tell us about startup mentoring';if(D.startup==='Yes'){if(!D.startups.length)return 'Add at least one startup';if(D.startups.some(s=>blank(s.name)))return 'Enter the startup name'}return ''},
  9:()=>{if(D.aiNone)return '';if(!D.aiTools.length)return 'Add an AI tool, or tick "I don\'t use AI tools yet"';for(const t of D.aiTools){const nm=t.tool==='Other'?t.other:t.tool;if(!t.tool)return 'Select the AI tool';if(t.tool==='Other'&&blank(t.other))return 'Type the AI tool name';if(!(t.purposes||[]).length)return `Choose what you use ${nm} for`;if(!t.level)return `Rate yourself on ${nm}`}return ''},
  10:()=>quizDone()?'':'Answer all 10 scenarios to continue',
  11:()=>{if(!D.introType)return 'Choose voice, video or both';const v=!!D.voice,c=!!D.video||!blank(D.videoLink);
    if(D.introType==='Voice'&&!v)return 'Record or upload your voice intro';if(D.introType==='Video'&&!c)return 'Record, upload or link your video intro';if(D.introType==='Both'&&!v&&!c)return 'Add at least one intro: voice or video';return ''},
  12:()=>!D.resume?'Upload your resume':!D.visibility?'Choose who can see your profile':!D.consent?'Tick the consent box to submit':''
};
export function failStep(msg){toast(msg,true);const b=$('#nextBtn');if(b){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake')}}

/* ---- relocation map ---- */
export function mapSVG(){
  const list=D.relocList||[];
  const outside=list.some(p=>OTHER_CITIES[p]) || (D.district&&OTHER_CITIES[D.district]);
  const vb=outside?[-230,-420,760,1050]:[0,0,450,600];
  const k=vb[2]/450;
  const outline=TN_OUTLINE.map(p=>proj([p[1],p[0]]).join(',')).join(' ');
  const pin=(name,ll,color,ink)=>{const [x,y]=proj(ll);return `<g transform="translate(${x},${y}) scale(${k})"><g class="pin"><path d="M0,0 C-4,-8 -10,-13 -10,-21 a10,10 0 1,1 20,0 c0,8 -6,13 -10,21z" fill="${color}" stroke="#06393C" stroke-width="1.5"/><circle cy="-21" r="4" fill="${ink}"/></g><text y="-36" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" stroke="#06393C" stroke-width="3" paint-order="stroke" font-family="Manrope">${esc(name)}</text></g>`};
  const dots=Object.entries(TN_DISTRICTS).map(([n,ll])=>{const [x,y]=proj(ll);return `<g class="dist-dot" data-act="mapAdd" data-v="${n}"><title>${n}</title><circle cx="${x}" cy="${y}" r="${4.5*k}" fill="rgba(255,255,255,.35)"/></g>`}).join('');
  const others=outside?Object.entries(OTHER_CITIES).map(([n,ll])=>{const [x,y]=proj(ll);return `<g class="dist-dot" data-act="mapAdd" data-v="${n}"><title>${n}</title><circle cx="${x}" cy="${y}" r="${5*k}" fill="rgba(255,255,255,.25)"/></g>`}).join(''):'';
  const allLL={...TN_DISTRICTS,...OTHER_CITIES};
  const anywhere=list.includes('Anywhere in Tamil Nadu');
  const pins=list.filter(p=>allLL[p]).map(p=>pin(p,allLL[p],'#F2A93B','#06393C')).join('');
  const home=D.district&&allLL[D.district]?pin('You: '+D.district,allLL[D.district],'#FFFFFF','#2F9E5E'):'';
  return `<svg id="tnmap" viewBox="${(S.mapVB||vb).join(' ')}" data-target="${vb.join(' ')}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${outline}" fill="${anywhere?'rgba(242,169,59,.28)':'rgba(255,255,255,.07)'}" stroke="rgba(255,255,255,.45)" stroke-width="${1.5*k}" stroke-linejoin="round"/>
    ${dots}${others}${home}${pins}</svg>`;
}
export function animateMap(){
  const svg=$('#tnmap'); if(!svg)return;
  const to=svg.dataset.target.split(' ').map(Number), from=(S.mapVB||to).slice();
  S.mapVB=to; if(from.join()===to.join())return;
  const t0=performance.now();
  (function step(t){const p=Math.min(1,(t-t0)/500),e=1-Math.pow(1-p,3);svg.setAttribute('viewBox',from.map((f,i)=>f+(to[i]-f)*e).join(' '));if(p<1)requestAnimationFrame(step)})(t0);
}
