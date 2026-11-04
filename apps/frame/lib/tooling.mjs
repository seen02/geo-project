import {readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {command} from './runtime.mjs';

export async function prepareCatalog(directory,config){
  const names=(await readdir(path.join(config.skill,'scripts'))).filter(n=>/^[a-z][a-z0-9_]*\.py$/.test(n)&&!n.startsWith('_')).sort();
  const tools=Object.fromEntries(names.map(n=>[n,path.join(config.skill,'scripts',n)]));
  const runner=path.join(config.helpers,'run_tool.py');
  await writeFile(path.join(directory,'tools.json'),JSON.stringify({uv:config.uv,runner,tools},null,2));
  await writeFile(path.join(directory,'TOOL_GUIDE.md'),`# Installed tools\n\nUse this guarded launcher, one tool per command:\n\npython "${runner}" <tool.py> --help\n\nDo not guess script names, use curl.exe directly, or put multiline Python inside a PowerShell -c string. Write a UTF-8 .py file instead.\n\n${names.join('\n')}\n\nPython HTTPS adapter: certificate validation ON; GEO_PROXY is respected; TLS failures do not prove that imagery is absent. Only listed tools are accepted by this launcher.\n`);
  return names;
}

export async function probeNetwork(config,directory){
  // Uses the same Windows sandbox class and enabled command networking as exec.
  // The native curl probe intentionally bypasses our adapter for comparison.
  const args=['-c','permissions.frame_probe.extends=":workspace"','-c','permissions.frame_probe.network.enabled=true','sandbox','--permission-profile','frame_probe','--include-managed-config','--cd',directory,'--',config.python,'-X','utf8',path.join(config.helpers,'network_probe.py')];
  const result=await command(config.codex,args,{env:{...config.env,FRAME_PYTHON_HTTPS:'0',PYTHONDONTWRITEBYTECODE:'1'},cwd:directory,timeoutMs:35000});
  try{
    const payload=JSON.parse(result.output.split('\n').find(line=>line.startsWith('{"ssl"'))||'');
    return {...payload,checkedAt:new Date().toISOString(),transport:'Python HTTPS',ready:payload.results.some(x=>x.python.ok&&x.python.status>=200&&x.python.status<400)};
  }catch{return {ready:false,checkedAt:new Date().toISOString(),error:result.output.slice(-1000),results:[]};}
}
