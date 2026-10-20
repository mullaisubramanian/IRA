/* Chatbot "training": reads free text into role, department (by institution type), salary, experience, etc., and drives the question flow. */
import { render } from '../app/render.js';
import { $, S, esc, inr, save } from '../core/state.js';
import { INST_TYPES, SUBJECTS } from '../data/catalog.js';
import { R, REQ_FLOW, fmtReq, newReq } from '../views/institution.js';

/* ---- natural-language parsing ---- */
export const instDepts = () => INST_TYPES[S.i.type]||INST_TYPES['Engineering & Technology'];
export const ROLE_CHIPS = t => t==='Polytechnic'?['Lecturer','Senior Lecturer','HOD','Principal']:['Assistant Professor','Associate Professor','Professor','HOD','Dean','Principal'];
export const QUICK_DEPTS = {'Engineering & Technology':['CSE','Mechanical','ECE'],'Arts & Science':['English','Commerce','Computer Science'],'Management (MBA/BBA)':['Marketing','Finance','HR']};
export const DEPT_ALIASES = {
  'CSE':['cse','computer science and engineering','computer science engineering','computer science'],'IT':['information technology'],
  'AI & DS':['ai & ds','ai&ds','aids','ai and ds','data science'],'AI & ML':['ai & ml','ai&ml','aiml','ai and ml'],
  'ECE':['ece','electronics and communication','electronics'],'EEE':['eee','electrical'],'Mechanical':['mech','mechanical'],'Civil':['civil'],
  'Science & Humanities':['s&h','science and humanities','english','maths','mathematics','physics','chemistry'],
  'Computer Science':['computer science','b.sc cs','bsc cs'],'BCA':['bca','computer applications'],'Commerce (CA)':['commerce (ca)','commerce ca','b.com ca','bcom ca'],
  'Commerce':['commerce','b.com','bcom'],'Mathematics':['maths','math'],'Visual Communication':['visual communication','viscom'],
  'Marketing':['marketing'],'Finance':['finance'],'HR':['hr','human resource'],'Business Analytics':['analytics'],
  'Pharmaceutics':['pharmaceutics'],'Pharmacology':['pharmacology'],'Medical Lab Technology':['mlt','lab technology'],'Radiology & Imaging':['radiology'],
  'Medical-Surgical Nursing':['medical surgical','medical-surgical'],'Mechanical (Diploma)':['mechanical','mech'],'Civil (Diploma)':['civil'],'EEE (Diploma)':['eee','electrical'],'ECE (Diploma)':['ece','electronics'],'Computer Engineering (Diploma)':['computer']
};
export const rxEsc = k => k.replace(/[.*+?^${}()|[\]\\&]/g,'\\$&');
export function deptKeyHit(l,k){return k.length>4?l.includes(k):new RegExp('(^|[^a-z])'+rxEsc(k)+'([^a-z]|$)').test(l)}
export function parseDept(t){
  const l=t.toLowerCase(), list=instDepts();
  if(/\bIT\b/.test(t)&&list.includes('IT'))return 'IT';
  const hits=[];
  list.forEach(d=>[d.toLowerCase(),...(DEPT_ALIASES[d]||[])].forEach(k=>{if(deptKeyHit(l,k))hits.push([k.length,d])}));
  hits.sort((a,b)=>b[0]-a[0]);
  return hits.length?hits[0][1]:null;
}
/* A department named in the text that belongs to a different institution type */
export function foreignDept(t){
  const l=t.toLowerCase(), mine=instDepts();
  for(const [type,ds] of Object.entries(INST_TYPES)){if(type===S.i.type)continue;
    for(const d of ds){if(mine.includes(d))continue;if([d.toLowerCase(),...(DEPT_ALIASES[d]||[])].some(k=>deptKeyHit(l,k)))return d.replace(/ \(Diploma\)/,'')}}
  return null;
}
export const DEPT_KEYS = [['cse','CSE'],['computer science','CSE'],['information tech','IT'],['ai & ds','AI & DS'],['ai&ds','AI & DS'],['aids','AI & DS'],['data science','AI & DS'],['ece','ECE'],['electronics','ECE'],['eee','EEE'],['electrical','EEE'],['mech','Mechanical'],['civil','Civil'],['mba','MBA'],['management','MBA'],['marketing','MBA'],['finance','MBA'],['english','English'],['math','Mathematics'],['commerce','Commerce']];
export const WORDNUM = {one:1,two:2,three:3,four:4,five:5,six:6};
export function parseSalary(t){
  t=t.toLowerCase().replace(/,/g,'');
  const toN=(n,u)=>{n=parseFloat(n);u=u||'';if(u==='lpa'||(/^l/.test(u)&&n>3))return Math.round(n*100000/12);if(/^l/.test(u))return n*100000;if(u==='k')return n*1000;return n};
  const re=/(\d+(?:\.\d+)?)\s*(k|lpa|lakhs?|l)?\b\s*(?:-|–|to)\s*₹?\s*(\d+(?:\.\d+)?)\s*(k|lpa|lakhs?|l)?\b/g;
  let m;while((m=re.exec(t))){const a=toN(m[1],m[2]||m[4]),b=toN(m[3],m[4]||m[2]);if(b>=5000)return {min:Math.min(a,b),max:Math.max(a,b)}}
  m=t.match(/(\d+(?:\.\d+)?)\s*(k|lpa|lakhs?|l)\b/)||t.match(/₹\s*(\d{4,})/)||t.match(/\b(\d{5,6})\b/);
  if(m){const v=toN(m[1],m[2]);if(v>=5000)return {min:Math.round(v*.85),max:Math.round(v*1.1)}}
  return null;
}
export function parseExp(t){
  t=t.toLowerCase();
  if(/fresher/.test(t))return {min:0,max:1,label:'Fresher'};
  let m=t.match(/(\d+)\s*(?:-|–|to)\s*(\d+)\s*(?:years|yrs|year)/);
  if(m)return {min:+m[1],max:+m[2],label:`${m[1]}–${m[2]} years`};
  m=t.match(/(\d+)\s*\+?\s*(?:years|yrs|year)/);
  if(m)return {min:+m[1],max:+m[1]+5,label:`${m[1]}+ years`};
  return null;
}
export function parseField(k,t,asked){
  const l=t.toLowerCase();
  switch(k){
    case 'role':{if(/senior lecturer/.test(l))return 'Senior Lecturer';if(/lecturer/.test(l))return 'Lecturer';if(/assistant|asst/.test(l))return 'Assistant Professor';if(/associate|assoc/.test(l))return 'Associate Professor';if(/\bhod\b|head of/.test(l))return 'HOD';if(/principal/.test(l))return 'Principal';if(/\bdean\b/.test(l))return 'Dean';if(/director/.test(l))return 'Director';if(/professor|prof\b/.test(l))return 'Professor';return null}
    case 'dept':return parseDept(t);
    case 'count':{let m=l.match(/(\d+)\s*(?:\+)?\s*(?:nos?|assistant|associate|prof|faculty|people|posts?|vacanc|staff|hod|candidates|positions?)/)||l.match(/^(\d+)\+?$/);if(m)return m[1];m=l.match(/\b(one|two|three|four|five|six)\b/);return m?String(WORDNUM[m[1]]):null}
    case 'qual':{if(/pursuing|ongoing/.test(l)&&/phd|ph\.d/.test(l))return 'PhD (pursuing accepted)';if(/phd|ph\.d|doctorate/.test(l))return 'PhD';if(/\b(net|set|slet)\b/.test(l))return 'PG + NET/SET';if(/\bpg\b|m\.tech|mtech|post ?grad/.test(l))return 'PG';return null}
    case 'exp':return parseExp(t);
    case 'salary':return parseSalary(t);
    case 'gender':{if(/\b(any|both|no pref|either)\b/.test(l))return 'Any';if(/female|women|woman|lady|ladies/.test(l))return 'Female';if(/\bmale\b|\bmen\b|gents/.test(l))return 'Male';return null}
    case 'age':{if(/no pref/.test(l))return 'No preference';const m=l.match(/(\d{2})\s*(?:-|–|to)\s*(\d{2})/);if(m)return `${m[1]}-${m[2]}`;const m2=l.match(/(\d{2})\+/);return m2?m2[0]:null}
    case 'joining':{if(/immediate|asap|urgent|right away/.test(l))return 'Immediate';const m=l.match(/(\d+)\s*days/);if(m)return `Within ${m[1]} days`;if(/month/.test(l))return 'Within 30 days';return null}
    case 'accom':case 'transport':{
      const kw=k==='accom'?/(accommodation|hostel|quarters|stay)/:/(transport|bus|commute)/;
      if(!kw.test(l)&&!(asked&&/^(yes|no)/.test(l)))return null;
      if(/\bno\b|not provided|don'?t/.test(l))return 'No';
      if(/free|unpaid|no charge|complimentary/.test(l))return 'Yes – Free';
      if(/paid|charge|fee/.test(l))return 'Yes – Paid';
      return 'Yes – Free';
    }
    case 'subjects':{const m=t.match(/(?:teach|subjects?|handle|papers?)[:\s]+(?:in\s+)?([a-z0-9 ,&/+\-]+)/i);if(m){return m[1].split(/,|\band\b/).map(s=>s.trim()).filter(s=>s.length>1&&s.length<40).map(s=>s.replace(/\b\w/g,c=>c.toUpperCase()))}return null}
  }
  return null;
}
export function parseAll(r,t){
  ['role','dept','count','qual','exp','salary','gender','joining','accom','transport','subjects'].forEach(k=>{if(r[k]==null||r[k]===''){const v=parseField(k,t);if(v!=null&&!(Array.isArray(v)&&!v.length))r[k]=v}});
  if(r.age===''&&/\bage\b/i.test(t)){const v=parseField('age',t);if(v)r.age=v}
}
export const nextQuestion = r => REQ_FLOW.find(f=>r[f.k]==null||r[f.k]==='')||null;
export function botSay(r,obj,delay=600){
  r.typing=true;render();scrollChat();
  setTimeout(()=>{r.typing=false;r.msgs.forEach(m=>m.live=false);r.msgs.push({from:'bot',live:true,fresh:true,...obj});save();render();scrollChat()},delay);
}
export function askNext(r,prefix=''){
  const f=nextQuestion(r);
  if(!f){r.asking=null;return botSay(r,{html:(prefix?esc(prefix)+' ':'')+'That covers everything. Here is a summary for you to confirm.',summary:summaryText(r)})}
  r.asking=f.k;
  let ch=f.chips;
  if(f.k==='role')ch=ROLE_CHIPS(S.i.type);
  if(f.k==='dept')ch=instDepts();
  if(f.k==='subjects')ch=r.dept==='MBA'?[...SUBJECTS.Marketing.slice(0,3),...SUBJECTS.Finance.slice(0,2),...SUBJECTS.HR.slice(0,2)]:(SUBJECTS[r.dept]||[]).slice(0,8);
  botSay(r,{html:(prefix?`<span class="muted">${esc(prefix)}</span><br>`:'')+esc(f.k==='dept'?`Which ${S.i.type} department is this for?`:f.q),chips:ch,k:f.k});
}
export function userSend(text){
  text=text.trim(); if(!text)return;
  let r=R(); if(!r){S.i.reqs.push(newReq());S.i.cur=S.i.reqs.length-1;r=R()}
  if(r.confirmed){r.msgs.push({from:'user',text,fresh:true});botSay(r,{text:'This requirement is live. Edit it from the requirement panel, or start a new requirement.'});return}
  const before=REQ_FLOW.filter(f=>fmtReq(r,f.k)).map(f=>f.k);
  r.msgs.push({from:'user',text,fresh:true});
  if(r.asking){
    const f=REQ_FLOW.find(x=>x.k===r.asking);
    let v=parseField(f.k,text,true);
    if(f.k==='subjects'||f.k==='traits')v=text.split(/,|\band\b/).map(s=>s.trim()).filter(Boolean);
    if(f.k==='count'&&!v&&/^\d+\+?$/.test(text))v=text;
    if(f.k==='age'&&!v)v=text;
    if(f.k==='dept'&&!v){const fd=foreignDept(text);render();return botSay(r,fd?{text:`${fd} is not a department in ${S.i.type} institutions. Which of your departments is this for?`,chips:instDepts(),k:'dept'}:{text:`I couldn't match that to a ${S.i.type} department. Please pick one below.`,chips:instDepts(),k:'dept'})}
    if(v==null||(Array.isArray(v)&&!v.length)){parseAll(r,text);if(r[f.k]==null||r[f.k]===''){render();return botSay(r,{text:`I didn't catch that. ${f.q}`,chips:f.chips,k:f.k})}}
    else r[f.k]=v;
    parseAll(r,text);
  } else parseAll(r,text);
  const got=REQ_FLOW.filter(f=>fmtReq(r,f.k)&&!before.includes(f.k));
  r._flash=got.map(f=>f.k);
  const fdn=!r.dept?foreignDept(text):null;
  let ack=got.length>1?`Noted: ${got.map(f=>f.label.toLowerCase()+' '+fmtReq(r,f.k)).join(', ')}.`:'';
  if(fdn)ack+=` ${fdn} is not a department in ${S.i.type} institutions.`;
  if(r.gender&&r.gender!=='Any'&&!r._gshown){ack+=' I will treat the gender preference as a preference, so strong profiles still appear.';r._gshown=true}
  render(); askNext(r,ack.trim());
}
export function summaryText(r){
  const sal=r.salary?`${inr(r.salary.min)} to ${inr(r.salary.max)} per month`:'a salary to be discussed';
  const n=+r.count||1, role=r.role+(n>1?'s':'');
  const g=r.gender==='Any'||!r.gender?'with no gender preference':`preferably ${r.gender.toLowerCase()}`;
  const ag=r.age&&r.age!=='No preference'?` and aged ${r.age}`:'';
  const subj=r.subjects&&r.subjects.length?` who can teach ${listJoin(r.subjects)}`:'';
  const acc=r.accom==='No'?'no accommodation':(r.accom||'').replace('Yes – ','').toLowerCase()+' accommodation';
  const tr=r.transport==='No'?'no college transport':(r.transport||'').replace('Yes – ','').toLowerCase()+' college transport';
  const tq=r.traits&&r.traits.length?` You value ${listJoin(r.traits.map(t=>t.toLowerCase()))} most.`:'';
  const ql={PG:'a PG degree','PG + NET/SET':'a PG degree with NET/SET',PhD:'a PhD'}[r.qual]||'a PhD (pursuing is acceptable)';
  return `You are looking for ${n} ${role} in ${r.dept}${subj}. Candidates should have ${ql} and ${r.exp?r.exp.label.toLowerCase():'any amount'} of experience, ${g}${ag}. You are offering ${sal}, ${acc} and ${tr} in ${S.i.dist}. Joining is expected ${r.joining==='Immediate'?'immediately':(r.joining||'').toLowerCase()}.${tq}`;
}
export const listJoin = a => a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
export function scrollChat(){const c=$('#chat');if(c)c.scrollTop=c.scrollHeight}
