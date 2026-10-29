/** Experimental follow-up. This module uses its own save key and never opens the original assessment store. */
import { instrument } from './content.js';
import { renderExpandedResults, createExpandedTextReport } from './expanded-results.js';
import { createExpandedFingerprint } from './expanded-fingerprint.js';

const KEY = 'political-context-expanded-v1';
const statementValues = ['strongly_agree','agree','neutral','disagree','strongly_disagree','uncertain','skip'];
const choiceValues = ['A','B','C','uncertain','none','skip'];
const labels = {strongly_agree:'Strongly agree',agree:'Agree',neutral:'Neutral',disagree:'Disagree',strongly_disagree:'Strongly disagree',uncertain:'Uncertain',none:'None of these represents my decision',skip:'Skip'};
const $ = id => document.getElementById(`expanded-${id}`);
const start=$('start'), intro=$('intro'), step=$('step'), result=$('result'), content=$('content'), error=$('error');
const save=$('save'), reset=$('reset'), recover=$('recover'), status=$('storage-status');
let catalog, items, byId, fingerprint, session=null, saveEnabled=false, invalidRaw=null, storageAvailable=true;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline = value => escape(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
function markdown(text) {
  return String(text ?? '').replace(/\r\n?/g,'\n').split(/\n\s*\n/).map(block => {
    const lines=block.split('\n');
    if (lines.every(l => /^\s*\|.*\|\s*$/.test(l)) && lines.length >= 2 && /^\s*\|[\s:|\-]+\|\s*$/.test(lines[1])) {
      const cells = line => line.trim().slice(1,-1).split('|').map(s => s.trim());
      return `<div class="expanded-table-scroll"><table><thead><tr>${cells(lines[0]).map(c=>`<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${lines.slice(2).map(line=>`<tr>${cells(line).map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if (lines.every(l=>/^\s*[-*] /.test(l))) return `<ul>${lines.map(l=>`<li>${inline(l.replace(/^\s*[-*] /,''))}</li>`).join('')}</ul>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}
function showError(message) { error.hidden=!message; error.textContent=message || ''; }
function worldFor(id) { return instrument.worlds.find(w=>w.id===id); }
function validAnswer(item, answer) {
  if (item.kind !== 'scenario') return typeof answer === 'string' && statementValues.includes(answer);
  if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;
  if (Object.keys(answer).some(k=>!['choice','reason','preference'].includes(k))) return false;
  if (!choiceValues.includes(answer.choice) || !(answer.reason === null || (typeof answer.reason === 'string' && item.reasons.en.includes(answer.reason))) || !(answer.preference === null || choiceValues.includes(answer.preference))) return false;
  return ['A','B','C'].includes(answer.choice) || answer.reason===null;
}
function validSession(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.schemaVersion!==1 || (typeof value.catalogVersion !== 'string' || !value.catalogVersion) || value.catalogFingerprint!==fingerprint || !worldFor(value.worldId) || !Number.isInteger(value.index) || value.index<0 || value.index>items.length || !value.answers || typeof value.answers!=='object' || Array.isArray(value.answers)) return false;
  if (Object.keys(value).some(k=>!['schemaVersion','catalogVersion','catalogFingerprint','worldId','index','answers'].includes(k))) return false;
  if (Object.entries(value.answers).some(([id, answer])=>!byId.has(id) || !validAnswer(byId.get(id),answer))) return false;
  return items.slice(0,value.index).every(item=>Object.hasOwn(value.answers,item.id));
}
function readStored() {
  try { return localStorage.getItem(KEY); }
  catch { storageAvailable=false; status.textContent='Device storage is unavailable. You can still complete this follow-up in this tab and download the results.'; return null; }
}
function persist() {
  if (!saveEnabled || !session) return;
  try { localStorage.setItem(KEY, JSON.stringify(session)); status.textContent='Saved on this device. Erase this follow-up when you no longer need the saved copy.'; }
  catch { saveEnabled=false; save.checked=false; status.textContent='Device saving failed. Your current answers remain in this tab; download the results before closing it.'; }
}
function download(name,text,type) {
  const url=URL.createObjectURL(new Blob([text],{type})); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function chooseWorld() {
  const a=new Uint32Array(1); crypto.getRandomValues(a); return instrument.worlds[a[0] % instrument.worlds.length].id;
}
function render() {
  showError(''); intro.hidden=true;
  const world=worldFor(session.worldId);
  if (session.index===items.length) {
    step.hidden=true; result.hidden=false;
    $('result-content').innerHTML=renderExpandedResults(catalog,session);
    $('reveal').innerHTML=`<span class="eyebrow orange">Completed setting</span><h2>${escape(world.name)}</h2><p>${escape(world.inspiration)}. Its invented events and institutions do not describe a real country or its people.</p>`;
    $('result-title').focus?.();
    return;
  }
  result.hidden=true; step.hidden=false;
  const item=items[session.index], answer=session.answers[item.id], isScene=item.kind==='scenario';
  $('progress').textContent=`Question ${session.index+1} of ${items.length}`;
  $('progress-bar').value=session.index;
  $('setting').innerHTML=`<strong>Fictional setting: ${escape(world.name)}.</strong> The new situations use generic fictional institutions, not reviewed country-specific rules. <details><summary>About this fictional setting</summary><p>${escape(world.summary)}</p></details>`;
  const values=isScene ? choiceValues : statementValues;
  const selected=isScene ? answer?.choice : answer;
  const prompt=isScene ? `<p class="eyebrow orange">Situation · ${escape(item.locality)} · ${escape(item.id)}</p><h1 id="expanded-title" tabindex="-1">${escape(item.title)}</h1><div class="expanded-briefing">${markdown(item.briefings.en)}</div>` : `<p class="eyebrow orange">Statement · ${escape(item.id)}</p><h1 id="expanded-title" tabindex="-1">${escape(item.texts.en.text)}</h1>`;
  const options=values.map(value=>{
    const option=isScene && ['A','B','C'].includes(value) ? item.options.find(o=>o.id===value) : null;
    const title=option ? `${value} — ${option.texts.en.label}` : labels[value];
    const description=option ? `<small>${escape(option.texts.en.description)}</small><small>${escape(option.texts.en.tradeoff)}</small>` : '';
    return `<label class="expanded-answer"><input type="radio" name="response" value="${escape(value)}" ${selected===value?'checked':''}><span><strong>${escape(title)}</strong>${description}</span></label>`;
  }).join('');
  const reasons=isScene ? item.reasons.en.map(r=>`<option value="${escape(r)}" ${answer?.reason===r?'selected':''}>${escape(r)}</option>`).join('') : '';
  const preferences=isScene ? choiceValues.map(v=>`<option value="${escape(v)}" ${answer?.preference===v?'selected':''}>${escape(['A','B','C'].includes(v) ? `${v} — ${item.options.find(o=>o.id===v).texts.en.label}` : labels[v])}</option>`).join('') : '';
  const followup=isScene ? `<div class="expanded-followup" id="expanded-followup"><div id="expanded-reason-wrapper" ${!['A','B','C'].includes(selected)?'hidden':''}><label for="expanded-reason">Optional reason for your choice</label><select id="expanded-reason"><option value="">No reason selected</option>${reasons}</select></div><div><label for="expanded-preference">${escape(item.personalPreferencePrompt.en)}</label><select id="expanded-preference"><option value="">No personal preference selected</option>${preferences}</select></div><p>Your personal preference is recorded separately from your assigned-role decision. A difference does not establish why it occurred.</p></div>` : '';
  content.innerHTML=`<article class="expanded-question" data-item-id="${escape(item.id)}">${prompt}<fieldset class="expanded-answer-list"><legend>${isScene?'Which decision would you make?':'How much do you agree?'}</legend>${options}</fieldset>${followup}</article>`;
  $('back').disabled=session.index===0;
  $('next').textContent=session.index===items.length-1?'See results →':'Continue →';
  content.querySelectorAll('input[name="response"]').forEach(input=>input.addEventListener('change',()=>{const reasonWrapper=$('reason-wrapper'); if(reasonWrapper) reasonWrapper.hidden=!['A','B','C'].includes(input.value); showError('');}));
  $('title').focus();
}
function capture(required) {
  const item=items[session.index], selected=content.querySelector('input[name="response"]:checked')?.value;
  if (!selected) { if(required) showError('Choose a response, uncertain, or skip before continuing.'); return !required; }
  if (item.kind==='scenario') {
    const concrete=['A','B','C'].includes(selected);
    session.answers[item.id]={choice:selected,reason:concrete ? ($('reason').value || null) : null,preference:$('preference').value || null};
  } else session.answers[item.id]=selected;
  return true;
}
start.addEventListener('click',()=>{
  if (invalidRaw!==null) {showError('Download or erase the previous follow-up data before starting.');return;}
  if (!session) session={schemaVersion:1,catalogVersion:catalog.catalogVersion,catalogFingerprint:fingerprint,worldId:chooseWorld(),index:0,answers:{}};
  persist(); render();
});
$('next').addEventListener('click',()=>{if (!capture(true)) return; session.index++; persist(); render(); window.scrollTo({top:0,behavior:'auto'});});
$('back').addEventListener('click',()=>{if(!session || session.index===0) return;capture(false);session.index--;persist();render();window.scrollTo({top:0,behavior:'auto'});});
$('edit').addEventListener('click',()=>{session.index=items.length-1;persist();render();window.scrollTo({top:0,behavior:'auto'});});
save.addEventListener('change',()=>{
  if (!storageAvailable) {save.checked=false;return;}
  saveEnabled=save.checked;
  if (saveEnabled) { if(session) persist(); else status.textContent='Device saving is enabled for the follow-up when you start.'; }
  else {try {localStorage.removeItem(KEY);status.textContent='Device saving is off; the saved follow-up copy was removed.';} catch {status.textContent='Could not remove the device copy. Try clearing it from your browser storage.';}}
});
reset.addEventListener('click',()=>{
  if(!confirm('Erase this follow-up’s saved and current answers? The original assessment is not affected.')) return;
  if (storageAvailable) {try {localStorage.removeItem(KEY);} catch {showError('Could not erase the saved device copy. Check browser storage.');return;}}
  session=null;invalidRaw=null;saveEnabled=false;save.checked=false;recover.hidden=true;step.hidden=true;result.hidden=true;intro.hidden=false;start.disabled=false;start.textContent='Start follow-up →';status.textContent='The follow-up was erased. Device saving is off.';showError('');$('main').focus();
});
recover.addEventListener('click',()=>{if(invalidRaw!==null) download('previous-expanded-follow-up.json',invalidRaw,'application/json;charset=utf-8');});
$('download-json').addEventListener('click',()=>{if(!session || session.index!==items.length)return; const world=worldFor(session.worldId);download('political-context-expanded-1.0.0.json',JSON.stringify({...session,settingInspiration:world.inspiration},null,2)+'\n','application/json;charset=utf-8');});
$('download-text').addEventListener('click',()=>{if(!session || session.index!==items.length)return;const world=worldFor(session.worldId);download('political-context-expanded-1.0.0.txt',createExpandedTextReport(catalog,session)+`\n\nCompleted fictional setting: ${world.name}\n${world.inspiration}\n`,'text/plain;charset=utf-8');});

try {
  const response=await fetch(new URL('../data/question-catalog.json',import.meta.url));
  if(!response.ok) throw new Error('Catalog unavailable');
  catalog=await response.json();
  fingerprint = await createExpandedFingerprint(catalog, instrument.worlds);
  const source=new Map(catalog.items.map(i=>[i.id,i]));
  items=[];
  for(let n=13;n<=24;n++) {for(const letter of 'ABCD') items.push(source.get(`CR-${n}${letter}`)); items.push(source.get(`CR-S${String(n-6).padStart(2,'0')}`));}
  if(items.length!==60 || items.some(i=>!i || !i.texts?.en || (i.kind==='scenario' && (!i.briefings?.en || !Array.isArray(i.reasons?.en) || !i.personalPreferencePrompt?.en || i.options.length!==3)))) throw new Error('Catalog is incomplete');
  byId=new Map(items.map(i=>[i.id,i]));
  const raw=readStored();
  if(raw!==null) {
    try {const parsed=JSON.parse(raw);if(!validSession(parsed)) throw new Error('Invalid save');session=parsed;saveEnabled=true;save.checked=true;start.textContent=session.index===items.length?'View follow-up results →':'Continue follow-up →';status.textContent='A saved follow-up was found on this device.';}
    catch {invalidRaw=raw;recover.hidden=false;showError('The previous follow-up data cannot be opened by this version. Download it or erase it before starting.');}
  }
  start.disabled=invalidRaw!==null; save.disabled=!storageAvailable || invalidRaw!==null; reset.disabled=false;
} catch {showError('The follow-up could not be loaded. Please reload the page or check the site deployment.');}
