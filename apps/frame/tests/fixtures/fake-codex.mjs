// Contract-test process only. The application never loads this fixture.
import {readFile,writeFile} from 'node:fs/promises';
const args=process.argv.slice(2), output=args[args.indexOf('--output-last-message')+1];
const request=JSON.parse(await readFile('request.json','utf8'));
const report=JSON.parse(await readFile('result.template.json','utf8'));
process.stdin.resume();
const send=event=>process.stdout.write(JSON.stringify(event)+'\n');
send({type:'thread.started',thread_id:'test-only'});
send({type:'item.completed',item:{type:'reasoning',text:'PRIVATE_REASONING_NOT_FOR_UI'}});
send({type:'item.started',item:{type:'command_execution',command:'uv run board.py rank'}});
await writeFile('progress.json',JSON.stringify({stage:'verifying',message:'테스트 자료 대조 중'}));
if(request.title==='hold')await writeFile('board.json',JSON.stringify({candidates:['checkpoint candidate']}));
if(request.title==='capacity-recover'||request.title==='capacity-always'){
 let counter=0;try{counter=Number(await readFile('counter.txt','utf8'));}catch{}
 await writeFile('counter.txt',String(counter+1));
 await writeFile('board.json',JSON.stringify({candidates:['public candidate']}));
 if(counter===0||request.title==='capacity-always'){
  send({type:'error',message:'Selected model is at capacity. Please try a different model.'});
  send({type:'turn.failed',error:{message:'Selected model is at capacity. Please try a different model.'}});process.exit(1);
 }
 if(args.includes('resume')){process.stderr.write('thread test-only not found');process.exit(1);}
}
await new Promise(resolve=>setTimeout(resolve,request.title==='hold'?1500:120));
if(request.title==='fail'){process.stderr.write('authentication failed');process.exit(1);}
report.place_name='계약 검증용 장소';report.summary='테스트 프로세스의 출력 계약 검증입니다.';
report.lat=37;report.lon=127;report.radius_m=300;report.confidence='medium';
report.coordinate_type='camera';
report.heading=61;report.hfov=67;report.radius_basis='계약 테스트 반경';report.heading_basis='계약 테스트 방향';
report.evidence_spec='evidence-spec.json';
for(const [key,tool] of Object.entries({street_view:'gsv.py',image_match:'match.py',geometry:'pose.py'})){
 report.verification[key]={status:'verified',summary:'계약 테스트 산출물',files:['evidence.png']};
 if(request.title!=='skip-verification')send({type:'item.completed',item:{type:'command_execution',command:'uv run '+tool+' render',exit_code:0,aggregated_output:'written'}});
}
await writeFile('evidence-spec.json',JSON.stringify({map:'evidence.png',camera:[37,127],heading:61,hfov:67,panels:[{image:'reference.png'},{image:'evidence.png'}]}));
await writeFile('evidence.json',JSON.stringify({zoom:0,origin_tile:[0,0],size:[1,1],failed_tiles:0}));
if(request.title==='bad-tiles')await writeFile('evidence.json',JSON.stringify({zoom:0,origin_tile:[0,0],size:[1,1],failed_tiles:1}));
if(request.title==='empty-json'){await writeFile('empty.json','');report.verification.street_view.files=['empty.json'];}
if(request.title==='landmark'){report.coordinate_type='landmark';report.radius_m=null;}
await writeFile('evidence.png',Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC','base64'));
if(request.title==='corrupt-image')await writeFile('evidence.png','<html>HTTP challenge instead of image</html>');
report.evidence=[{name:'계약 검증 이미지',file:'evidence.png',description:'테스트 픽셀'}];
report.sources=[{title:'테스트 출처',url:'https://example.com'}];
await writeFile(output,JSON.stringify(report));
send({type:'item.completed',item:{type:'agent_message',text:'자료 대조를 마쳤습니다.'}});
send({type:'turn.completed',usage:{input_tokens:1,output_tokens:1}});
process.exit(0);
