import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import {MODEL_OPTIONS,DEFAULT_MODEL,MODEL_EFFORT,validateModel} from '../dist/lib/models.js';
import {classifyError,commandProblem} from './errors.mjs';
export const FRAME_MODEL = DEFAULT_MODEL;
export const FRAME_EFFORT = MODEL_EFFORT;

function codexExecutable(profile) {
  if (process.env.FRAME_CODEX_BIN) return process.env.FRAME_CODEX_BIN;
  const names=process.platform==='win32'?['codex.exe','codex']:['codex'];
  for(const folder of (process.env.PATH||'').split(path.delimiter))for(const name of names){
    const candidate=path.join(folder,name);if(existsSync(candidate))return candidate;
  }
  if(process.platform==='win32'){
    const bundled=path.join(profile,'AppData','Local','OpenAI','Codex','bin');
    try{
      const candidates=readdirSync(bundled,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>path.join(bundled,x.name,'codex.exe')).filter(existsSync);
      candidates.sort((a,b)=>statSync(b).mtimeMs-statSync(a).mtimeMs);if(candidates.length)return candidates[0];
    }catch{}
  }
  return 'codex';
}

export function runtimeConfig(dataRoot) {
  const profile = process.env.USERPROFILE || os.homedir();
  const helpers=fileURLToPath(new URL('../tools/',import.meta.url));
  return {
    helpers,
    uv:(process.env.PATH||'').split(path.delimiter).map(folder=>path.join(folder,process.platform==='win32'?'uv.exe':'uv')).find(existsSync)||'uv',
    python:(process.env.PATH||'').split(path.delimiter).map(folder=>path.join(folder,process.platform==='win32'?'python.exe':'python3')).find(existsSync)||'python',
    codex: codexExecutable(profile),
    skill: process.env.FRAME_GEO_SKILL || path.join(profile, '.codex', 'skills', 'geo-sleuth'),
    timeoutMs: Number(process.env.FRAME_JOB_TIMEOUT_MS || 900000),
    env: { ...process.env,
      CODEX_HOME: process.env.CODEX_HOME || path.join(profile, '.codex'),
      GEO_SLEUTH_REGIONS: [fileURLToPath(new URL('../region-packs/',import.meta.url)),...(process.env.GEO_SLEUTH_REGIONS||'').split(path.delimiter).filter(Boolean)].join(path.delimiter),
      UV_CACHE_DIR: path.join(dataRoot, 'runtime', 'uv-cache'),
      UV_PYTHON_INSTALL_DIR: path.join(dataRoot, 'runtime', 'python'),
      UV_SYSTEM_CERTS: 'true', PYTHONIOENCODING: 'utf-8', PYTHONUTF8:'1',
      FRAME_PYTHON_HTTPS:'1',
      PYTHONPATH:[path.join(helpers,'python'),process.env.PYTHONPATH].filter(Boolean).join(path.delimiter),
      HF_HOME: path.join(dataRoot, 'runtime', 'models'),
    },
  };
}
export function command(executable, args, options = {}) {
  return new Promise(resolve => {
    const {timeoutMs=12000,input,...spawnOptions}=options;
    const child = spawn(executable, args, { windowsHide: true, shell: false, ...spawnOptions });
    let output = '';
    if(input!==undefined){child.stdin.on('error',()=>{});child.stdin.end(input);}
    child.stdout?.on('data', chunk => { output += chunk; });
    child.stderr?.on('data', chunk => { output += chunk; });
    const timer = setTimeout(() => child.kill(), timeoutMs);
    child.on('error', error => { clearTimeout(timer); resolve({ ok: false, output: error.message }); });
    child.on('close', code => { clearTimeout(timer); resolve({ ok: code === 0, output: output.trim() }); });
  });
}
export async function checkRuntime(config) {
  const [login, uv, python, skill] = await Promise.all([
    command(config.codex, ['login', 'status'], { env: config.env }),
    command('uv', ['--version'], { env: config.env }),
    command('python', ['--version'], { env: config.env }),
    access(path.join(config.skill, 'SKILL.md')).then(() => true, () => false),
  ]);
  const checks = [
    { name: 'Codex 로그인', ok: login.ok, detail: login.ok ? '현재 PC의 Codex 인증 사용' : '터미널에서 codex login을 실행해 주세요.' },
    { name: 'geo-sleuth', ok: skill, detail: skill ? '설치된 스킬 연결' : 'FRAME_GEO_SKILL에 스킬 경로를 지정해 주세요.' },
    { name: 'uv', ok: uv.ok, detail: uv.ok ? uv.output.split('\n')[0] : 'uv 설치가 필요합니다.' },
    { name: 'Python', ok: python.ok, detail: python.ok ? python.output.split('\n')[0] : 'Python 3.10 이상이 필요합니다.' },
  ];
  return { ready: checks.every(x => x.ok), checks, engine: 'Codex CLI + geo-sleuth', model:FRAME_MODEL, models:MODEL_OPTIONS, reasoningEffort:FRAME_EFFORT, timeoutMinutes: Math.round(config.timeoutMs / 60000) };
}
const string = { type: 'string' };
const nullableNumber = { type: ['number', 'null'] };
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const array = items => ({ type: 'array', items });
const sourceEnum = { type: 'string', enum: ['exif', 'geometry', 'sun_calc', 'visual', 'unknown'] };
export const REPORT_SCHEMA = object({
  schema_version: { type: 'integer', enum: [1] }, request_id: string,
  title: string, place_name: string, region: string, summary: string,
  lat: nullableNumber, lon: nullableNumber, radius_m: nullableNumber, heading: nullableNumber,
  coordinate_type: { type:'string', enum:['camera','camera_estimate','landmark','region','unknown'] },
  hfov: nullableNumber, radius_basis:string, heading_basis:string,
  confidence_levels: object(Object.fromEntries(['city','area','road','camera'].map(k=>[k,object({level:{type:'string',enum:['high','medium','low','unrated']},reason:string})]))),
  verification: object(Object.fromEntries(['street_view','image_match','geometry'].map(k=>[k,object({status:{type:'string',enum:['verified','attempted','blocked','not_applicable','not_attempted']},summary:string,files:array(string)})]))),
  evidence_spec: string,
  confidence: { type: 'string', enum: ['high', 'medium', 'low', 'unrated'] },
  optics: object({
    camera: string, lens_model: string, focal_mm: nullableNumber, focal_35mm: nullableNumber, digital_zoom: nullableNumber,
    f_number: nullableNumber, exposure_time: nullableNumber, shutter: string, iso: nullableNumber, exposure_bias: nullableNumber,
    aspect_ratio: string, orientation: { type: 'string', enum: ['portrait', 'landscape', 'square', 'unknown'] },
    image_size: { anyOf: [{ type: 'array', items: { type: 'integer' }, minItems: 2, maxItems: 2 }, { type: 'null' }] },
    vfov: nullableNumber, source: sourceEnum, note: string,
  }),
  camera_pov: object({
    viewpoint_level: { type: 'string', enum: ['low', 'eye_level', 'elevated', 'aerial', 'unknown'] },
    viewpoint_label: string, pitch_deg: nullableNumber, roll_deg: nullableNumber,
    elevation_m: nullableNumber, elevation_source: sourceEnum, height_agl_m: nullableNumber,
    target_distance_m: nullableNumber, distance_basis: string, slope_note: string, source: sourceEnum,
  }),
  lighting: object({
    captured_at: string, capture_time_source: sourceEnum, sun_azimuth: nullableNumber, sun_elevation: nullableNumber,
    light_type: string, plan_date: string, tz_offset_min: nullableNumber,
    sunrise: string, sunset: string, golden_morning: string, golden_evening: string, blue_evening: string,
    recommended_window: string, source: sourceEnum,
  }),
  composition: string, best_time: string, access: string, lens: string,
  clues: array(object({ title: string, description: string })),
  evidence: array(object({ name: string, file: string, description: string })),
  alternatives: array(object({ name: string, reason: string })),
  caveats: array(string), sources: array(object({ title: string, url: string })),
});
export function codexArgs(directory, reference, schema, result, runtimeDirectory, model=FRAME_MODEL) {
  return ['exec', '--model', validateModel(model), '-c', 'model_reasoning_effort="high"', '--json', '--cd', directory, '--image', reference,
    '--sandbox', 'workspace-write', '--skip-git-repo-check',
    '-c', 'sandbox_workspace_write.network_access=true',
    ...(runtimeDirectory ? ['--add-dir', runtimeDirectory] : []),
    '--output-schema', schema, '--output-last-message', result, '-'];
}
export function executedTools(item){
  if(item?.type!=='command_execution'||item.exit_code!==0||/Traceback \(most recent call last\)|Failed to spawn:|UnicodeDecodeError/.test(item.aggregated_output||''))return [];
  if(/--help\b/.test(item.command||''))return [];
  const receipts=[...(item.aggregated_output||'').matchAll(/FRAME_TOOL_RESULT (\{[^\r\n]+\})/g)].flatMap(m=>{try{const r=JSON.parse(m[1]);return r.ok&&r.exit_code===0&&!r.args.includes('--help')?[r.tool]:[];}catch{return [];}});
  return [...receipts,...(item.command||'').matchAll(/\buv(?:\.exe)?\s+run\s+(?:"[^"\r\n]*?|'[^'\r\n]*?|[^\s;]*?)([a-z_]+\.py)(?=['"\s;]|$)/g)].map(x=>typeof x==='string'?x:x[1]);
}
// Expose public updates and tool lifecycle events only, never reasoning items.
export function describeEvent(event) {
  const item = event.item || {};
  if (event.type === 'thread.started') return { kind: 'system', message: 'Codex 조사 세션을 연결했습니다.' };
  if (event.type === 'turn.started') return { kind: 'system', message: '사진과 의뢰 내용을 읽고 있습니다.' };
  if (item.type === 'agent_message' && event.type === 'item.completed') {
    if (item.text?.trim().startsWith('{')) return null;
    return { kind: 'message', message: item.text || '' };
  }
  if (event.type === 'item.started' && ['command_execution', 'mcp_tool_call', 'web_search'].includes(item.type)) {
    const tool = item.type === 'command_execution' ? (item.command || '').match(/run_tool\.py["']?\s+([a-z_]+\.py)/i)?.[1] || (item.command || '').match(/\buv(?:\.exe)?\s+run\s+(?:"[^"\r\n]*?|'[^'\r\n]*?|[^\s;]*?)([a-z_]+\.py)(?=['"\s;]|$)/i)?.[1] : null;
    const messages = {
      'doctor.py': '조사 도구와 실행 환경을 점검하고 있습니다.',
      'intake.py': '사진 메타데이터·문자·유사 이미지를 조사하고 있습니다.',
      'exif.py': '사진의 EXIF 화각·노출·촬영시각 메타데이터를 읽고 있습니다.',
      'ocr.py': '사진 속 간판·표지판 문자를 판독하고 있습니다.',
      'board.py': '장소 후보와 근거를 정리하고 있습니다.',
      'tiles.py': '지도·위성 자료를 조회하고 있습니다.',
      'poi.py': '장소 후보의 위치를 조회하고 있습니다.',
      'geo.py': '후보점의 방위각과 피사체 거리를 계산하고 있습니다.',
      'pose.py': '카메라 시점·피치·시야각을 기하학적으로 검증하고 있습니다.',
      'sun.py': '촬영 시각과 태양 방위·고도를 계산하고 있습니다.',
      'terrain.py': '지형 고도와 산 능선을 대조하고 있습니다.',
      'gsv.py': '거리 사진과 촬영 위치를 대조하고 있습니다.',
      'match.py': '후보 이미지와 원본 사진의 특징을 비교하고 있습니다.',
      'evidence.py': '확인한 자료로 근거 이미지를 만들고 있습니다.',
    };
    return { kind: 'tool', message: messages[tool] || (item.type === 'web_search' ? '웹 자료에서 장소 단서를 확인하고 있습니다.' : item.type === 'mcp_tool_call' ? '연결된 조사 도구를 실행하고 있습니다.' : '조사 명령을 실행하고 있습니다.'), tool: tool || item.type };
  }
  if (event.type === 'item.completed') return commandProblem(item);
  return null;
}
export function friendlyError(text) {
  return classifyError(text).message;
}
