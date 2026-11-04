"""No-photo HTTPS diagnostics; runs directly and inside the Codex sandbox."""
import json, ssl, subprocess, urllib.request, urllib.error, concurrent.futures, os

URLS={"satellite":"https://mt1.google.com/vt/lyrs=s&x=0&y=0&z=0","overpass":"https://overpass-api.de/api/status","models":"https://huggingface.co/"}
def probe(item):
    name,url=item; result={"service":name}
    try:
        proxy=os.environ.get('GEO_PROXY','').strip()
        proxies={'http':proxy,'https':proxy} if proxy and proxy.lower()!='direct' else {}
        opener=urllib.request.build_opener(urllib.request.ProxyHandler(proxies))
        with opener.open(urllib.request.Request(url,headers={'User-Agent':'geo-sleuth-doctor/1.0'}),timeout=10) as response:
            result["python"]={"ok":True,"status":response.status,"bytes":len(response.read(100000))}
    except urllib.error.HTTPError as error: result["python"]={"ok":True,"status":error.code,"note":"HTTP reached"}
    except Exception as error: result["python"]={"ok":False,"error":str(error)}
    try:
        r=subprocess.run(["curl.exe" if os.name=="nt" else "curl","-q","-sS","--max-time","10","--noproxy","" if proxies else "*",*(['--proxy',proxy] if proxies else []),"-A","geo-sleuth-doctor/1.0","-o",os.devnull,"-w","%{http_code}",url],capture_output=True,timeout=13)
        result["curl"]={"ok":r.returncode==0,"code":r.returncode,"status":r.stdout.decode(errors="replace"),"error":r.stderr.decode(errors="replace")[:500]}
    except Exception as error: result["curl"]={"ok":False,"error":str(error)}
    return result
if __name__=="__main__":
    with concurrent.futures.ThreadPoolExecutor(3) as pool: results=list(pool.map(probe,URLS.items()))
    print(json.dumps({"ssl":ssl.OPENSSL_VERSION,"results":results},ensure_ascii=True))
