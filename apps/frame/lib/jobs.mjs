import { EventEmitter } from 'node:events';
import { spawn, execFile } from 'node:child_process';
import { mkdir, readFile, writeFile, rename, readdir, stat, realpath, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { normalizeReport, reportTemplate, sampleRequest, SAMPLE_ID } from '../dist/lib/domain.js';
import { runtimeConfig, checkRuntime, REPORT_SCHEMA, FRAME_MODEL, FRAME_EFFORT } from './runtime.mjs';
import { assessReport } from './quality.mjs';
import { researchPrompt } from './prompt.mjs';
import {validateModel} from '../dist/lib/models.js';
import {classifyError} from './errors.mjs';
import {prepareCatalog,probeNetwork} from './tooling.mjs';
import {inventory,carryForward} from './recovery.mjs';
import {validateAssets} from './assets.mjs';
import {executeWorker} from './worker.mjs';
import {readPhotoExif,applyPhotographerEnrichment} from './enrich.mjs';

export const activeState = state => ['queued', 'running'].includes(state);
const idPattern = /^FR-[A-Z0-9-]{4,70}$/;
const iso = () => new Date().toISOString();
const encode = value => JSON.stringify(value, null, 2);
const stages = ['queued', 'preparing', 'observing', 'researching', 'verifying', 'reporting', 'complete'];
const imageTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

export function validateReference(reference) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(reference?.dataUrl || '');
  if (!match) throw Object.assign(new Error('JPG·PNG·WEBP 사진을 올려 주세요.'), { status: 400 });
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > 20 * 1024 * 1024) throw Object.assign(new Error('사진은 20MB 이하로 올려 주세요.'), { status: 400 });
  const signatureOK = match[1] === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 : match[1] === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!signatureOK) throw Object.assign(new Error('사진의 실제 파일 형식을 확인해 주세요.'), { status: 400 });
  return { bytes, type: match[1], extension: { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[match[1]] };
}

