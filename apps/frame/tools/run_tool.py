"""Run only a tool in the job catalog; no shell interpolation. Public execution receipt."""
import json, os, sys, subprocess, time
from pathlib import Path
from uuid import uuid4

def main():
    catalog=json.loads(Path('tools.json').read_text(encoding='utf-8'))
    name=sys.argv[1] if len(sys.argv)>1 else ''
    if name not in catalog['tools']:
        print('UNKNOWN_TOOL: use TOOL_GUIDE.md; '+', '.join(catalog['tools']),file=sys.stderr);return 2
    args=sys.argv[2:];started=time.time()
    command=[catalog['uv'],'run',catalog['tools'][name],*args]
    child=subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    tail=b''
    while True:
        chunk=child.stdout.read1(8192)
        if not chunk:break
        sys.stdout.buffer.write(chunk);sys.stdout.buffer.flush();tail=(tail+chunk)[-200000:]
    code=child.wait();error=''
    # tiles.py can exit 0 after stitching a fully black, failed mosaic.
    if code==0 and name=='tiles.py' and args and args[0]=='fetch' and '--out' in args:
        try:
            target=Path(args[args.index('--out')+1]);meta=json.loads(target.with_suffix('.json').read_text(encoding='utf-8-sig'))
            if meta.get('failed_tiles',-1)!=0:error='INVALID_ASSET: failed satellite tiles; obtain a complete smaller mosaic'
        except Exception:error='INVALID_ASSET: missing or invalid satellite metadata'
    if code==0 and name=='gsv.py' and args and args[0]=='near':
        text=tail.decode('utf-8').strip()
        if text.startswith('no Google Street View panorama within '):error='NO_DATA: normal panorama response contains no panorama'
        else:
            try:
                if json.loads(text) is None:error='NO_DATA: normal panorama response contains no panorama'
            except Exception:error='INVALID_ASSET: panorama output is not valid JSON'
    if error:print(error,file=sys.stderr,flush=True);code=65
    receipt={'tool':name,'args':args,'ok':code==0,'exit_code':code,'started_at':started,'finished_at':time.time()}
    if error:receipt['error']=error
    if not receipt['ok'] and not error:receipt['error']='tool command failed; inspect preceding output'
    folder=Path('.tool-receipts');folder.mkdir(exist_ok=True)
    (folder/(str(time.time_ns())+'-'+uuid4().hex+'.json')).write_text(json.dumps(receipt),encoding='utf-8')
    print('FRAME_TOOL_RESULT '+json.dumps(receipt),flush=True)
    return code

if __name__=='__main__':sys.exit(main())
