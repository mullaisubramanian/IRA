/* Delegated DOM events and every click action. */
import { go, render } from './render.js';
import { $, D, KEY, S, attach, getP, save, setP, toast } from '../core/state.js';
import { NOW_Y, yearsBetween, ym } from '../core/ui.js';
import { OTHER_CITIES, STEPS, TN_DISTRICTS, isDomainAllowed } from '../data/catalog.js';
import { QB } from '../data/questions.js';
import { askNext, botSay, parseField, scrollChat, summaryText, userSend } from '../logic/chatParser.js';
import { allMatches, candState, openProfile, openSchedule } from '../logic/matching.js';
import { REQUIRED, failStep } from '../views/faculty.js';
import { R, newReq } from '../views/institution.js';
import { upsertFacultyProfile, createVacancy, applyToVacancy, getAuthUser, signOutUser, sendNotification } from '../core/supabase.js';

document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.k&&t.type!=='file'&&t.type!=='checkbox'){setP(D,t.dataset.k,t.value);save()}
  if(t.id==='cin'){t.style.height='auto';t.style.height=Math.min(140,t.scrollHeight)+'px'}
  // If user picks an option from datalist, browser fires input with that exact value
  if(t.dataset.tag && t.value){
    const listId = t.getAttribute('list');
    if(listId){
      const dl = document.getElementById(listId);
      if(dl){
        const match = Array.from(dl.options).some(o => o.value.toLowerCase() === t.value.trim().toLowerCase());
        if(match){
          addTag(t.dataset.tag, t.value);
          t.value = '';
          render();
        }
      }
    }
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  // Direct select dropdown for tags (immediate subject placement without pressing Enter)
  if(t.dataset.act==='selectTag' && t.value){
    addTag(t.dataset.k, t.value);
    t.value='';
    render();
    return;
  }
  // Datalist input change
  if(t.dataset.tag && t.value && t.value.trim()){
    addTag(t.dataset.tag, t.value.trim());
    t.value='';
    render();
    return;
  }
  if(t.dataset.k&&t.type==='checkbox'){setP(D,t.dataset.k,t.checked);save();if(t.dataset.rr!==undefined)render();return}
  if(t.dataset.file){const f=t.files[0];if(f){const v={name:f.name,url:URL.createObjectURL(f)};
    if(t.dataset.file==='voiceFile')D.voice=v;else if(t.dataset.file==='videoFile')D.video=v;else setP(D,t.dataset.file,v);save();render()}return}
  if(t.dataset.rr!==undefined&&t.dataset.k){
    if(t.dataset.k==='state')D.district='';
    if(['dobD','dobM','dobY'].includes(t.dataset.k))D.dob=D.dobD&&D.dobM&&D.dobY?`${D.dobY}-${String(D.dobM).padStart(2,'0')}-${String(D.dobD).padStart(2,'0')}`:'';
    if(t.dataset.k==='papers'&&!(+D.papers>0)){D.patents='';D.books=''}
    if(t.dataset.k==='ug.year'&&+D.ug.year>=NOW_Y){D.pg={deg:'',other:'',spec:'',college:'',year:'',pct:''};D.phd='Not applicable';D.postdoc=''}
    save();render()}
  if(t.dataset.act==='notify'){R().notify=t.checked;save();toast(t.checked?'We will email you when new matches join':'Email alerts paused')}
  if(t.dataset.act==='setStatus'){S.i.cands[t.dataset.id].status=t.value;save();toast('Status changed to '+t.value)}
});
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(t.dataset.tag&&e.key==='Enter'){e.preventDefault();addTag(t.dataset.tag,t.value);S.refocus=`[data-tag="${t.dataset.tag}"]`;render()}
  if(t.id==='cin'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();const v=t.value;t.value='';userSend(v)}
  if(t.id==='reqEdit'&&e.key==='Enter')commitReqEdit(t);
  if(t.id==='reqEdit'&&e.key==='Escape'){S.i.editing=null;render()}
  if(e.key==='Escape'&&$('#modal').innerHTML)$('#modal').innerHTML='';
});
document.addEventListener('focusout',e=>{if(e.target.id==='reqEdit')setTimeout(()=>{if(S.i.editing)commitReqEdit(e.target)},0)});
export function commitReqEdit(t){
  const r=R(),k=t.dataset.ek,v=t.value.trim();S.i.editing=null;
  if(!v)r[k]=(k==='subjects'||k==='traits'||k==='salary'||k==='exp')?null:'';
  else if(k==='subjects'||k==='traits')r[k]=v.split(',').map(s=>s.trim()).filter(Boolean);
  else if(k==='salary'||k==='exp'){const p=parseField(k,v);if(p)r[k]=p;else toast('That value could not be read. Try "50k-60k" or "3-5 years".',true)}
  else r[k]=v;
  const last=r.msgs.filter(m=>m.summary).pop();if(last)last.summary=summaryText(r);
  save();render();
}
export function addTag(k,v){v=(v||'').trim();if(!v)return;const a=getP(D,k)||[];
  if(k==='relocList'){const all=['Anywhere in Tamil Nadu',...Object.keys(TN_DISTRICTS),...Object.keys(OTHER_CITIES)];const m=all.find(x=>x.toLowerCase()===v.toLowerCase());if(!m){toast('Choose a district or city from the list',true);return}v=m}
  if(!a.includes(v))a.push(v);setP(D,k,a);save()}

