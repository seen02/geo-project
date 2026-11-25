import { modelPicker, modelLabel } from './models.js';
import { escapeHTML as h, referenceURL } from './domain.js';
import { api, getRequest } from './store.js';

const phases=[['preparing','조사 준비','사진과 실행 환경 확인'],['observing','사진 분석','문자·메타데이터·시각 단서'],['researching','장소 후보 조사','단서를 따라 자료 검색'],['verifying','근거 대조','후보와 실제 자료 비교'],['reporting','리포트 작성','위치·근거·촬영 안내 정리']];
const states={queued:'시작 대기',running:'리서치 진행 중',completed:'리서치 완료',failed:'실행 확인 필요',cancelled:'조사 중지',interrupted:'조사 중단'};
const active=job=>['queued','running'].includes(job?.state);
const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const journalIcon=kind=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="${kind==='tool'?'M6 18 18 6M6 6h12v12':kind==='complete'?'m5 12 4 4L19 6':kind==='error'||kind==='warning'?'M12 7v6m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20':'M12 7v5l3 2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20'}"/></svg>`;
const clock=at=>new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:'Asia/Seoul'}).format(new Date(at));

export function renderLive(r){
  return `<div class="container live-page"><div class="page-top"><div class="breadcrumb"><a href="#/requests">내 리서치</a><span>›</span><span>실시간 리서치</span></div></div>
  <div class="live-heading"><div><h1>조사 진행 상황</h1><p>확인 중인 단서와 조사 기록이 여기에 쌓입니다</p></div><div class="live-connection" id="live-connection"><i class="pulse"></i> 연결 중</div></div>
  <div class="live-layout"><section class="live-workspace"><div class="live-status-card"><div class="row between row-wrap"><span class="live-status-label" id="live-state">${h(states[r.job?.state]||'조사 준비')}</span><span class="live-timer">경과 <b id="live-elapsed">00:00</b></span></div><h2 id="live-stage-title">조사 환경을 준비합니다.</h2><p id="live-stage-detail">접수한 사진에서 확인 가능한 단서를 찾습니다.</p><ol class="live-phases" id="live-phases"></ol><div class="live-controls" id="live-controls"></div></div>
  <div class="live-feed-card"><div class="live-feed-heading"><div><span class="eyebrow">진행 기록</span><h2>조사 기록</h2></div><span id="live-event-count" class="mono small">0개 기록</span></div><div class="live-feed" id="live-feed" role="log" aria-live="polite" aria-relevant="additions"></div><div class="live-feed-bottom"><span id="live-last-update">실제 작업 기록을 기다리고 있습니다.</span><span class="live-running-dots" id="live-dots"><i></i><i></i><i></i></span></div></div></section>
  <aside class="live-reference-card"><button class="live-reference-image" type="button" data-action="zoom-reference" data-id="${h(r.id)}" aria-label="의뢰한 원본 사진 확대"><img src="${h(referenceURL(r))}" alt="의뢰한 레퍼런스 사진"><span>의뢰한 사진 · 확대해서 보기</span></button><div class="live-reference-body"><span class="mono live-request-id">${h(r.id)}</span><h2>${h(r.title)}</h2><p class="small muted">${h(r.job?.model?modelLabel(r.job.model):'이전 실행: 모델 정보 미기록')}${r.job?.reasoningEffort?' / '+h(r.job.reasoningEffort):''}</p><div class="live-brief-tags"><span>${r.mode==='alternative'?'비슷한 촬영지 찾기':'사진 속 촬영지 찾기'}</span><span>${h(r.region||'지역 제한 없음')}</span></div><div class="line"></div><h3>찾고 싶은 장면</h3><p>${h(r.brief)}</p>${r.constraints?`<h3>추가 조건</h3><p>${h(r.constraints)}</p>`:''}<div id="live-result-preview"></div><div class="live-save-note">이 페이지를 닫아도 서버가 켜져 있으면 조사는 계속됩니다. 같은 주소로 돌아오면 기록이 이어집니다.</div></div></aside></div></div>`;
}

export function mountLive(r,{onError=()=>{}}={}){
  let record=r, source, disposed=false, terminalLoaded=false, lastVersion='', online=false;
  const get=id=>document.getElementById(id);
  const set=(id,text)=>{const el=get(id);if(el)el.textContent=text;};
  function timer(){
    const job=record.job;if(!job)return;
    const start=Date.parse(job.startedAt||job.queuedAt),end=job.finishedAt?Date.parse(job.finishedAt):Date.now();
    const seconds=Math.max(0,Math.floor((end-start)/1000));set('live-elapsed',`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`);
  }
  async function paint(snapshot){
    if(disposed)return;
    record={...record,...snapshot};const job=record.job;if(!job)return;
    set('live-state',states[job.state]||'조사 준비');get('live-state')?.setAttribute('data-state',job.state);
    const complete=job.state==='completed', index=phases.findIndex(x=>x[0]===job.stage);
    const failureTitles={capacity:'모델 혼잡으로 조사가 멈췄습니다.',quota:'계정 사용 가능량을 확인해 주세요.',rate_limit:'호출 제한으로 조사가 멈췄습니다.',auth:'Codex 로그인을 확인해 주세요.',tls:'HTTPS 연결을 확인해 주세요.',network_denied:'조사 환경의 네트워크 권한을 확인해 주세요.',timeout:'조사 시간 제한에 도달했습니다.'};
    const title=complete?'촬영지 리포트가 준비되었습니다':job.state==='queued'?'차례가 되면 조사를 시작합니다.':!active(job)?(job.state==='failed'?(failureTitles[job.errorCode]||'실행 환경을 확인해 주세요.'):'조사가 중지되었습니다.'):phases[Math.max(0,index)][1]+' 중입니다.';
    set('live-stage-title',title);
    set('live-stage-detail',(job.error|| (complete?'확인한 위치와 근거, 남은 확인사항을 리포트에 담았습니다.':job.state==='queued'?'여러 의뢰는 순서대로 조사합니다.':phases[Math.max(0,index)][2]))+(job.recovery?.files?` · 중간 자료 ${job.recovery.files}개 보존`:''));
    get('live-phases').innerHTML=phases.map(([key,label],i)=>`<li class="${complete||i<index?'done':i===index&&active(job)?'current':''}"><span>${complete||i<index?'✓':String(i+1).padStart(2,'0')}</span><b><span class="phase-full">${label}</span><span class="phase-short">${['준비','사진 분석','후보 조사','근거 대조','리포트'][i]}</span></b></li>`).join('');
    get('live-controls').innerHTML=complete?`<a class="btn btn-primary" href="#/report/${h(r.id)}">촬영지 리포트 보기 ${arrow}</a>${modelPicker(record.model||record.job?.model,'retry-model')}<button class="btn btn-outline btn-small" data-live-action="retry">새로 조사</button><span class="small muted">${record.status==='review'?'추가 확인사항 포함':'위치와 근거 정리 완료'}</span>`:active(job)?'<span class="small muted">확인되는 내용부터 실시간으로 기록합니다.</span><button class="live-stop" data-live-action="cancel">조사 중지</button>':modelPicker(record.model||record.job?.model,'retry-model')+'<button class="btn btn-primary btn-small" data-live-action="retry">다시 시작 '+arrow+'</button><a class="text-button" href="#/studio/'+h(r.id)+'">스튜디오에서 확인</a>';
    if(!active(job)&&!complete&&job.resumable){
      get('live-controls').querySelector('[data-live-action="retry"]').textContent='새로 조사';
      get('live-controls').querySelector('[data-live-action="retry"]').insertAdjacentHTML('beforebegin','<button class="btn btn-primary btn-small" data-live-action="resume">중간 자료에서 이어받기 '+arrow+'</button>');
    }
    const version=job.attempt+':'+job.sequence;
    if(version!==lastVersion){
      const feed=get('live-feed'),follow=feed.scrollTop+feed.clientHeight>=feed.scrollHeight-60;
      feed.innerHTML=job.events.map(e=>`<article class="live-entry ${h(e.kind)}"><div class="live-entry-mark">${journalIcon(e.kind)}</div><div><div class="live-entry-meta"><span>${({tool:'자료 조사',message:'조사 업데이트',progress:'단계 업데이트',system:'진행 안내',warning:'확인 사항',error:'실행 안내',complete:'리포트 완성'})[e.kind]||'업데이트'}</span><time>${clock(e.at)}</time></div><p>${h(e.message)}</p>${e.tool?`<span class="live-tool-tag">${h(e.tool)}</span>`:''}</div></article>`).join('');
      if(follow)feed.scrollTop=feed.scrollHeight;lastVersion=version;
      set('live-event-count',`${job.events.length}개 기록`);
    }
    set('live-last-update',job.events.length?'마지막 기록 '+clock(job.events.at(-1).at):'조사 기록을 기다립니다.');
    get('live-dots').hidden=!active(job);timer();
    if(!active(job)&&!terminalLoaded){
      terminalLoaded=true;
      try{
        const full=await getRequest(r.id);if(disposed)return;record=full;
        if(full.report){get('live-result-preview').innerHTML=`<div class="live-result"><span class="eyebrow">조사 결과</span><h3>${h(full.report.place_name)}</h3><p>${h(full.report.summary)}</p><a href="#/report/${h(r.id)}">전체 리포트 열기 ${arrow}</a></div>`;}
      }catch(error){onError(error.message);}
      source?.close();online=false;set('live-connection',complete?'✓ 조사 기록 저장됨':'조사 기록 저장됨');
    }
  }
  function connect(){
    source=new EventSource('/api/requests/'+encodeURIComponent(r.id)+'/events');
    source.onopen=()=>{online=true;set('live-connection','● 실시간 연결됨');};
    source.onerror=()=>{if(!disposed&&active(record.job)){online=false;set('live-connection','연결 복구 중 · 기록은 보존됩니다');}};
    source.addEventListener('snapshot',event=>{paint(JSON.parse(event.data)).catch(e=>onError(e.message));});
  }
  const handler=async event=>{
    const button=event.target.closest('[data-live-action]');if(!button)return;
    button.disabled=true;
    try{
      const restart=['retry','resume'].includes(button.dataset.liveAction);
      const next=await api('/api/requests/'+encodeURIComponent(r.id)+'/'+button.dataset.liveAction,{method:'POST',...(restart?{body:JSON.stringify({model:get('live-controls').querySelector('[name="retry-model"]')?.value})}:{})});
      if(restart){terminalLoaded=false;lastVersion='';get('live-result-preview').innerHTML='';source?.close();record=next;connect();}
      await paint(next);
    }catch(error){onError(error.message);button.disabled=false;}
  };
  get('live-controls').addEventListener('click',handler);
  paint(r).catch(e=>onError(e.message)); if(active(r.job))connect();
  const interval=setInterval(timer,1000);
  return ()=>{disposed=true;clearInterval(interval);source?.close();};
}

export async function mountRuntime(){
  const el=document.getElementById('runtime-check');if(!el)return;
  try{
    const result=await api('/api/health');if(!el.isConnected)return;
    el.innerHTML=`<div class="runtime-heading"><i class="${result.ready?'runtime-ok':'runtime-warn'}"></i><strong>${result.ready?'조사 환경 준비 완료':'실행 환경 확인 필요'}</strong><button type="button" data-action="refresh-runtime">다시 확인</button></div><div class="runtime-checks">${result.checks.map(c=>`<span class="${c.ok?'ok':'needs-fix'}" title="${h(c.detail)}">${c.ok?'✓':'!'} ${h(c.name)}</span>`).join('')}</div>${!result.ready?`<p>${h(result.checks.filter(c=>!c.ok).map(c=>c.detail).join(' '))}</p>`:''}`;
  }catch{el.innerHTML='<p>로컬 서버 연결을 확인해 주세요. npm run dev로 실행할 수 있습니다.</p>';}
}
