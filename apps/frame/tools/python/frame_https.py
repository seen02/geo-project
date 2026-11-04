"""The curl subset used by installed geo-sleuth scripts, using verified Python HTTPS.

No shell, global config changes, certificate bypass or silent native-curl fallback.
Unsupported flags fail clearly. Browsers and model libraries keep their own clients.
"""
import os, sys, ssl, json, socket, subprocess, urllib.request, urllib.parse, urllib.error
from pathlib import Path
from tempfile import NamedTemporaryFile

ORIGINAL_RUN = subprocess.run
MAX_BYTES = 64 * 1024 * 1024

def transfer(args):
    headers={}; method=None; data=None; output=None; fmt=""; timeout=30; proxy=None; direct=False; url=None
    i=1
    while i<len(args):
        arg=str(args[i]);i+=1
        if arg in ("-q","-s","-sS","-sSL","-fsSL","-fsS","-L","-f","--silent","--fail","--location"):continue
        if arg in ("-m","--max-time","-o","--output","-w","--write-out","-A","--user-agent","-H","--header","-X","--request","--data","-d","--data-raw","--data-urlencode","--proxy","--noproxy"):
            if i>=len(args):raise ValueError("missing curl flag value")
            value=str(args[i]);i+=1
            if arg in ("-m","--max-time"):timeout=min(float(value),180)
            elif arg in ("-o","--output"):output=value
            elif arg in ("-w","--write-out"):fmt=value
            elif arg in ("-A","--user-agent"):headers['User-Agent']=value
            elif arg in ("-H","--header"):
                key,sep,val=value.partition(':')
                if not sep:raise ValueError('invalid header')
                headers[key.strip()]=val.strip()
            elif arg in ("-X","--request"):method=value
            elif arg=="--proxy":proxy=value
            elif arg=="--noproxy":direct=value=='*'
            elif arg=="--data-urlencode":
                key,sep,val=value.partition('=')
                data=urllib.parse.urlencode({key:val}).encode() if sep else urllib.parse.quote(value).encode()
            else:
                if value.startswith('@'):raise ValueError('file uploads require an explicit dedicated tool')
                data=value.encode('utf-8')
        elif arg.startswith('-'):raise ValueError('unsupported curl flag: '+arg)
        elif url is not None:raise ValueError('one URL per transfer is required')
        else:url=arg
    if not url or urllib.parse.urlsplit(url).scheme not in ('https','http'):raise ValueError('HTTP(S) URL required')
    if fmt.replace('%{http_code}','').replace('\\n','').strip():raise ValueError('unsupported curl write-out format')
    proxy_map={} if direct else ({'http':proxy,'https':proxy} if proxy else urllib.request.getproxies())
    opener=urllib.request.build_opener(urllib.request.ProxyHandler(proxy_map),urllib.request.HTTPSHandler(context=ssl.create_default_context()))
    request=urllib.request.Request(url,data=data,headers=headers,method=method)
    status=0;body=b'';err='';code=0
    try:
        with opener.open(request,timeout=timeout) as response:
            status=response.status;body=response.read(MAX_BYTES+1)
            if len(body)>MAX_BYTES:raise ValueError('response exceeds 64 MiB')
            if not body and method!='HEAD':raise ValueError('INVALID_ASSET: empty HTTP response')
    except urllib.error.HTTPError as exc:status=exc.code;code=22;err=f'HTTP {status}'
    except (TimeoutError,socket.timeout):code=28;err='network timeout'
    except urllib.error.URLError as exc:
        code=60 if isinstance(exc.reason,ssl.SSLError) else 7;err=f'HTTPS connection failed: {exc.reason}'
    except Exception as exc:code=2;err=str(exc)
    if output and code==0:
        if os.path.normcase(output)!=os.path.normcase(os.devnull):
            destination=Path(output)
            if destination.suffix.lower() in ('.jpg','.jpeg','.png','.webp'):
                try:
                    from PIL import Image
                    from io import BytesIO
                    with Image.open(BytesIO(body)) as im:im.verify()
                    with Image.open(BytesIO(body)) as im:im.load()
                except ImportError:
                    if not body.startswith((b'\xff\xd8',b'\x89PNG',b'RIFF')):return 65,b'',b'FRAME_HTTP INVALID_ASSET: image signature missing\n'
                except Exception:return 65,b'',b'FRAME_HTTP INVALID_ASSET: image decode failed\n'
            # Replace only after a complete successful response; never leave a partial tile.
            with NamedTemporaryFile(dir=destination.parent,delete=False) as stream:
                temp=Path(stream.name);stream.write(body)
            try:os.replace(temp,destination)
            finally:temp.unlink(missing_ok=True)
        body=b''
    trailer=fmt.replace('\\n','\n').replace('%{http_code}',str(status).zfill(3)).encode()
    return code,body+trailer,(f'FRAME_HTTP {err}\n'.encode('utf-8') if err else b'')

def run(args,*pos,**kwargs):
    if not isinstance(args,(list,tuple)) or Path(str(args[0])).name.lower() not in ('curl','curl.exe') or '--version' in args:
        return ORIGINAL_RUN(args,*pos,**kwargs)
    if pos or kwargs.get('shell') or kwargs.get('input') is not None:raise ValueError('unsupported curl invocation')
    code,out,err=transfer(args)
    text=kwargs.get('text') or kwargs.get('universal_newlines') or kwargs.get('encoding')
    if text:
        encoding=kwargs.get('encoding') or 'utf-8';errors=kwargs.get('errors') or 'strict'
        out=out.decode(encoding,errors);err=err.decode(encoding,errors)
    def emit(value,stream,default):
        if stream==subprocess.DEVNULL:return None
        if stream==subprocess.PIPE:return value
        target=stream or default
        if isinstance(value,bytes):target=getattr(target,'buffer',target)
        target.write(value);target.flush();return None
    capture=kwargs.get('capture_output',False)
    stdout=emit(out,subprocess.PIPE if capture else kwargs.get('stdout'),sys.stdout)
    stderr=emit(err,subprocess.PIPE if capture else kwargs.get('stderr'),sys.stderr)
    result=subprocess.CompletedProcess(args,code,stdout,stderr)
    if code and kwargs.get('check'):raise subprocess.CalledProcessError(code,args,stdout,stderr)
    return result

def install():subprocess.run=run
