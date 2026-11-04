import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root='C:/Users/admin/img2place_project';
const build=path.join(root,'ppt_rebuild_20261029');
const skill='C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const reference='C:/Users/admin/Desktop/발표 자료/통합_업무_비서_소개_기술설명_부록추가_최종.pptx';
process.env.RUNTIME_NODE_MODULES='C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const tableSlides=[7,14,18,20,21,23,24,25,26,27,28];
const result=await finalizePresentation({
 workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),
 finalPath:path.join(root,'output/geo-slueth_소개_테스트과정_활용가능성_재구성.pptx'),
 pythonExecutable:'C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...tableSlides.flatMap(v=>['--require-native-table-slide',String(v)])],
 explicitTotalSlideCount:28,requiredNativeTableOwnerSlides:tableSlides,requiredNativeChartOwnerSlides:[],
 fontPolicy:{basis:'reference',families:['Pretendard'],referencePath:reference,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(reference)).digest('hex')},
 verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')
});
console.log(JSON.stringify(result,null,2));
