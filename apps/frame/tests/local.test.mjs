import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {JobStore,validateReference} from '../lib/jobs.mjs';
import {describeEvent} from '../lib/runtime.mjs';
import {createApp} from '../server.mjs';

const fixture=fileURLToPath(new URL('./fixtures/fake-codex.mjs',import.meta.url));
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC';
const input=title=>({title,brief:'공개 촬영지 답사를 위한 계약 검증',reference:{name:'테스트 사진.png',dataUrl:'data:image/png;base64,'+png}});
async function until(predicate){for(let i=0;i<150;i++){const value=await predicate();if(value)return value;await new Promise(r=>setTimeout(r,30));}throw new Error('Timed out');}
async function setup(t){
  const root=await mkdtemp(path.join(os.tmpdir(),'frame-contract-'));
  const launched=[];
  const store=new JobStore(root,{retryDelays:[20,40],health:async()=>({ready:true,checks:[]}),runCommand:(exe,args,options)=>{launched.push(args);return spawn(process.execPath,[fixture,...args],options);}});
  store.config.env.UV_CACHE_DIR=fileURLToPath(new URL('../.local-data/runtime/uv-cache',import.meta.url));
  store.launched=launched;
  const app=await createApp({store});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
  const url='http://127.0.0.1:'+app.server.address().port;
  t.after(()=>app.close());return {...app,url,root};
}
test('실제 자식 프로세스 → 이벤트 스트림 → 리포트·이미지 → 디스크 복원',async t=>{
  const {store,url,root}=await setup(t);
  const response=await fetch(url+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input('contract'))});
  assert.equal(response.status,201);const r=await response.json();
  const abort=new AbortController();
  const stream=await fetch(url+'/api/requests/'+r.id+'/events',{signal:abort.signal});
  assert.match(stream.headers.get('content-type'),/event-stream/);
  const reader=stream.body.getReader();let received='';
  while(!received.includes('snapshot')){const chunk=await reader.read();received+=new TextDecoder().decode(chunk.value);}
  abort.abort();assert.match(received,/"id":"FR-/);
  const result=await until(()=>{const current=store.get(r.id);return current.job.state==='completed'&&current;});
  assert.equal(result.status,'ready');
  assert.equal(result.report.place_name,'계약 검증용 장소');
  assert.ok(result.job.events.some(x=>x.kind==='tool'));
  assert.doesNotMatch(JSON.stringify(result.job),/PRIVATE_REASONING/);
  const evidence=await fetch(url+result.report.evidence[0].dataUrl);assert.equal(evidence.status,200);assert.equal(evidence.headers.get('content-type'),'image/png');
  const denied=await fetch(url+'/api/requests/'+r.id+'/files/TASK.md');assert.equal(denied.status,404);
  const recovered=new JobStore(root);await recovered.init();assert.equal(recovered.get(r.id).job.state,'completed');assert.equal(recovered.get(r.id).report.lat,37);
  await assert.rejects(store.artifactPath(result,'../../../../outside.jpg'));
  await assert.rejects(store.artifactPath(result,'C:\\secret.jpg'));
  const landmark=await store.create(input('landmark'));
  await until(()=>landmark.job.state==='completed');
  assert.equal(landmark.status,'review');assert.equal(landmark.report.coordinate_type,'landmark');
  const skipped=await store.create(input('skip-verification'));
  await until(()=>skipped.job.state==='completed');
  assert.equal(skipped.status,'review');assert.equal(skipped.report.quality.checks.street_view.validated,false);
  assert.ok(skipped.report.quality.warnings.length);
});
test('진행 중 수정 방지, 중지, 다음 의뢰 실행 및 로그인 실패 안내',async t=>{
  const {store}=await setup(t);
  const first=await store.create(input('hold'));
  await until(()=>store.children.has(first.id));
  await assert.rejects(store.save(first.id,{...first,title:'overwrite'}),/조사 중/);
  const second=await store.create(input('fail'));assert.equal(second.job.state,'queued');
  await store.cancel(first.id);assert.equal(first.job.state,'cancelled');
  await until(()=>second.job.state==='failed');assert.match(second.job.error,/로그인/);
  await until(()=>store.current!==second.id);
  await store.enqueue(second);assert.equal(second.job.attempt,2);
  await store.cancel(second.id);
});
test('서버 재시작 시 중단 복원, 외부 Origin 및 위장 이미지 거부',async t=>{
  const {store,url,root}=await setup(t);
  const r=await store.create(input('hold'));await until(()=>store.children.has(r.id));
  const copy=JSON.parse(await readFile(path.join(root,'requests',r.id,'state.json'),'utf8'));
  await store.cancel(r.id);await writeFile(path.join(root,'requests',r.id,'state.json'),JSON.stringify(copy));
  const recovered=new JobStore(root);await recovered.init();assert.equal(recovered.get(r.id).job.state,'interrupted');
  const response=await fetch(url+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://external.invalid'},body:JSON.stringify(input('blocked'))});assert.equal(response.status,403);
  assert.throws(()=>validateReference({dataUrl:'data:image/jpeg;base64,SGVsbG8='}),/형식/);
  assert.equal(describeEvent({type:'item.completed',item:{type:'reasoning',text:'secret'}}),null);
});
test('접수·저장·재시작의 모델 선택을 실행까지 전달하고 high를 강제한다',async t=>{
 const {store,url,root}=await setup(t);let last;
 for(const model of ['gpt-6.1-sol','gpt-6.1-terra','gpt-6-luna']){
  const response=await fetch(url+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input('model test'),model,reasoningEffort:'low'})});
  assert.equal(response.status,201);const request=await response.json();last=store.get(request.id);
  await until(()=>last.job.state==='completed');await until(()=>store.current!==request.id);
  assert.equal(last.job.model,model);assert.equal(last.job.reasoningEffort,'high');
  const args=store.launched.at(-1);assert.equal(args[args.indexOf('--model')+1],model);assert.ok(args.includes('model_reasoning_effort="high"'));
 }
 const restored=new JobStore(root);await restored.init();assert.equal(restored.get(last.id).model,'gpt-6-luna');
 const invalid=await fetch(url+'/api/requests/'+last.id+'/retry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'injected-model'})});assert.equal(invalid.status,400);assert.ok(last.report);
 const retry=await fetch(url+'/api/requests/'+last.id+'/retry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6.1-terra',reasoningEffort:'low'})});assert.equal(retry.status,202);
 await until(()=>last.job.state==='completed');assert.equal(last.job.model,'gpt-6.1-terra');assert.equal(last.job.reasoningEffort,'high');
 const args=store.launched.at(-1);assert.equal(args[args.indexOf('--model')+1],'gpt-6.1-terra');
 const rejected=await fetch(url+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input('invalid'),model:'not-supported'})});assert.equal(rejected.status,400);
});

