import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root='C:/Users/admin/img2place_project',dir=path.join(root,'ppt_distance_visibility_20261104');
const skill='C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations';
const runtime='C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const inventory=JSON.parse(await fs.readFile(dir+'/source_inventory.json','utf8'));
const owners=inventory.filter(s=>s.elements.some(x=>x.kind==='table')).map(s=>s.index+1);
const reference=dir+'/source.pptx';
const result=await finalizePresentation({
 workspaceDir:root,candidatePath:dir+'/candidate.pptx',
 finalPath:root+'/output/geo-slueth_소개_사진자료_발표가독성_보완본.pptx',
 pythonExecutable:runtime+'/python/python.exe',
 integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',
 layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...owners.flatMap(n=>['--require-native-table-slide',String(n)])],
 explicitTotalSlideCount:36,requiredNativeTableOwnerSlides:owners,requiredNativeChartOwnerSlides:[],
 fontPolicy:{basis:'reference',families:['Pretendard'],referencePath:reference,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(reference)).digest('hex')},
 verifyArtifactToolImport:true,receiptPath:dir+'/validation.json'
});
console.log(JSON.stringify({final:result.finalPath,integrity:result.packageIntegrity?.status,layout:result.presentationLayout?.finding_count}));

