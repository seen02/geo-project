import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { JobStore } from './lib/jobs.mjs';
const base = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(base, 'dist');
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json; charset=utf-8' };
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff' }); res.end(JSON.stringify(body)); };
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw { status:415, message:'JSON 요청이 필요합니다.' };
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if(size > 40*1024*1024) throw { status:413,message:'요청 파일이 너무 큽니다.' }; chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw { status:400,message:'올바른 JSON이 아닙니다.' }; }
}
export async function createApp(options = {}) {
  const store = options.store || new JobStore(path.resolve(process.env.FRAME_DATA_DIR || path.join(base,'.local-data')));
  await store.init(); const streams = new Set();
  const server = http.createServer(async (req,res) => {
    try {
      const host = req.headers.host || '';
      if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) return json(res,403,{error:'localhost에서만 접근할 수 있습니다.'});
      if (req.headers.origin && req.headers.origin !== `http://${host}`) return json(res,403,{error:'같은 로컬 주소에서 요청해 주세요.'});
      const url = new URL(req.url, `http://${host}`), pathname = decodeURIComponent(url.pathname);
      if (pathname === '/api/health' && req.method === 'GET') return json(res,200,await store.health());
      if (pathname === '/api/requests') {
        if (req.method === 'GET') return json(res,200,store.list());
        if (req.method === 'POST') return json(res,201,await store.create(await body(req)));
      }
      const match = /^\/api\/requests\/([^/]+)(?:\/(.*))?$/.exec(pathname);
      if (match) {
        const [,id,action] = match;
        if (!action && req.method === 'PUT') return json(res,200,await store.save(id,await body(req)));
        const record = store.get(id);
        if (!action && req.method === 'GET') return json(res,200,record);
        if (!action && req.method === 'DELETE') { await store.delete(id); return json(res,200,{ok:true}); }
        if (action === 'cancel' && req.method === 'POST') return json(res,200,await store.cancel(id));
        if (action === 'retry' && req.method === 'POST') { if(record.isSample) throw {status:400,message:'새 의뢰로 시작해 주세요.'}; const input=req.headers['content-type']?.startsWith('application/json')?await body(req):{};await store.enqueue(record,input.model??record.model); return json(res,202,record); }
        if (action === 'resume' && req.method === 'POST') { if(record.isSample) throw {status:400,message:'새 의뢰로 시작해 주세요.'}; const input=await body(req);await store.enqueue(record,input.model??record.model,true);return json(res,202,record); }
        if (action === 'events' && req.method === 'GET') {
          res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
          res.write('retry: 1500\n\n');
          const send = snapshot => res.write(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);
          send(store.snapshot(record)); store.on(id,send); streams.add(res);
          const heartbeat = setInterval(() => res.write(': keepalive\n\n'),15000);
          res.on('close',() => { clearInterval(heartbeat); store.off(id,send); streams.delete(res); }); return;
        }
        if (action?.startsWith('files/') && req.method === 'GET') {
          const relative = action.slice(6);
          if (!record.report?.evidence.some(x => x.file === relative) && record.report?.map_image?.file!==relative) throw { status:404,message:'근거 파일을 찾을 수 없습니다.' };
          const target = await store.artifactPath(record,relative);
          res.writeHead(200,{'Content-Type':mime[path.extname(target).toLowerCase()] || 'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'private, max-age=60'});res.end(await readFile(target));return;
        }
      }
      if (pathname.startsWith('/api/')) return json(res,404,{error:'API를 찾을 수 없습니다.'});
      if (req.method !== 'GET' && req.method !== 'HEAD') return json(res,405,{error:'지원하지 않는 요청입니다.'});
      const target = path.resolve(root,'.'+(pathname === '/'?'/index.html':pathname));
      if (!target.startsWith(root+path.sep)) return json(res,403,{error:'접근할 수 없는 경로입니다.'});
      const file = (await stat(target)).isDirectory()?path.join(target,'index.html'):target;
      res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
      res.end(req.method === 'HEAD'?undefined:await readFile(file));
    } catch(error) { if(!res.headersSent) json(res,error.status || (error.code === 'ENOENT'?404:500),{error:error.message || '요청을 처리하지 못했습니다.'}); else res.end(); }
  });
  return { server, store, close:async () => { await store.close(); for(const res of streams)res.end(); await new Promise(resolve => { server.close(resolve); server.closeIdleConnections(); }); } };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = await createApp(); const port = Number(process.env.PORT || 4173);
  app.server.listen(port,'127.0.0.1',() => console.log(`FRAME Local: http://localhost:${port}\nCodex CLI + geo-sleuth · 실시간 조사\n종료: Ctrl+C`));
  app.server.on('error',error => { console.error(error.code === 'EADDRINUSE'?`포트 ${port}가 사용 중입니다. PORT를 변경해 주세요.`:error); process.exitCode=1; });
  let stopping=false;
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async () => { if(stopping)return; stopping=true; await app.close(); process.exit(0); });
}
