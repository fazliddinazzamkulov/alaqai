"""Starts alaqai.back/scripts/dev-live.js (demo teacher, class, lesson opened live)
and serves this repo. Set ALAQAI_BACK if the backend is not a sibling folder."""
import functools, http.server, json, os, socketserver, subprocess, threading, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACK = os.environ.get("ALAQAI_BACK", os.path.join(os.path.dirname(ROOT), "alaqai.back"))

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

class Live:
    def __enter__(self):
        self.proc = subprocess.Popen(["node", "--no-warnings=ExperimentalWarning", "scripts/dev-live.js"], cwd=BACK, stdout=subprocess.PIPE, text=True)
        info = json.loads(self.proc.stdout.readline())
        self.api = f"http://127.0.0.1:{info['port']}"; self.code = info["code"]; self.cookie = info["cookie"]; self.lesson = info["lessonId"]
        self.web = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
        threading.Thread(target=self.web.serve_forever, daemon=True).start()
        self.base = f"http://127.0.0.1:{self.web.server_address[1]}"
        return self
    def teacher(self, method, path, body=None):
        req = urllib.request.Request(self.api + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                     headers={"Content-Type": "application/json", "Cookie": self.cookie})
        with urllib.request.urlopen(req) as r: return json.loads(r.read())
    def __exit__(self, *a):
        self.web.shutdown(); self.proc.terminate(); self.proc.wait(5)