document.addEventListener('click',e=>{
  const c=e.target.closest('[data-ck]');
  if(c){
    e.preventDefault();
    if(c.disabled || c.classList.contains('disabled')) return;
    const k=c.dataset.ck,v=c.dataset.cv;
    if(c.dataset.multi!==undefined){
      let a=getP(D,k)||[];
      if(k==='types'){
        if(!a.includes(v)){
          if(!isDomainAllowed(a, v)){
            toast('Incompatible with your chosen domain: '+v, true);
            return;
          }
        }
      }
      if(v==='None')a=a.includes('None')?[]:['None'];
      else{
        a=a.filter(x=>x!=='None');
        a=a.includes(v)?a.filter(x=>x!==v):[...a,v];
      }
      setP(D,k,a);
    }
    else {
      const nonToggling = ['marital','introType','expType','commute','hasPg','hasPhd','relocate','negotiable','postdoc'];
      const nextVal = (getP(D,k)===v && !nonToggling.includes(k)) ? '' : v;
      setP(D,k,nextVal);
      if(k==='hasPg'&&v==='No'){
        D.pg={deg:'',other:'',spec:'',college:'',year:'',pct:''};
      }
      if(k==='hasPhd'&&v==='No'){
        D.phd='Not applicable';
        D.postdoc='';
        D.postdocInst='';
        D.phdUni='';
        D.phdTopic='';
        D.phdYear='';
      }
    }
    if(k==='commute'&&v==='College transport')D.maxCommute='';
    save();render();return;
  }
  const a=e.target.closest('[data-act]');if(!a)return;
  if(a.tagName==='A'||a.tagName==='BUTTON')e.preventDefault();
  const A=ACTIONS[a.dataset.act];if(A)A(a,e);
});

