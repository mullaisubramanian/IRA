/* Converts a faculty profile into a matchable candidate and renders the "profile is live" screen with active college vacancies from Supabase. */
import { D, S, esc } from '../core/state.js';
import { ICON, age, yearsBetween, ym } from '../core/ui.js';
import { traitScores } from './assessment.js';
import { fetchOpenVacancies, fetchFacultyApplications } from '../core/supabase.js';
import { render } from '../app/render.js';

/* --- faculty done screen (no personality results shown to faculty) --- */
export function facultyAsCandidate(d=D,email=S.session&&S.session.email){
  const depts=[];Object.values(d.depts||{}).forEach(a=>(a||[]).forEach(x=>depts.push(x)));
  if(d.types.includes('Management (MBA/BBA)'))depts.push('MBA');
  const subj=[];Object.values(d.subjects||{}).forEach(a=>(a||[]).forEach(x=>subj.push(x)));
  const span=e=>yearsBetween(ym(e.fromY,e.fromM),ym(e.toY,e.toM));
  const expA=d.acad.reduce((s,e)=>s+span(e),0),expI=d.ind.reduce((s,e)=>s+span(e),0);
  const lvl=['Beginner','Proficient','Advanced','Distinguished'];const ai=d.aiTools.reduce((m,t)=>Math.max(m,lvl.indexOf(t.level)),-1);
  const qual=d.phd==='Completed'?'PhD':d.phd==='Pursuing'||d.phd==='Thesis submitted'?'PhD (pursuing)':(!d.pg.deg?'UG':d.tests.some(t=>/NET|SET/.test(t))?'PG + NET/SET':'PG');
  let sal=+d.expMax||+d.expMin||0;if(d.salUnit.startsWith('LPA'))sal=Math.round(sal*100000/12);
  const intro=[d.voice?'Voice':'',(d.video||d.videoLink)?'Video':''].filter(Boolean).join(' & ')||'Intro';
  return {id:'fac:'+email,media:{voice:d.voice,video:d.video},name:d.name||'You',g:d.gender,age:+age(d.dob)||30,dist:d.district,reloc:d.relocate==='Yes'?d.relocList:[],desig:d.desig,depts,subj,qual,expA:Math.round(expA*10)/10,expI:Math.round(expI*10)/10,sal,pubs:+d.papers||0,scopus:d.paperList.filter(p=>(p.index||[]).includes('Scopus')).length,accr:d.accr,coord:d.coord.filter(c=>c!=='None'),ai:lvl[ai]||'Beginner',traits:traitScores(d.qa),notice:parseInt(d.notice)||0,stay:d.stay,intro,fam:d.marital,color:'#0C8F8B',isNew:true};
}

let isFetchingVacancies = false;

export function loadSupabaseVacancies(force = false) {
  if ((S.supabaseVacancies !== null && !force) || isFetchingVacancies) return;
  isFetchingVacancies = true;
  fetchOpenVacancies().then(({ data, error }) => {
    isFetchingVacancies = false;
    S.supabaseVacancies = (!error && data) ? data : [];
    render();
  }).catch(() => {
    isFetchingVacancies = false;
    S.supabaseVacancies = [];
    render();
  });

  if (S.session?.id || S.session?.email) {
    const facultyId = S.session.id;
    if (facultyId) {
      fetchFacultyApplications(facultyId).then(({ data }) => {
        if (data) {
          S.supabaseApplications = data.map(a => a.vacancy_id);
          render();
        }
      });
    }
  }
}

// Global hook for manual refresh
if (typeof window !== 'undefined') {
  window.__ira_reloadVacancies = () => {
    S.supabaseVacancies = null;
    loadSupabaseVacancies(true);
  };
}

