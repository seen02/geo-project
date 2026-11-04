"""Job-local Windows Schannel workaround: curl HTTP via Python OpenSSL urllib."""
import subprocess, urllib.request, pathlib
_run = subprocess.run
def _openssl_run(args, *a, **kw):
    if isinstance(args, list) and args and str(args[0]).lower() in ('curl','curl.exe'):
        try:
            url = next(x for x in args[1:] if str(x).startswith(('https://','http://')))
            headers = {}
            for i, x in enumerate(args):
                if x == '-H':
                    k,v=args[i+1].split(':',1); headers[k]=v.strip()
                if x == '-A': headers['User-Agent']=args[i+1]
            data = None
            for flag in ('--data','--data-raw','--data-binary','-d'):
                if flag in args: data=args[args.index(flag)+1].encode()
            req=urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=60) as r: body=r.read()
            if '-o' in args:
                pathlib.Path(args[args.index('-o')+1]).write_bytes(body); body=b''
            return subprocess.CompletedProcess(args,0,stdout=body,stderr=b'')
        except Exception as e:
            return subprocess.CompletedProcess(args,1,stdout=b'',stderr=str(e).encode())
    return _run(args,*a,**kw)
subprocess.run=_openssl_run