export const ACTIONS={
  home:()=>go(()=>S.view='landing'),
  goFaculty:()=>{
    if(S.session&&S.session.role==='institution'){
      toast('You are logged in as an institution. Faculty portal is restricted.', true);
      return;
    }
    go(()=>S.view='faculty');
  },
  goInst:()=>{
    if(S.session&&S.session.role==='faculty'){
      toast('You are logged in as a faculty member. Institution portal is restricted.', true);
      return;
    }
    go(()=>S.view='inst');
  },
  resetAll:()=>{if(confirm('Reset all demo data?')){try{localStorage.removeItem(KEY)}catch(e){}location.reload()}},
  goStep:a=>{const i=+a.dataset.i,st=S.f.step;
    if(i===st)return;
    if(i<st)return go(()=>S.f.step=i);
    if(i>S.f.max){toast(`Complete "${STEPS[S.f.max][0]}" first`,true);return}
    const err=REQUIRED[st]&&REQUIRED[st]();if(err){failStep(err);return}
    S.f.done[st]=true;go(()=>S.f.step=i)},
  prev:()=>go(()=>S.f.step=Math.max(0,S.f.step-1)),
  saveDraft:()=>{save();toast('Draft saved')},
  next:async ()=>{const st=S.f.step;const err=REQUIRED[st]&&REQUIRED[st]();if(err){failStep(err);return}
    S.f.done[st]=true;
    if(st===STEPS.length-1){
      const miss=STEPS.findIndex((_,i)=>REQUIRED[i]&&REQUIRED[i]());
      if(miss>=0){toast('Please complete: '+STEPS[miss][0],true);return go(()=>S.f.step=miss)}
      S.f.submitted=true;save();toast('Profile submitted');
      // Persist to Supabase public.profiles and public.faculty_profiles
      try {
        const { user } = await getAuthUser();
        const uid = user?.id || (S.session && S.session.id);
        if (uid) {
          const deptsList = []; Object.values(D.depts||{}).forEach(arr=>(arr||[]).forEach(x=>deptsList.push(x)));
          const subjList = []; Object.values(D.subjects||{}).forEach(arr=>(arr||[]).forEach(x=>subjList.push(x)));
          const span = e => yearsBetween(ym(e.fromY,e.fromM),ym(e.toY,e.toM));
          const expA = (D.acad||[]).reduce((s,e)=>s+span(e),0), expI = (D.ind||[]).reduce((s,e)=>s+span(e),0);
          const qual = D.phd==='Completed'?'PhD':(D.phd==='Pursuing'||D.phd==='Thesis submitted'?'PhD (pursuing)':(!D.pg.deg?'UG':(D.tests||[]).some(t=>/NET|SET/.test(t))?'PG + NET/SET':'PG'));
          const { error } = await upsertFacultyProfile(uid, {
            fullName: D.name,
            email: S.session?.email || D.email,
            qualification: qual,
            specialization: deptsList.join(', '),
            experienceYears: Math.round((expA+expI)*10)/10,
            location: D.district || D.state || 'Tamil Nadu',
            skills: subjList,
            phone: D.mobile || ''
          });
          if (error) {
            console.error('[Supabase Faculty Profile Upsert Error]', error);
            toast('Notice: Profile saved locally, but database sync error: ' + error.message, true);
          } else {
            console.log('[Supabase Faculty Profile Upsert Success] Saved for:', uid);
            toast('Profile submitted and saved to Supabase successfully!');
          }
        } else {
          console.warn('[Supabase Faculty Profile] No authenticated user ID. Sign up or log in to sync database.');
        }
      } catch (e) {
        console.error('[Supabase Faculty Profile Upsert Exception]', e);
        toast('Database sync exception: ' + e.message, true);
      }
      return go(()=>{});
    }
    S.f.max=Math.max(S.f.max,st+1);save();go(()=>S.f.step=st+1)},
  editProfile:()=>go(()=>{S.f.submitted=false;S.f.step=0}),
  addRow:a=>{const k=a.dataset.k;const tmpl={acad:{college:'',desig:'',dept:'',subj:'',fromM:'',fromY:'',toM:'',toY:''},ind:{company:'',role:'',domain:'',work:'',fromM:'',fromY:'',toM:'',toY:''},projects:{title:'',client:'',year:'',link:'',desc:'',file:null},startups:{name:'',type:'',inc:'',dur:''},aiTools:{tool:'',other:'',purposes:[],level:'',ex:''}}[k];D[k].push(JSON.parse(JSON.stringify(tmpl)));save();render()},
  rmRow:a=>{D[a.dataset.k].splice(+a.dataset.i,1);save();render()},
  rmTag:a=>{const arr=getP(D,a.dataset.k);arr.splice(+a.dataset.i,1);save();render()},
  addTag:a=>{addTag(a.dataset.k,a.dataset.v);render()},
  selectTag:a=>{if(a.value){addTag(a.dataset.k,a.value);a.value='';render()}},
  addTagBtn:a=>{const k=a.dataset.k;const inp=document.querySelector(`input[data-tag="${k}"]`);if(inp&&inp.value.trim()){addTag(k,inp.value.trim());inp.value='';render()}else{toast('Type or pick a subject first',true)}},
  applyVacancy:async a=>{
    const id=a.dataset.id;
    D.appliedVacancies=D.appliedVacancies||[];
    if(!D.appliedVacancies.includes(id)){
      D.appliedVacancies.push(id);
      save();render();
      try{
        const { user } = await getAuthUser();
        const uid = user?.id || (S.session && S.session.id);
        if(uid){
          const { data, error } = await applyToVacancy({ vacancyId: id, facultyId: uid, matchScore: 88 });
          if (error) {
            console.error('[Supabase Application Error]', error);
            toast('Application saved locally, but database sync error: ' + error.message, true);
          } else {
            console.log('[Supabase Application Success]', data);
            toast('Application submitted! College recruitment team has received your profile.');
          }
        } else {
          console.warn('[Supabase Application] Faculty not logged in with Supabase auth.');
          toast('Application saved locally. Sign in to sync with the college.', true);
        }
      }catch(err){
        console.error('[Supabase Application Sync Exception]', err);
        toast('Application sync exception: ' + err.message, true);
      }
    }else{
      toast('You have already applied for this opening.');
    }
  },
  mapAdd:a=>{const v=a.dataset.v;D.relocList=D.relocList.includes(v)?D.relocList.filter(x=>x!==v):[...D.relocList,v];save();render()},
  answer:a=>{const q=D.qa,id=a.dataset.q,o=+a.dataset.o;
    if(q.path[q.path.length-1]!==id)return;
    q.ans[id]=o;render();
    const nx=QB[id].o[o][2];
    setTimeout(()=>{if(q.path[q.path.length-1]===id&&q.ans[id]===o&&nx!=='END')q.path.push(nx);save();render()},280)},
  quizBack:()=>{const q=D.qa;if(q.path.length>1){const last=q.path.pop();delete q.ans[last];delete q.ans[q.path[q.path.length-1]]}render()},
  recStart:async a=>{
    const type=a.dataset.type,video=type==='Video';
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true,video});
      const mr=new MediaRecorder(stream);const chunks=[];const lim=video?60:120;const t0=Date.now();
      mr.ondataavailable=e=>chunks.push(e.data);
      mr.onstop=()=>{const blob=new Blob(chunks,{type:video?'video/webm':'audio/webm'});D[video?'video':'voice']={url:URL.createObjectURL(blob),dur:Math.round((Date.now()-t0)/1000)};stream.getTracks().forEach(t=>t.stop());clearInterval(S.rec.timer);S.rec=null;save();render();toast(`${type} intro recorded`)};
      S.rec={type,mr,stream,timer:setInterval(()=>{const s=Math.round((Date.now()-t0)/1000);const el=$('#recTime');if(el)el.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;if(s>=lim)mr.stop()},250)};
      mr.start();render();
    }catch(err){toast('Microphone or camera is not available. Upload a file instead.',true)}
  },
  recStop:()=>{if(S.rec)S.rec.mr.stop()},
  /* institution */
  authTab:a=>{S.authTab[a.dataset.role]=a.dataset.v;render()},
  signOut:async a=>{
    const nx=a.dataset.next;
    if(S.rec){try{S.rec.mr.stop()}catch(e){}}
    try {
      await signOutUser();
    } catch(e) {
      console.warn('[Supabase signOut notice]', e);
    }
    S.session=null;
    attach();
    save();
    toast('Signed out');
    go(()=>S.view=nx==='faculty'?'faculty':nx==='institution'?'inst':'landing');
  },
  newReq:()=>{S.i.reqs.push(newReq());S.i.cur=S.i.reqs.length-1;S.i.page='chat';save();render();setTimeout(()=>$('#cin')&&$('#cin').focus(),0)},
  openReq:a=>{S.i.cur=+a.dataset.i;S.enter=true;S.i.page=R().confirmed?'results':'chat';render();scrollChat()},
  page:a=>{S.i.page=a.dataset.v;S.enter=true;render();if(a.dataset.v==='chat')scrollChat()},
  tab:a=>{S.i.tab=a.dataset.v;S.enter=true;render()},
  quick:a=>userSend(a.dataset.v),
  send:()=>{const t=$('#cin');const v=t.value;t.value='';userSend(v)},
  pick:a=>userSend(a.dataset.v),
  pickMulti:a=>{const r=R(),k=r.asking,arr=r['_'+k]||[];const v=a.dataset.v;r['_'+k]=arr.includes(v)?arr.filter(x=>x!==v):(k==='traits'&&arr.length>=3?arr:[...arr,v]);render()},
  multiDone:()=>{const r=R(),k=r.asking,arr=r['_'+k]||[];if(!arr.length){$('#cin').focus();toast('Pick at least one, or type your own',true);return}userSend(arr.join(', '))},
  skip:()=>{const r=R(),k=r.asking;r.msgs.push({from:'user',text:'Skip',fresh:true});r[k]=k==='traits'?[]:'No preference';askNext(r)},
  confirmReq:async ()=>{
    const r=R();
    r.confirmed=true;
    r.msgs.forEach(m=>m.live=false);
    const m=allMatches(r);
    const n={best:0,similar:0,suggested:0};
    m.forEach(x=>n[x.e.tier]++);
    S.i.tab=n.best?'best':n.similar?'similar':'suggested';
    botSay(r,{html:`Your requirement is live. I found <b>${n.best}</b> best-fit, <b>${n.similar}</b> similar and <b>${n.suggested}</b> worth-a-look profiles.${n.best?'':' Nobody meets every requirement yet, so I will keep looking and email you.'}`,results:true},500);

    // Post requirement to Supabase public.vacancies
    try {
      const { user } = await getAuthUser();
      const uid = user?.id || (S.session && S.session.id);
      if(uid){
        const { data, error } = await createVacancy(uid, {
          title: r.role || 'Assistant Professor',
          department: r.dept || 'Engineering',
          qualificationRequired: r.qual || 'PG',
          experienceRequired: r.exp ? `${r.exp.min}-${r.exp.max} years` : '1+ years',
          salaryRange: r.salary ? `₹${r.salary.min/1000}k–${r.salary.max/1000}k / month` : 'Competitive',
          location: S.i.dist ? `${S.i.dist}, Tamil Nadu` : 'Tamil Nadu',
          description: (r.msgs && r.msgs[0]?.text) || `Requirement for ${r.role} in ${r.dept}`
        });
        if (error) {
          console.error('[Supabase Vacancy Post Error]', error);
          toast('Failed to post vacancy to Supabase: ' + error.message, true);
        } else {
          console.log('[Supabase Vacancy Post Success]', data);
          toast('Vacancy posted to Supabase public schema!');
          S.supabaseVacancies = null; // force reload
        }
      } else {
        console.error('[Supabase Vacancy Post Error] No authenticated institution user ID.');
        toast('Cannot post to Supabase: Not signed in as an institution.', true);
      }
    } catch(err) {
      console.error('[Supabase Vacancy Post Exception]', err);
      toast('Database post exception: ' + err.message, true);
    }
  },
  togglePanel:()=>{S.i.panelMob=!S.i.panelMob;render()},
  editReq:a=>{S.i.editing=a.dataset.k;render()},
  fav:a=>{const s=candState(a.dataset.id);s.fav=!s.fav;save();render();if(s.fav)toast('Added to favourites')},
  int:a=>{const s=candState(a.dataset.id);s.int=!s.int;save();render();if(s.int)toast('Marked interested. You can now schedule an interview.')},
  profile:a=>openProfile(a.dataset.id),
  schedule:a=>openSchedule(a.dataset.id),
  closeModal:(a,e)=>{if(e.target===a||a.tagName==='BUTTON')$('#modal').innerHTML=''},
  sendInvite:async a=>{
    const s=candState(a.dataset.id);
    s.status='Invite sent';
    s.iv={mode:document.querySelector('#ivMode .chip.on').dataset.mode,panel:$('#ivPanel').value,slots:[$('#ivS1').value,$('#ivS2').value,$('#ivS3').value],msg:$('#ivMsg').value};
    $('#modal').innerHTML='';
    save();render();
    toast('Invite sent. Reminders are set for 24 hours and 1 hour before.');

    try {
      const { user } = await getAuthUser();
      if (user?.id && a.dataset.id) {
        await sendNotification({
          userId: a.dataset.id,
          type: 'interview_invite',
          message: `Interview invitation sent for ${R()?.role || 'Faculty position'} on ${$('#ivS1').value || 'specified schedule'}.`
        });
      }
    } catch(err) {
      console.warn('[Supabase Notification sync notice]', err);
    }
  }
};