export function mapSupabaseVacancies(vacancies, me) {
  return (vacancies || []).map(v => {
    const inst = v.institutions || {};
    const instName = inst.institution_name || 'Tamil Nadu Higher Education Institution';
    const dist = inst.city || (v.location ? v.location.split(',')[0].trim() : 'Tamil Nadu');
    const dept = v.department || 'General';
    const role = v.title || 'Faculty';

    let score = 75;
    if (me.depts.some(d => dept.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(dept.toLowerCase()))) score += 12;
    if (me.desig.some(ds => role.toLowerCase().includes(ds.toLowerCase()) || ds.toLowerCase().includes(role.toLowerCase()))) score += 8;
    if (v.location?.toLowerCase().includes(me.dist.toLowerCase()) || me.reloc.some(r => v.location?.toLowerCase().includes(r.toLowerCase())) || me.reloc.includes('Anywhere in Tamil Nadu')) score += 5;
    score = Math.min(98, score);
    const tier = score >= 90 ? 'best' : score >= 80 ? 'similar' : 'look';

    return {
      id: v.id,
      instName,
      dist,
      type: inst.type || 'College',
      role,
      dept,
      subjects: [],
      count: '1+',
      qual: v.qualification_required || 'PG',
      exp: v.experience_required || '1+ years',
      salary: v.salary_range || 'Competitive',
      joining: 'Within 30 days',
      accom: 'Available',
      transport: 'Available',
      jd: v.description || `Requirement for ${role} in ${dept}.`,
      contact: inst.contact_person || 'HR Desk',
      email: inst.phone || '',
      score,
      tier
    };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));
}

