"""Demo copy (/demo/): works with no server, web lesson for 10 «А», journal, simulated live lesson.
Run: cd test && python3 demo_test.py"""
import functools, http.server, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fails = []
def check(name, cond):
    if not cond: fails.append(name)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def main():
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = b.new_context(viewport={"width": 1440, "height": 1000})
        outside = []
        ctx.route("https://api.alaqai.online/**", lambda r: (outside.append(r.request.url), r.abort()))
        pg = ctx.new_page(); errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        # real lessons of this browser must stay untouched
        pg.goto(base + "/app/index.html#/home"); pg.evaluate("localStorage.setItem('alaqai:v1:lessons', JSON.stringify([{id:'real', topic:'Менің нақты сабағым'}]))")
        pg.wait_for_timeout(300); outside.clear()
        pg.goto(base + "/demo/"); pg.wait_for_selector("[data-demo-bar]"); pg.wait_for_selector(".side .nav")
        check("no sign-in page in demo", "#/login" not in pg.url)
        check("?demo=1 removed from the address", "demo=1" not in pg.url)
        check("banner says data is made up", "ойдан алынған" in pg.inner_text("[data-demo-bar]"))
        check("demo teacher shown", "Демо мұғалім" in pg.inner_text(".side"))
        pg.goto(base + "/app/index.html#/lessons"); pg.wait_for_selector(".list-row")
        txt = pg.inner_text("main")
        check("ready CSS lesson listed", "CSS: селекторлар және стильдер" in txt)
        check("past web lessons listed", "HTML кестелері" in txt and "HTML құжатының құрылымы" in txt)
        check("real lesson not shown in demo", "Менің нақты сабағым" not in txt)
        pg.goto(base + "/app/index.html#/lesson/dl5"); pg.wait_for_timeout(1500)
        check("lesson page opens with slides", pg.locator("iframe").count() >= 1)
        pg.screenshot(path="/tmp/shots/demo-lesson.png")
        pg.goto(base + "/app/index.html#/journal"); pg.wait_for_selector("[data-journal]")
        check("journal: 14 students", pg.locator("[data-row]").count() == 14)
        check("journal: 5 lesson columns", pg.locator("[data-journal] thead th").count() == 5 + 3)
        check("journal: hand-entered notebook points marked", pg.locator(".jr-hand").count() > 0)
        pg.screenshot(path="/tmp/shots/demo-journal.png", full_page=True)
        pg.goto(base + "/app/index.html#/growth"); pg.wait_for_selector("[data-chart] circle")
        check("growth has history", pg.locator("[data-chart] circle").count() >= 3)
        # simulated live lesson
        n0 = pg.evaluate("JSON.parse(localStorage.getItem('alaqai:demo:attempts')).length")
        pg.goto(base + "/app/index.html#/live/dl5"); pg.wait_for_selector("[data-card]")
        check("live: code shown", "482 615" in pg.inner_text("[data-code]"))
        pg.wait_for_timeout(16000)
        statuses = pg.eval_on_selector_all("[data-card]", "els => els.map(e => e.dataset.status)")
        check("live: students joined: " + str(statuses), statuses.count("off") <= 2)
        check("live: someone asked for help or finished", "help" in statuses or "done" in statuses)
        check("live: levels hidden by default", pg.locator("[data-lvtag]").count() == 0)
        pg.screenshot(path="/tmp/shots/demo-live.png")
        pg.wait_for_timeout(12000)
        n1 = pg.evaluate("JSON.parse(localStorage.getItem('alaqai:demo:attempts')).length")
        check(f"live answers saved as attempts ({n0}→{n1})", n1 > n0)
        pg.click("[data-end]"); pg.click(".modal [type=submit]"); pg.wait_for_timeout(800)
        pg.goto(base + "/app/index.html#/journal"); pg.wait_for_selector("[data-journal]")
        check("journal shows today's CSS lesson points", any(c.strip() not in ("·", "") for c in pg.eval_on_selector_all("[data-cell$='|dl5']", "els => els.map(e => e.innerText)")))
        # AI is off, with a clear message
        pg.goto(base + "/app/index.html#/new"); pg.wait_for_timeout(500)
        msg = pg.evaluate("fetch(window.ALAQAI_API_BASE + '/api/ai/generate', {method:'POST', body:'{}'}).then(r => r.json()).then(d => d.message)")
        check("AI off in demo with message", "Демо" in (msg or ""))
        # leaving the demo
        pg.goto(base + "/app/index.html#/home"); pg.wait_for_selector("[data-demo-exit]")
        in_demo = list(outside)
        pg.click("[data-demo-exit]"); pg.wait_for_load_state()
        left = pg.evaluate("Object.keys(localStorage).filter(k => k.startsWith('alaqai:demo:')).length")
        check("demo data removed on exit", left == 0)
        check("real lessons kept", "Менің нақты сабағым" in (pg.evaluate("localStorage.getItem('alaqai:v1:lessons')") or ""))
        check("demo off after exit", pg.evaluate("sessionStorage.getItem('alaqai_demo')") is None)
        check("no calls to the real server in demo: " + str(in_demo[:3]), not in_demo)
        check("no page errors: " + "; ".join(errors), not errors)
        b.close()
    srv.shutdown()
    if fails:
        print("FAIL:", *fails, sep="\n  "); sys.exit(1)
    print("PASS: demo copy")

if __name__ == "__main__":
    main()
