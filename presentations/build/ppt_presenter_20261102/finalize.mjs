import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root='C:/Users/admin/img2place_project';
const b=path.join(root,'ppt_presenter_20261102');
const skill='C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1026.10807/skills/presentations';
process.env.RUNTIME_NODE_MODULES='C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const owners=[7,14,16,20,21,22,23,24,25,27,28,29,30,31,32];
const ref=path.join(b,'source.pptx');
const r=await finalizePresentation({workspaceDir:root,candidatePath:path.join(b,'candidate.pptx'),finalPath:path.join(root,'output/geo-slueth_소개_과정설명_발표용_최종본.pptx'),
 pythonExecutable:'C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...owners.flatMap(n=>['--require-native-table-slide',String(n)])],
 explicitTotalSlideCount:32,requiredNativeTableOwnerSlides:owners,requiredNativeChartOwnerSlides:[],
 fontPolicy:{basis:'reference',families:['Pretendard'],referencePath:ref,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(ref)).digest('hex')},
 verifyArtifactToolImport:true,receiptPath:path.join(b,'validation_final.json')});
console.log(JSON.stringify({final:r.finalPath,integrity:r.packageIntegrity.status,layoutFindings:r.presentationLayout.finding_count,sha256:r.finalSha256}));