export function renderFacultyDone(){
  const me = facultyAsCandidate();
  loadSupabaseVacancies();

  const isLoading = S.supabaseVacancies === null;
  const rawVacancies = S.supabaseVacancies || [];
  const allVac = mapSupabaseVacancies(rawVacancies, me);
  const applied = [...(D.appliedVacancies || []), ...(S.supabaseApplications || [])];

  return `<div class="donepage ${S.enter?'enter':''}">
    <div class="done-hero">
      <div class="seal">${ICON.bigcheck}</div>
      <h2>Your profile is live, ${esc((D.name||'').split(' ')[0])}.</h2>
      <p>Colleges and institutions across Tamil Nadu can now discover your credentials. You can also directly review open vacancy JDs below.</p>
    </div>

    <!-- Faculty Profile Summary -->
    <div class="fcard" style="margin-top:18px">
      <h4>${esc(me.name)} · Profile Summary</h4>
      <div class="facts">
        <div><span>Applying for</span><b>${esc(me.desig.join(', '))}</b></div>
        <div><span>Preferred Domains</span><b>${esc(D.types.join(', ')||'Not set')}</b></div>
        <div><span>Departments</span><b>${esc(me.depts.join(', ')||'Not set')}</b></div>
        <div><span>Qualification</span><b>${me.qual}</b></div>
        <div><span>Experience</span><b>${(me.expA+me.expI).toFixed(1)} years</b></div>
        <div><span>Based in</span><b>${esc(me.dist||'Not set')}</b></div>
        <div><span>Willing to Relocate</span><b>${esc(D.relocate==='Yes'?(me.reloc.join(', ')||'Anywhere in Tamil Nadu'):'Not relocating')}</b></div>
      </div>
    </div>

    <!-- Matching College Vacancies & JDs from Supabase -->
    <div class="fcard" style="margin-top:20px" id="vacancies-section">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
        <div>
          <h4 style="margin:0;font-size:18px;">Live College Vacancies & Job Descriptions</h4>
          <p class="muted" style="margin:4px 0 0;font-size:13.5px;">${isLoading ? 'Loading active vacancies from Supabase...' : `${allVac.length} open faculty positions currently active in Tamil Nadu colleges`}</p>
        </div>
        ${!isLoading && allVac.length ? `<span class="pill jade">${allVac.filter(v=>v.score>=90).length} High Match</span>` : ''}
      </div>

      ${isLoading ? `
        <!-- Loading State -->
        <div style="padding:48px 16px;text-align:center;">
          <div class="seal" style="margin:0 auto 16px;background:var(--mist);color:var(--indigo);animation:pulse 1.4s infinite;">${ICON.search || '🔍'}</div>
          <h4 style="margin:0 0 6px;color:var(--navy);">Loading Live Vacancies from Supabase...</h4>
          <p class="muted" style="margin:0;font-size:13px;">Connecting to public.vacancies table to match current requirements.</p>
        </div>
      ` : allVac.length === 0 ? `
        <!-- Empty State -->
        <div style="padding:40px 16px;text-align:center;">
          <div class="seal" style="margin:0 auto 14px;background:var(--mist);color:var(--ink-3);">${ICON.building || '🏛️'}</div>
          <h4 style="margin:0 0 6px;color:var(--navy);">No Open Vacancies Found</h4>
          <p class="muted" style="margin:0 auto 16px;max-width:440px;font-size:13px;">There are no active openings currently stored in the database. Run the seed script or wait for colleges to post requirements.</p>
          <button class="btn sm" onclick="window.__ira_reloadVacancies && window.__ira_reloadVacancies()">↻ Refresh vacancies</button>
        </div>
      ` : `
        <!-- Live Vacancy Cards List -->
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${allVac.map(v => {
            const isApplied = applied.includes(v.id);
            const tierClass = v.tier === 'best' ? 'jade' : v.tier === 'similar' ? 'indigo' : 'gold';
            return `
              <div class="vacancy-card" style="border:1.5px solid var(--line);border-radius:14px;padding:18px;background:#fff;transition:border-color .2s,box-shadow .2s;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                  <div>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <span style="font-size:18px;font-weight:800;color:var(--navy);font-family:var(--display);">${esc(v.role)}</span>
                      <span class="pill indigo">${esc(v.dept)}</span>
                      <span class="pill ${tierClass}">${v.score}% Match</span>
                    </div>
                    <div style="font-size:14px;font-weight:700;color:var(--indigo);margin-top:2px;">
                      ${esc(v.instName)} <span style="font-weight:500;color:var(--ink-3);">· ${esc(v.dist)}, Tamil Nadu</span>
                    </div>
                  </div>
                  <div>
                    ${isApplied ? 
                      `<button class="btn sm" disabled style="background:var(--jade-soft);border-color:var(--jade);color:var(--jade);font-weight:700;cursor:default;">✓ Interest Sent</button>` :
                      `<button class="btn sm jade" data-act="applyVacancy" data-id="${esc(v.id)}">Apply with IRA Profile</button>`
                    }
                  </div>
                </div>

                <!-- Vacancy Quick Details Grid -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:8px 14px;background:var(--mist);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px;">
                  <div><span style="color:var(--ink-3);display:block;font-size:11.5px;">Positions</span><b>${esc(v.count)} opening(s)</b></div>
                  <div><span style="color:var(--ink-3);display:block;font-size:11.5px;">Min Qualification</span><b>${esc(v.qual)}</b></div>
                  <div><span style="color:var(--ink-3);display:block;font-size:11.5px;">Experience</span><b>${esc(v.exp)}</b></div>
                  <div><span style="color:var(--ink-3);display:block;font-size:11.5px;">Offered Salary</span><b>${esc(v.salary)}</b></div>
                  <div><span style="color:var(--ink-3);display:block;font-size:11.5px;">Accommodation</span><b>${esc(v.accom)}</b></div>
                  <div><span style="color:var(--ink-3);display:block;font-size:11.5px;">Transport</span><b>${esc(v.transport)}</b></div>
                </div>

                <!-- Job Description / Requirements -->
                <div style="font-size:13.5px;color:var(--ink-2);line-height:1.55;margin-bottom:10px;">
                  <strong>Job Description:</strong> ${esc(v.jd)}
                </div>

                ${v.subjects && v.subjects.length ? `
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12.5px;">
                    <span style="color:var(--ink-3);font-weight:600;">Key Subjects:</span>
                    ${v.subjects.map(s => `<span class="pill" style="background:#fff;border:1px solid var(--line);">${esc(s)}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;padding-bottom:40px;">
      <button class="btn gold" data-act="editProfile">Edit my profile</button>
      <button class="btn" onclick="document.getElementById('vacancies-section')?.scrollIntoView({behavior:'smooth'})">Scroll to vacancies</button>
    </div>
  </div>`;
}