export class JobStore extends EventEmitter {
  constructor(root, options = {}) {
    super(); this.root = root; this.config = runtimeConfig(root); this.records = new Map();
    this.queue = []; this.current = null; this.children = new Map(); this.writes = new Map();
    this.runCommand = options.runCommand || spawn; this.health = options.health || (() => checkRuntime(this.config));
    this.probe=options.networkProbe||(options.runCommand?async()=>({ready:true,skipped:true}):dir=>probeNetwork(this.config,dir));
    this.retryDelays=options.retryDelays||[15000,45000];
    this.closing = false;
  }
  folder(id) {
    if (!idPattern.test(id)) throw Object.assign(new Error('올바른 의뢰 번호가 아닙니다.'), { status: 400 });
    return path.join(this.root, 'requests', id);
  }
  async init() {
    await mkdir(path.join(this.root, 'requests'), { recursive: true });
    for (const dir of await readdir(path.join(this.root, 'requests'), { withFileTypes: true })) {
      if (!dir.isDirectory() || !idPattern.test(dir.name)) continue;
      try {
        const r = JSON.parse(await readFile(path.join(this.folder(dir.name), 'state.json'), 'utf8'));
        if (activeState(r.job?.state)) {
          r.job.state = 'interrupted'; r.job.finishedAt = iso();
          r.status = 'interrupted';
          r.job.error = '서버가 종료되어 조사가 중단되었습니다. 보존한 중간 자료에서 이어받을 수 있습니다.';
          r.job.errorCode='interrupted';
        }
        if(r.job&&!activeState(r.job.state)&&r.job.state!=='completed'){
          const files=await inventory(path.join(this.folder(r.id),'runs',String(r.job.attempt)));
          r.job.resumable=files.length>0;r.job.recovery={...r.job.recovery,files:files.length};
          if(r.job.state==='failed'&&!r.job.errorCode){
            const raw=await readFile(path.join(this.folder(r.id),'runs',String(r.job.attempt),'codex.events.jsonl'),'utf8').catch(()=>'');
            let failure='';for(const line of raw.split('\n')){try{const e=JSON.parse(line);if(e.type==='error'||e.type==='turn.failed')failure=e.error?.message||e.message||failure;}catch{}}
            if(failure){const problem=classifyError(failure);r.job.errorCode=problem.code;r.job.error=problem.message;r.job.retryable=problem.retryable;}
          }
        }
        this.records.set(r.id, r); await this.persist(r);
      } catch (error) { console.warn(`의뢰 ${dir.name} 복구 실패: ${error.message}`); }
    }
    if (!this.records.has(SAMPLE_ID)) { this.records.set(SAMPLE_ID, sampleRequest()); await this.persist(this.get(SAMPLE_ID)); }
  }
  list() { return [...this.records.values()].sort((a,b) => b.createdAt.localeCompare(a.createdAt)); }
  get(id) { this.folder(id); const r = this.records.get(id); if (!r) throw Object.assign(new Error('의뢰를 찾을 수 없습니다.'), { status: 404 }); return r; }
  snapshot(r) { return { id: r.id, status: r.status, updatedAt: r.updatedAt, job: structuredClone(r.job || null), hasReport: !!r.report }; }
  persist(r) {
    const body = encode(r), folder = this.folder(r.id);
    const pending = (this.writes.get(r.id) || Promise.resolve()).catch(() => {}).then(async () => {
      await mkdir(folder, { recursive: true });
      await writeFile(path.join(folder, 'state.tmp'), body);
      await rename(path.join(folder, 'state.tmp'), path.join(folder, 'state.json'));
    });
    this.writes.set(r.id, pending); return pending;
  }
  async update(r) { r.updatedAt = iso(); await this.persist(r); this.emit(r.id, this.snapshot(r)); }
  async log(r, kind, message, extra = {}) {
    message = String(message).replace(/\x1b\[[0-9;]*m/g, '').trim().slice(0, 1800);
    if (!message) return;
    const previous = r.job.events.at(-1);
    if (previous?.message === message && Date.now() - Date.parse(previous.at) < 3000) return;
    r.job.sequence = (r.job.sequence || 0) + 1;
    r.job.events.push({ id: r.job.sequence, at: iso(), kind, message, ...extra });
    r.job.events = r.job.events.slice(-180); await this.update(r);
  }
  async stage(r, stage, message) {
    if (!stages.includes(stage) || stages.indexOf(stage) < stages.indexOf(r.job.stage)) return;
    r.job.stage = stage; if (message) await this.log(r, 'progress', message); else await this.update(r);
  }
  async create(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw Object.assign(new Error('올바른 의뢰 정보가 필요합니다.'), {status:400});
    const model=validateModel(input.model);
    const photo = validateReference(input.reference);
    const text = (key, max) => String(input[key] || '').trim().slice(0, max);
    if (!text('title', 100) || !text('brief', 5000)) throw Object.assign(new Error('제목과 요청사항을 입력해 주세요.'), { status: 400 });
    const id = `FR-${iso().slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,6).toUpperCase()}`;
    const gearLenses = Array.isArray(input.gear_lenses) ? input.gear_lenses.map(x => String(x || '').trim().slice(0, 40)).filter(Boolean).slice(0, 8) : [];
    const r = { id, title: text('title',100), brief: text('brief',5000), region: text('region',120), purpose: text('purpose',100), constraints: text('constraints',500), date: text('date',20), gear_lenses: gearLenses, light_pref: text('light_pref', 100), mode: input.mode === 'alternative' ? 'alternative' : 'original', reference: { name: String(input.reference.name || 'reference.'+photo.extension).slice(0,200), type: photo.type, dataUrl: input.reference.dataUrl }, status: 'received', createdAt: iso(), updatedAt: iso(), isSample: false, report: null };
    r.model=model;this.records.set(id, r); await this.enqueue(r,model); return r;
  }
  async save(id, input) {
    if (!input || typeof input !== 'object' || typeof input.title !== 'string' || !input.title.trim() || typeof input.brief !== 'string' || !input.reference) throw Object.assign(new Error('제목·요청사항·사진이 있는 의뢰 정보가 필요합니다.'), {status:400});
    const existing = this.records.get(id); this.folder(id);
    if (activeState(existing?.job?.state)) throw Object.assign(new Error('조사 중에는 결과를 수정할 수 없습니다. 조사를 중지한 뒤 수정해 주세요.'), { status: 409 });
    const clean = { ...input, id, job: existing?.job || null, updatedAt: iso(), createdAt: existing?.createdAt || input.createdAt || iso() };
    if (id !== SAMPLE_ID && clean.reference?.dataUrl) validateReference(clean.reference);
    if (clean.report) clean.report = normalizeReport(clean.report);
    if (clean.draft) clean.draft = normalizeReport(clean.draft);
    this.records.set(id, clean); await this.persist(clean); return clean;
  }
  async delete(id) {
    const r = this.get(id);
    if (activeState(r.job?.state)) throw Object.assign(new Error('조사를 중지한 뒤 삭제할 수 있습니다.'), { status: 409 });
    await unlink(path.join(this.folder(id), 'state.json')); this.records.delete(id);
  }
  async enqueue(r,model=r.model||FRAME_MODEL,resume=false) {
    model=validateModel(model);
    if (activeState(r.job?.state)) throw Object.assign(new Error('이미 진행 중인 의뢰입니다.'), { status: 409 });
    if (this.current === r.id) throw Object.assign(new Error('이전 조사 프로세스를 종료하고 있습니다. 잠시 후 다시 시작해 주세요.'), { status:409 });
    if(r.report){
      const history=path.join(this.folder(r.id),'history');await mkdir(history,{recursive:true});
      await writeFile(path.join(history,`attempt-${r.job?.attempt||0}-${Date.now()}.json`),encode(r));
    }
    const resumeFrom=resume?r.job?.attempt:null;
    if(resume&&(!resumeFrom||!r.job.resumable))throw Object.assign(new Error('이어받을 중간 자료가 없습니다. 새로 조사해 주세요.'),{status:409});
    r.model=model;
    r.job = { state: 'queued', stage: 'queued', model, reasoningEffort:FRAME_EFFORT, attempt: (r.job?.attempt || 0) + 1, queuedAt: iso(), startedAt: null, finishedAt: null, events: [], sequence: 0, error: null, artifacts: [] };
    r.job.resumeFrom=resumeFrom;
    r.report = null; r.draft = null; r.status = 'received';
    await this.log(r, 'system', this.current ? '사진을 접수했습니다. 앞선 조사 후 자동으로 시작합니다.' : '사진을 접수했습니다. 조사 환경을 준비합니다.');
    this.queue.push(r.id); setImmediate(() => this.drain());
  }
  async drain() {
    if (this.current || this.closing) return;
    const id = this.queue.shift(); if (!id) return;
    const r = this.records.get(id); if (!r || r.job.state !== 'queued') return this.drain();
    this.current = id;
    try { this.runningTask=this.run(r); await this.runningTask; }
    catch (error) {
      if (activeState(r.job.state)) {
        const problem=classifyError(error.message);
        r.job.state = 'failed'; r.status = 'failed'; r.job.error = error.publicMessage || problem.message; r.job.errorCode=problem.code;r.job.retryable=problem.retryable;r.job.finishedAt = iso();
        await this.log(r, 'error', r.job.error,{code:problem.code});
      }
    } finally { this.current = null; this.children.delete(id); setImmediate(() => this.drain()); }
  }
  async run(r) {
    r.job.state = 'running'; r.job.startedAt = iso(); r.status = 'researching';
    await this.stage(r, 'preparing', 'Codex 로그인과 geo-sleuth 도구를 확인합니다.');
    const health = await this.health();
    if (!health.ready) throw { publicMessage: health.checks.filter(x => !x.ok).map(x => x.name + ': ' + x.detail).join(' '), message: 'preflight failed' };
    if (r.job.state !== 'running') return;
    const dir = path.join(this.folder(r.id), 'runs', String(r.job.attempt));
    const runtimeDirectory = path.join(this.root,'runtime');
    await Promise.all([mkdir(dir, { recursive: true }),mkdir(runtimeDirectory,{recursive:true})]);
    if(r.job.resumeFrom){
      const recovered=await carryForward(path.join(this.folder(r.id),'runs',String(r.job.resumeFrom)),dir);
      await writeFile(path.join(dir,'recovery.json'),encode({fromAttempt:r.job.resumeFrom,...recovered}));
      await this.log(r,'system',`이전 조사에서 보존한 자료 ${recovered.files.length}개를 넘겨받았습니다. 유효성을 확인하며 이어갑니다.`);
    }
    await prepareCatalog(dir,this.config);
    await this.log(r,'system','동일한 조사 샌드박스에서 HTTPS 연결을 점검합니다.');
    const network=await this.probe(dir);r.job.network=network;
    await writeFile(path.join(dir,'network-diagnostics.json'),encode(network));
    if(r.job.state!=='running')return;
    if(!network.ready)throw {publicMessage:'조사 환경의 HTTPS 사전 점검에 실패했습니다. 모델 호출 전에 중단했습니다. network-diagnostics.json에서 네트워크·권한 오류를 확인해 주세요.',message:network.error||JSON.stringify(network.results)};
    if(!network.skipped)await this.log(r,'system','Python HTTPS 전송 경로를 확인했습니다. 서비스별 거절 응답은 별도 기록했습니다.');
    const photo = validateReference(r.reference);
    const reference = path.join(dir, 'reference.'+photo.extension), schema = path.join(dir, 'report.schema.json'), final = path.join(dir, 'final.json');
    const prompt = this.prompt(r, reference);
    await Promise.all([
      writeFile(reference, photo.bytes), writeFile(schema, encode(REPORT_SCHEMA)), writeFile(path.join(dir, 'TASK.md'), prompt),
      writeFile(path.join(dir, 'request.json'), encode({ ...r, reference: { name: path.basename(reference) }, job: undefined, report: undefined })),
      writeFile(path.join(dir, 'result.template.json'), encode(reportTemplate(r))),
    ]);
    await this.stage(r, 'observing', 'Codex에 원본 사진과 조사 요청을 전달했습니다.');
    if (r.job.state !== 'running') return;
    const completedTools=new Set();
    const paths={dir,reference,schema,final,runtimeDirectory};
    const deadline=Date.parse(r.job.startedAt)+this.config.timeoutMs;
    let invocation=0,retries=0,session=null,sessionFallback=false;
    while(r.job.state==='running'){
      await unlink(final).catch(()=>{});
      const outcome=await executeWorker(this,r,paths,prompt,completedTools,++invocation,deadline,session);
      if(r.job.state!=='running')return;
      if(outcome.ok)break;
      const problem=classifyError(outcome.error);
      if(session&&problem.code==='session_missing'&&!sessionFallback){
        sessionFallback=true;session=null;
        await writeFile(path.join(dir,'recovery.json'),encode({fromInvocation:invocation,files:await inventory(dir)}));
        await this.log(r,'warning',problem.message,{code:problem.code});continue;
      }
      if(problem.code==='capacity'&&retries<this.retryDelays.length){
        const delay=this.retryDelays[retries++];
        if(Date.now()+delay+1000<deadline){
          r.job.retryCount=retries;
          await this.log(r,'warning',`선택한 모델이 혼잡합니다. ${Math.round(delay/1000)}초 후 같은 모델로 이어받기를 시도합니다 (${retries}/${this.retryDelays.length}).`,{code:'capacity'});
          const until=Date.now()+delay;
          while(Date.now()<until&&r.job.state==='running')await new Promise(resolve=>setTimeout(resolve,Math.min(250,until-Date.now())));
          if(r.job.state!=='running')return;
          session=r.job.threadId||null;
          if(!session)await writeFile(path.join(dir,'recovery.json'),encode({fromInvocation:invocation,files:await inventory(dir)}));
          continue;
        }
      }
      throw new Error(outcome.error);
    }
    await this.stage(r, 'reporting', '조사 결과와 실제 생성된 근거 파일을 리포트에 연결합니다.');
    let raw;
    try { raw = JSON.parse(await readFile(final, 'utf8')); }
    catch { throw { publicMessage: 'Codex 작업은 끝났지만 결과 JSON을 읽지 못했습니다. 다시 시작하거나 스튜디오에서 결과를 가져와 주세요.', message: 'invalid result' }; }
    if (raw.request_id !== r.id) throw { publicMessage: '조사 결과의 의뢰 번호가 일치하지 않습니다. 결과 연결을 중단했습니다.', message: 'request mismatch' };
    const rawReport = normalizeReport(raw);
    const exif = await readPhotoExif(reference, this.config);
    const report = normalizeReport(applyPhotographerEnrichment(rawReport, exif, r));
    if (!report.place_name.trim() || !report.summary.trim()) throw { publicMessage: '조사 결과에 장소 또는 요약이 없습니다. 다시 시작하거나 스튜디오에서 확인해 주세요.', message: 'incomplete result' };
    const evidence = [];
    for (const entry of report.evidence.slice(0,15)) {
      const target = await this.artifactPath(r, entry.file).catch(() => null);
      if (!target) continue;
      const info = await stat(target);
      if (!info.isFile() || info.size > 15*1024*1024 || !imageTypes[path.extname(target).toLowerCase()]) continue;
      const rel = path.relative(dir, target).split(path.sep).join('/');
      evidence.push({ ...entry, file: rel, dataUrl: `/api/requests/${r.id}/files/${rel.split('/').map(encodeURIComponent).join('/')}` });
    }
    report.evidence = evidence;
    const assets=await validateAssets(report,f=>this.artifactPath(r,f),this.config);
    await writeFile(path.join(dir,'asset-validation.json'),encode(assets));
    report.evidence=report.evidence.filter(x=>assets[x.file]?.ok);
    if(r.job.state!=='running')return;
    const quality=await assessReport(report,f=>this.artifactPath(r,f),completedTools,assets);
    report.quality=quality;
    const settled=quality.ready;
    if(quality.map){report.map_image={...quality.map,url:`/api/requests/${r.id}/files/${quality.map.file.split('/').map(encodeURIComponent).join('/')}`};}
    report.caveats.push(...quality.warnings);
    if (!['camera','camera_estimate'].includes(report.coordinate_type)) report.caveats.push('표시 좌표는 촬영점이 아닌 장소·지역 참고 좌표입니다.');
    if (!report.evidence.length) report.caveats.push('연결 가능한 실제 근거 이미지가 없어 추가 확인이 필요합니다.');
    report.caveats.push('Codex가 자동 생성한 조사 결과입니다. 촬영지 방문·허가·최신 현장 상태는 별도로 확인해 주세요.');
    r.report = report; r.status = settled ? 'ready' : 'review';
    r.job.state = 'completed'; r.job.stage = 'complete'; r.job.finishedAt = iso();
    r.job.artifacts = report.evidence.map(x => ({ name: x.name, url: x.dataUrl }));
    await this.log(r, 'complete', settled ? '조사가 완료되어 촬영지 리포트를 연결했습니다.' : '조사를 마쳤습니다. 확인된 범위와 추가 확인사항을 리포트에 정리했습니다.');
  }
  prompt(r, reference) {
    return researchPrompt(r,reference,this.config.skill,Math.round(this.config.timeoutMs/60000));
  }
  async artifactPath(r, relative) {
    if (!relative || relative.includes('\\') || relative.includes(':') || path.isAbsolute(relative)) throw new Error('Invalid artifact');
    const root = path.join(this.folder(r.id), 'runs', String(r.job.attempt)), target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) throw new Error('Invalid artifact');
    const actual = await realpath(target), actualRoot = await realpath(root);
    if (!actual.startsWith(actualRoot + path.sep)) throw new Error('Invalid artifact');
    return actual;
  }
  stopChild(child) {
    if (!child?.pid) return;
    if (process.platform === 'win32') execFile('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }, () => {});
    else child.kill('SIGTERM');
  }
  async cancel(id, interrupted = false) {
    const r = this.get(id); if (!activeState(r.job?.state)) return r;
    this.queue = this.queue.filter(x => x !== id);
    r.job.state = interrupted ? 'interrupted' : 'cancelled'; r.job.finishedAt = iso();
    r.status = r.job.state;
    this.stopChild(this.children.get(id));
    await this.log(r, 'system', interrupted ? '서버 종료로 조사를 중단했습니다. 다시 시작할 수 있습니다.' : '요청에 따라 조사를 중지했습니다. 다시 시작할 수 있습니다.');
    return r;
  }
  async close() { this.closing = true; await Promise.all(this.list().filter(x => activeState(x.job?.state)).map(x => this.cancel(x.id,true))); await this.runningTask?.catch(()=>{}); await Promise.allSettled(this.writes.values()); }
}
