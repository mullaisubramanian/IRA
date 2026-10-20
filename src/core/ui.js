import { D, esc, getP, slug } from './state.js';
import { MONTHS, isDomainAllowed } from '../data/catalog.js';

export const ICON = {
  check:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bigcheck:'<svg width="26" height="26" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock:'<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.8"/></svg>',
  star:'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
  send:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cap:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M2 9l10-5 10 5-10 5-10-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5" stroke="currentColor" stroke-width="2"/></svg>',
  inst:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mic:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="2"/><path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  cam:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="13" height="12" rx="3" stroke="currentColor" stroke-width="2"/><path d="M16 10l5-3v10l-5-3" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  clip:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 11l-8.5 8.5a5 5 0 01-7-7L14 4a3.3 3.3 0 014.7 4.7L10 17.4a1.7 1.7 0 01-2.4-2.4L15.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
export const brandMark = (s=20) => `<svg viewBox="0 0 20 20" width="${s}" height="${s}"><circle cx="5" cy="14" r="3" fill="#F2A93B"/><circle cx="15" cy="6" r="3" fill="#1CC3BD"/><path d="M5 14 Q6 5 15 6" stroke="#0C8F8B" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;

/* --- form builders --- */
export const fld = (label,ctrl,o={}) => `<div class="field ${o.full?'full':''}"><label>${label}${o.req?'<span class="req">*</span>':''}</label>${ctrl}${o.hint?`<div class="hint">${o.hint}</div>`:''}</div>`;
export const inp = (k,ph='',type='text',extra='') => `<input class="in" type="${type}" data-k="${k}" value="${esc(getP(D,k))}" placeholder="${esc(ph)}" ${extra}>`;
export const ta = (k,ph='') => `<textarea class="in" data-k="${k}" placeholder="${esc(ph)}">${esc(getP(D,k))}</textarea>`;
export const sel = (k,opts,ph='Select',rr=false) => `<select class="in" data-k="${k}" ${rr?'data-rr':''}><option value="">${ph}</option>${opts.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return `<option value="${esc(v)}" ${String(getP(D,k)??'')===String(v)?'selected':''}>${esc(l)}</option>`}).join('')}</select>`;
export function chips(k,opts,multi=false){const v=getP(D,k);return `<div class="chips">${opts.map(o=>{const on=multi?(v||[]).includes(o):v===o;return `<button type="button" class="chip ${on?'on':''}" data-ck="${k}" data-cv="${esc(o)}" ${multi?'data-multi':''}>${esc(o)}</button>`}).join('')}</div>`}
export const yn = k => chips(k,['Yes','No']);
export function upload(k,accept='*',label='Choose file'){const v=k==='voiceFile'?D.voice:k==='videoFile'?D.video:getP(D,k);return `<label class="upload"><input type="file" data-file="${k}" accept="${accept}"><span class="btn sm">${ICON.clip} ${label}</span><span class="fn">${v&&v.name?esc(v.name):'No file chosen'}</span></label>`}
export function tagInput(k,sugg=[],ph='Type or pick a subject'){
  const v=getP(D,k)||[];
  const id='dl_'+slug(k);
  const left=sugg.filter(s=>!v.includes(s));
  const prompt = k === 'relocList' ? '-- Click here to select a district / city --' : '-- Click here to select from list --';
  return `<div class="tags" id="tags_${slug(k)}">${v.map((t,i)=>`<span class="tag">${esc(t)}<button type="button" class="tag-rm" data-act="rmTag" data-k="${k}" data-i="${i}" aria-label="Remove ${esc(t)}" title="Remove">×</button></span>`).join('')}</div>
  ${left.length?`<div style="margin-bottom:8px">
    <select class="in tag-select" data-act="selectTag" data-k="${k}">
      <option value="">${prompt}</option>
      ${left.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')}
    </select>
  </div>`:''}
  <div style="display:flex;gap:8px;align-items:center">
    <input class="in" data-tag="${k}" list="${id}" placeholder="${esc(ph)}" style="flex:1">
    <datalist id="${id}">${left.map(s=>`<option value="${esc(s)}">`).join('')}</datalist>
    <button type="button" class="btn sm" data-act="addTagBtn" data-k="${k}">+ Add</button>
  </div>
  ${left.length?`<div class="sugg"><span style="font-size:12px;color:var(--ink-3);display:inline-flex;align-items:center;margin-right:4px">Suggestions:</span>${left.slice(0,8).map(s=>`<button type="button" data-act="addTag" data-k="${k}" data-v="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>`:''}`;
}
export function domainChips(k,opts){
  const selected=getP(D,k)||[];
  return `<div class="chips">${opts.map(o=>{
    const on=selected.includes(o);
    const allowed=isDomainAllowed(selected,o);
    return `<button type="button" class="chip ${on?'on':''} ${!allowed?'disabled':''}" data-ck="${k}" data-cv="${esc(o)}" data-multi ${!allowed?'disabled title="Incompatible with your chosen domain"':''}>${esc(o)}</button>`;
  }).join('')}</div>`;
}
export function age(dob){if(!dob)return '';const d=new Date(dob),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--;return a>0&&a<100?a:''}
export const ym = (y,m) => y&&m?`${y}-${String(m).padStart(2,'0')}`:'';
export function yearsBetween(a,b){if(!a)return 0;const s=new Date(a+'-01'),e=b?new Date(b+'-01'):new Date();return Math.max(0,(e-s)/(365.25*864e5))}
export const YEARS = (from,to) => {const a=[];for(let y=to;y>=from;y--)a.push(String(y));return a};
export const NOW_Y = new Date().getFullYear();
export const monthYear = k => `<div class="dob" style="grid-template-columns:1.3fr 1fr">${sel(k+'M',MONTHS.map((m,i)=>[String(i+1),m]),'Month',true)}${sel(k+'Y',YEARS(1975,NOW_Y),'Year',true)}</div>`;
