/* Branching personality assessment, trait scoring and the radar chart (radar shown to institutions only). */
import { go } from '../app/render.js';
import { D, esc } from '../core/state.js';
import { ICON } from '../core/ui.js';
import { TRAITS } from '../data/catalog.js';
import { QB } from '../data/questions.js';
import { R } from './institution.js';

/* ===================== 5) PERSONALITY ASSESSMENT ===================== */
export function quizDone(){const q=D.qa;const last=q.path[q.path.length-1];return q.path.length===10&&q.ans[last]!=null}
export function shuffled(id){if(!D.qa.shuf[id]){const a=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}D.qa.shuf[id]=a}return D.qa.shuf[id]}
export function renderQuiz(){
  const q=D.qa;
  if(quizDone()){
    // Faculty see only a confirmation. Scores go to institutions, never back to the faculty member.
    return `<div class="fcard" style="text-align:center;padding:44px 26px">
      <div class="seal" style="margin:0 auto 16px">${ICON.bigcheck}</div>
      <h3 style="margin:0 0 6px;font-size:24px">Your responses are submitted</h3>
      <p class="muted" style="margin:0 auto;max-width:440px">Thank you. Continue to the next step to record your introduction.</p></div>`;
  }
  const id=q.path[q.path.length-1], Q=QB[id], idx=q.path.length;
  const order=shuffled(id);
  return `<div class="fcard"><div class="qbody">
    <div class="qhead"><span class="pill indigo">${Q.area}</span><div style="display:flex;align-items:center;gap:12px"><div class="qdots">${Array.from({length:10},(_,i)=>`<i class="${i<idx-1?'on':i===idx-1?'now':''}"></i>`).join('')}</div><span class="muted" style="font-size:13px">${idx} of 10</span></div></div>
    <p class="scenario">${esc(Q.sc)}</p>
    <div class="opts">${order.map((oi,j)=>`<button class="opt ${q.ans[id]===oi?'sel':''}" data-act="answer" data-q="${id}" data-o="${oi}"><span class="l">${'ABCD'[j]}</span><span>${esc(Q.o[oi][0])}</span></button>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;gap:12px;flex-wrap:wrap"><button class="btn sm ghost" data-act="quizBack" ${idx===1?'disabled':''}>Previous scenario</button><span class="muted" style="font-size:12.5px">There are no right or wrong answers.</span></div>
  </div></div>`;
}
export function traitScores(q){
  const raw={CA:0,SC:0,IN:0,CO:0,OW:0,PR:0,RE:0,AV:0};
  q=q||D.qa;
  q.path.forEach(id=>{const a=q.ans[id];if(a==null)return;QB[id].o[a][1].split(' ').forEach(t=>{const m=t.match(/([A-Z]{2})([+-]\d)/);if(m)raw[m[1]]+=+m[2]})});
  const out={};Object.keys(TRAITS).forEach(k=>out[k]=Math.max(1,Math.min(10,Math.round(5+raw[k]*1.1))));
  out.AV=raw.AV; return out;
}
export function personaText(t){
  const top=Object.keys(TRAITS).sort((a,b)=>t[b]-t[a]).slice(0,2);
  const words={CA:'calm and in control',SC:'student-focused',IN:'principled under pressure',CO:'a natural collaborator',OW:'takes ownership',PR:'follows proper process',RE:'steady when things go wrong'};
  let s=`<p style="font-size:15px;margin-top:0"><b>Top strengths:</b> ${words[top[0]]}; ${words[top[1]]}.</p>`;
  if(t.AV>=3) s+=`<p class="note">May sometimes delay difficult conversations. Worth exploring in the interview.</p>`;
  else if(t.IN<=4) s+=`<p class="note">May give in to pressure on rules. Worth exploring in the interview.</p>`;
  return s+`<p class="muted" style="font-size:12px">Indicative only. Use it to guide the interview, not to reject anyone.</p>`;
}
export function radar(t,size=240){
  const ks=Object.keys(TRAITS),c=size/2,R=size/2-38;
  const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/ks.length;return [c+Math.cos(a)*R*v/10,c+Math.sin(a)*R*v/10]};
  const rings=[2.5,5,7.5,10].map(v=>`<polygon points="${ks.map((_,i)=>pt(i,v).join(',')).join(' ')}" fill="none" stroke="#E3E7F1"/>`).join('');
  const shape=ks.map((k,i)=>pt(i,t[k]).join(',')).join(' ');
  const labels=ks.map((k,i)=>{const [x,y]=pt(i,12.8);return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${TRAITS[k].split(' ')[0]}</text>`}).join('');
  return `<svg class="radar" viewBox="0 0 ${size} ${size}" style="width:100%;max-width:${size}px">${rings}<polygon points="${shape}" fill="rgba(242,169,59,.28)" stroke="#F2A93B" stroke-width="2"/>${ks.map((k,i)=>{const [x,y]=pt(i,t[k]);return `<circle cx="${x}" cy="${y}" r="3" fill="#06393C"/>`}).join('')}${labels}</svg>`;
}
