import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root='C:/Users/admin/img2place_project';
const skill='C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
process.env.RUNTIME_NODE_MODULES='C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const finalPath=path.join(root,'output/geo_sleuth_처리과정_입출력_테스트_발전방향_최종.pptx');
const result=await finalizePresentation({
 workspaceDir:root,
 candidatePath:path.join(root,'ppt_build_20261029/candidate.pptx'),
 finalPath,
 pythonExecutable:'C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...[4,6,8,9,15,17,19,21,23,24,25,26,27,28].flatMap(n=>['--require-native-table-slide',String(n)])],
 explicitTotalSlideCount:28,
 requiredNativeTableOwnerSlides:[4,6,8,9,15,17,19,21,23,24,25,26,27,28],
 requiredNativeChartOwnerSlides:[],
 fontPolicy:{basis:'user_request',families:['Pretendard']},
 verifyArtifactToolImport:true,
 receiptPath:path.join(root,'ppt_build_20261029/final-validation-v2.json')
});
console.log(JSON.stringify(result,null,2));
