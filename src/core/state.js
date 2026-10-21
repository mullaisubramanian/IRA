/* App state, accounts/session, per-account data, connected to Supabase PostgreSQL. */

/* ======================= 2) STATE + HELPERS ======================== */
export const D0 = () => ({
  spHasKids:'',stateOther:'',name:'',gender:'',dobD:'',dobM:'',dobY:'',dob:'',photo:null,email:'',mobile:'',linkedin:'',marital:'',spouse:'',hasKids:'',kids:'',spKids:'',father:'',mother:'',parentPhone:'',
  state:'Tamil Nadu',district:'',relocate:'',relocList:[],stay:'',commute:'',maxCommute:'',
  ug:{deg:'',other:'',spec:'',college:'',year:'',pct:''},hasPg:'',pg:{deg:'',other:'',spec:'',college:'',year:'',pct:''},hasPhd:'',phd:'',phdUni:'',phdTopic:'',phdYear:'',postdoc:'',postdocInst:'',tests:[],certs:'',
  types:[],depts:{},subjects:{},desig:[],
  expType:'',acad:[],ind:[],curSal:'',salUnit:'Per month',expMin:'',expMax:'',negotiable:'',notice:'',reason:'',
  coord:[],coordDur:{},
  accrDone:'',accr:[],accrWork:{},
  papers:'',paperList:[],patents:'',books:'',guide:'',guideUni:'',scholars:'',
  indProj:'',projects:[],startup:'',startups:[],consult:'',
  aiNone:false,aiTools:[],
  qa:{path:['Q1'],ans:{},shuf:{}},
  introType:'',voice:null,video:null,videoLink:'',
  resume:null,certFiles:null,visibility:'',consent:false,
  appliedVacancies:[]
});
export const blankF = () => ({step:0,max:0,d:D0(),done:{},submitted:false});
export const blankI = () => ({name:'',email:'',type:'Engineering & Technology',dist:'Coimbatore',contact:'',reqs:[],cur:-1,tab:'best',page:'chat',cands:{}});

export const S = {
  view:'landing',
  accounts:{},
  session:null,
  profiles:{},
  instData:{},
  authTab:{faculty:'signup',institution:'signup'},
  f:blankF(),
  i:blankI(),
  supabaseVacancies: null,
  supabaseFaculty: null,
  supabaseApplications: [],
  rec:null,
  refocus:null,
  mapVB:null,
  enter:true
};

/* Points S.f (faculty) or S.i (institution) at the signed-in account's own data */
export function attach(){
  const s=S.session;
  if(!s){S.f=blankF();S.i=blankI();D=S.f.d;return}
  if(s.role==='faculty'){S.f=S.profiles[s.email]||(S.profiles[s.email]=blankF());S.i=blankI()}
  else {S.i=S.instData[s.email]||blankI();S.f=blankF()}
  D=S.f.d;
}

export let D = S.f.d;

export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const getP = (o,p) => p.split('.').reduce((a,k)=>a==null?undefined:a[k],o);
export function setP(o,p,v){const ks=p.split('.');let a=o;for(let i=0;i<ks.length-1;i++){if(a[ks[i]]==null)a[ks[i]]=/^\d+$/.test(ks[i+1])?[]:{};a=a[ks[i]]}a[ks[ks.length-1]]=v}
export const inr = n => '₹' + Number(n||0).toLocaleString('en-IN');
export const initials = n => n.replace(/^Dr\.\s*/,'').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
export const slug = s => s.replace(/[^a-z0-9]/gi,'_');
export function toast(t,err){document.querySelectorAll('.toast').forEach(x=>x.remove());const el=document.createElement('div');el.className='toast'+(err?' err':'');el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),2800)}
export const KEY='ira_v3';
export const stripMedia = p => ({...p,d:{...p.d,photo:null,voice:p.d.voice?{dur:p.d.voice.dur,name:p.d.voice.name}:null,video:p.d.video?{dur:p.d.video.dur,name:p.d.video.name}:null}});

export function save(){
  try{
    const profiles={};
    for(const [e,p] of Object.entries(S.profiles))profiles[e]=stripMedia(p);
    localStorage.setItem(KEY,JSON.stringify({accounts:S.accounts,session:S.session,profiles,instData:S.instData}));
  }catch(e){}
}

export function load(){
  try{
    const x=JSON.parse(localStorage.getItem(KEY)||'null');
    if(x){
      S.accounts=x.accounts||{};
      S.session=x.session||null;
      S.profiles=x.profiles||{};
      for(const p of Object.values(S.profiles)){
        p.d=Object.assign(D0(),p.d);
        if(!p.d.hasPg&&p.d.pg&&p.d.pg.deg)p.d.hasPg='Yes';
        if(!p.d.hasPhd&&p.d.phd&&p.d.phd!=='Not applicable')p.d.hasPhd='Yes';
      }
      S.instData=x.instData||{};
    }
  }catch(e){}
  attach();
}
