"""No external requests. Test adapter failures against a local HTTP fixture."""
import unittest, sys, tempfile, threading, subprocess, json
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'/'python'))
import frame_https

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args):pass
    def do_GET(self):
        self.send_response(403 if self.path=='/denied' else 200);self.end_headers()
        if self.path!='/empty':self.wfile.write(b'<html>challenge</html>' if self.path=='/image' else b'{"ok":true}')
    def do_POST(self):
        body=self.rfile.read(int(self.headers['Content-Length']))
        self.send_response(200);self.end_headers();self.wfile.write(body)

class TransportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.url='http://127.0.0.1:'+str(cls.server.server_port)
    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close()
    def call(self,*args):return frame_https.run(['curl','-sS','--noproxy','*',*args],capture_output=True)
    def test_bytes_and_http_code(self):
        r=self.call('-w','\n%{http_code}',self.url+'/json')
        self.assertEqual(r.returncode,0);self.assertEqual(r.stdout,b'{"ok":true}\n200')
    def test_post_and_urlencode(self):
        r=self.call('-X','POST','--data-urlencode','data=가 & 나',self.url+'/post')
        self.assertIn(b'%EA%B0%80',r.stdout);self.assertIn(b'%26',r.stdout)
    def test_http_refusal_is_not_missing_data_and_preserves_existing_file(self):
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'body.json';file.write_text('original')
            r=self.call('-o',str(file),self.url+'/denied')
            self.assertEqual(r.returncode,22);self.assertIn(b'HTTP 403',r.stderr);self.assertEqual(file.read_text(),'original')
    def test_empty_reply_rejected(self):
        r=self.call(self.url+'/empty');self.assertNotEqual(r.returncode,0);self.assertIn(b'INVALID_ASSET',r.stderr)
    def test_html_image_never_saved(self):
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'tile.jpg';r=self.call('-o',str(file),self.url+'/image')
            self.assertEqual(r.returncode,65);self.assertFalse(file.exists())
    def test_tls_bypass_flag_rejected(self):
        with self.assertRaisesRegex(ValueError,'unsupported curl flag'):self.call('-k',self.url+'/json')
    def test_non_curl_subprocess_unchanged(self):
        r=frame_https.run([sys.executable,'-c','print(7)'],capture_output=True,text=True)
        self.assertEqual(r.stdout.strip(),'7')

if __name__=='__main__':unittest.main()