test('모델 혼잡을 제한 재시도하고 세션이 없으면 체크포인트로 새 세션을 연결한다',async t=>{
 const {store,root}=await setup(t);const r=await store.create(input('capacity-recover'));
 await until(()=>r.job.state==='completed'||r.job.state==='failed');
 assert.equal(r.job.state,'completed');assert.equal(r.job.retryCount,1);
 assert.equal(store.launched.length,3);assert.ok(store.launched[1].includes('resume'));assert.ok(!store.launched[2].includes('resume'));
 assert.ok(r.job.events.some(x=>x.code==='capacity'));assert.ok(r.job.events.some(x=>x.code==='session_missing'));
 const folder=path.join(root,'requests',r.id,'runs','1');
 assert.ok(JSON.parse(await readFile(path.join(folder,'checkpoint.json'),'utf8')).files.some(x=>x.file==='board.json'));
 assert.match(await readFile(path.join(folder,'codex.events.jsonl'),'utf8'),/at capacity/);
 assert.match(await readFile(path.join(folder,'cli-2.stderr.log'),'utf8'),/not found/);
});

test('혼잡 재시도 횟수 제한·중간 자료 이어받기·잘못된 지도와 빈 응답 차단',async t=>{
 const {store,url,root}=await setup(t);const r=await store.create(input('capacity-always'));
 await until(()=>r.job.state==='failed');await until(()=>store.current!==r.id);
 assert.equal(r.job.errorCode,'capacity');assert.equal(store.launched.length,3);assert.equal(r.job.resumable,true);
 const response=await fetch(url+'/api/requests/'+r.id+'/resume',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6.1-terra'})});
 assert.equal(response.status,202);assert.equal(r.job.resumeFrom,1);
 await until(()=>r.job.state==='failed');assert.equal(r.job.model,'gpt-6.1-terra');
 assert.ok(JSON.parse(await readFile(path.join(root,'requests',r.id,'runs','2','recovery.json'),'utf8')).files.some(x=>x.file==='board.json'));
 for(const title of ['bad-tiles','empty-json','corrupt-image']){
   const invalid=await store.create(input(title));await until(()=>invalid.job.state==='completed');
   assert.equal(invalid.status,'review');
   if(title==='bad-tiles')assert.equal(invalid.report.quality.map,null);
   else assert.equal(invalid.report.quality.checks.street_view.validated,false);
   if(title==='corrupt-image')assert.equal(invalid.report.evidence.length,0);
 }
});

test('혼잡 대기 중 중지하면 재호출하지 않고 다음 의뢰를 처리한다',async t=>{
 const {store}=await setup(t);store.retryDelays=[2000,4000];
 const r=await store.create(input('capacity-always'));
 await until(()=>r.job.events.some(x=>x.code==='capacity'));await store.cancel(r.id);
 await until(()=>store.current!==r.id);assert.equal(store.launched.length,1);assert.equal(r.job.state,'cancelled');
 const next=await store.create(input('after cancellation'));await until(()=>next.job.state==='completed');
});

test('시간 제한 시 원시 로그와 후보 체크포인트를 보존한다',async t=>{
 const {store,root}=await setup(t);store.config.timeoutMs=500;
 const r=await store.create(input('hold'));await until(()=>r.job.state==='failed');
 assert.equal(r.job.errorCode,'timeout');assert.equal(r.job.resumable,true);
 const folder=path.join(root,'requests',r.id,'runs','1');
 assert.match(await readFile(path.join(folder,'codex.events.jsonl'),'utf8'),/thread.started/);
 assert.ok(JSON.parse(await readFile(path.join(folder,'checkpoint.json'),'utf8')).files.some(x=>x.file==='board.json'));
});

test('네트워크 사전 점검 실패 시 모델을 호출하지 않는다',async t=>{
 const {store}=await setup(t);store.probe=async()=>({ready:false,error:'WinError 10013',results:[]});
 const r=await store.create(input('preflight'));await until(()=>r.job.state==='failed');
 assert.equal(store.launched.length,0);assert.equal(r.job.errorCode,'network_denied');assert.match(r.job.error,/모델 호출 전에/);
});
