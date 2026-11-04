import test from 'node:test';
import assert from 'node:assert/strict';
import {codexArgs,executedTools} from '../lib/runtime.mjs';
import {normalizeReport} from '../dist/lib/domain.js';
import {overlay,researchDetails} from '../dist/lib/research-report.js';
import {researchPrompt} from '../lib/prompt.mjs';
import {classifyError,commandProblem} from '../lib/errors.mjs';
test('FRAME 실행은 선택 모델과 high을 명시하고 빠른 종료 지시를 제거한다',()=>{
 const args=codexArgs('job','photo','schema','final');assert.equal(args[args.indexOf('--model')+1],'gpt-6.1-sol');assert.ok(args.includes('model_reasoning_effort="high"'));
 const prompt=researchPrompt({id:'FR-TEST'},'photo','skill',15);assert.match(prompt,/DO NOT finish with its POI coordinate/);assert.match(prompt,/gsv.py/);assert.match(prompt,/match.py/);assert.match(prompt,/camera_estimate/);assert.doesNotMatch(prompt,/produce a useful first investigation in about 5 minutes/);
});

test('혼잡·사용량·TLS·없는 도구·잘못된 명령·자료 없음을 구별한다',()=>{
 for(const [text,code] of [['Selected model is at capacity.','capacity'],['usage limit reached','quota'],['curl exit 35 SEC_E_NO_CREDENTIALS','tls'],['WinError 10013','network_denied'],["can't open file net.py",'missing_tool'],['ParserError Missing argument','invalid_command'],['Search returned no images.','no_data'],['HTTP 403','http_denied']])assert.equal(classifyError(text).code,code);
 assert.equal(commandProblem({type:'command_execution',exit_code:0,aggregated_output:'Get-Content example: Traceback / network error'}),null);
 assert.equal(commandProblem({type:'command_execution',exit_code:1,aggregated_output:'SEC_E_NO_CREDENTIALS'}).code,'tls');
 assert.deepEqual(executedTools({type:'command_execution',exit_code:0,command:'python run_tool.py gsv.py render',aggregated_output:'FRAME_TOOL_RESULT {"tool":"gsv.py","ok":true,"exit_code":0,"args":["render"]}'}),['gsv.py']);
});
test('도구 설명 읽기·도움말·숨겨진 실패를 검증 성공으로 계산하지 않는다',()=>{
 const item={type:'command_execution',exit_code:0,aggregated_output:''};
 assert.deepEqual(executedTools({...item,command:"Get-Content 'C:\\skills\\gsv.py'"}),[]);
 assert.deepEqual(executedTools({...item,command:'uv run gsv.py --help'}),[]);
 assert.deepEqual(executedTools({...item,command:'uv run gsv.py render',aggregated_output:'Traceback (most recent call last)'}),[]);
 assert.deepEqual(executedTools({...item,command:"uv run 'C:\\skills\\gsv.py' render"}),['gsv.py']);
});
test('추정 촬영점·단계별 신뢰도·0도 방위를 보존하고 반경과 시야각을 따로 그린다',()=>{
 const r=normalizeReport({coordinate_type:'camera_estimate',lat:0,lon:0,radius_m:150,heading:0,hfov:67,radius_basis:'후보 분포',heading_basis:'랜드마크 투영',confidence_levels:{area:{level:'high',reason:'지역 일치'},camera:{level:'low',reason:'정확한 자리 미확정'}},map_image:{url:'/api/requests/FR-TEST/files/map.jpg',zoom:0,origin_tile:[0,0],size:[256,256]}});
 assert.equal(r.coordinate_type,'camera_estimate');assert.equal(r.heading,0);assert.equal(r.confidence_levels.camera.level,'low');
 const svg=overlay(r);assert.match(svg,/<circle/);assert.match(svg,/stroke-dasharray/);assert.match(svg,/부채꼴 시야각 67/);assert.match(svg,/방위각 0/);assert.match(researchDetails(r),/지역 일치/);
 assert.equal(overlay({...r,heading:null,hfov:null}).includes('부채꼴'),false);
 assert.throws(()=>normalizeReport({hfov:180}));
});

test('선택 가능한 3개 모델이 high 인자로 전달되고 임의 모델은 거부된다',()=>{
 for(const model of ['gpt-6.1-sol','gpt-6.1-terra','gpt-6-luna']){
  const args=codexArgs('job','photo','schema','final',undefined,model);
  assert.equal(args[args.indexOf('--model')+1],model);assert.ok(args.includes('model_reasoning_effort="high"'));
 }
 assert.throws(()=>codexArgs('job','photo','schema','final',undefined,'invalid-model'));
});
