"""Browser check of the slide player: every code template renders and checks answers.
Run: python3 test/player_test.py  (serves the repo on a free port, uses headless Chrome)."""
import http.server, socketserver, threading, functools, os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=ROOT)
    s = socketserver.TCPServer(("127.0.0.1", 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s

def main():
    srv = serve(); port = srv.server_address[1]
    fails = []
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": 1600, "height": 980})
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(f"http://127.0.0.1:{port}/app/slides/player.html?deck=../../test/fixtures/code-deck.json")
        pg.wait_for_function("document.querySelectorAll('#stage .slide').length === 5", timeout=8000)
        def check(name, cond):
            if not cond: fails.append(name)
        check("no unknown-template slides", pg.locator("#stage .slide .err").count() == 0)
        # every slide shows its title: nothing covers it
        covered = []
        for i in range(5):
            pg.evaluate(f"AlaqaiSlides.go({i})"); pg.wait_for_timeout(450)
            if not pg.evaluate("(()=>{const h=document.querySelector('#stage .slide.active .s-title');let n=h.nextElementSibling;while(n&&!n.offsetHeight)n=n.nextElementSibling;return !n||n.getBoundingClientRect().top>=h.getBoundingClientRect().bottom-1;})()"):
                covered.append(i)
        check(f"titles visible (covered: {covered})", not covered)
        pg.evaluate("AlaqaiSlides.go(0)"); pg.wait_for_timeout(450)
        # predict: correct answer
        s = pg.locator("#stage .slide").nth(0)
        s.locator(".pd-in").fill("9"); s.locator("[data-act=check]").click()
        check("predict marks 9 correct", "ok" in (s.locator(".g-status").get_attribute("class") or ""))
        # parsons: show answer puts lines in order
        pg.keyboard.press("ArrowRight"); pg.keyboard.press("ArrowRight")
        s = pg.locator("#stage .slide").nth(2)
        s.locator("[data-act=show]").click()
        txt = s.locator(".ord-item").all_inner_texts()
        check("parsons show orders lines", len(txt) == 3 and txt[0].strip().endswith("n = int(input())"))
        # steps: answering step 1 correctly reveals step 2 input
        pg.keyboard.press("ArrowRight")
        s = pg.locator("#stage .slide").nth(3)
        s.locator("input").first.fill("3"); s.locator("[data-act=check]").click()
        check("steps step1 ok", s.locator(".stp.ok").count() == 1)
        # error in code: rows use monospace
        pg.keyboard.press("ArrowRight")
        s = pg.locator("#stage .slide").nth(4)
        ff = s.locator(".er-row .tx").first.evaluate("e => getComputedStyle(e).fontFamily")
        check("error code rows monospace", "JetBrains" in ff or "monospace" in ff)
        tops = pg.evaluate("[...document.querySelectorAll('#stage .slide')].map(s=>s.scrollTop)")
        check(f"no slide scrolled inside {tops}", not any(tops))
        os.makedirs("/tmp/shots", exist_ok=True)
        for i in range(5):
            pg.evaluate(f"AlaqaiSlides.go({i})"); pg.wait_for_timeout(400)
            pg.screenshot(path=f"/tmp/shots/code-{i}.png")
        check("no page errors " + "; ".join(errors), not errors)
        # the 50-template demo deck still renders every slide
        pg2 = b.new_page(viewport={"width": 1600, "height": 980}); err2 = []
        pg2.on("pageerror", lambda e: err2.append(str(e)))
        pg2.goto(f"http://127.0.0.1:{port}/app/slides/player.html?deck=demo.json")
        pg2.wait_for_function("document.querySelectorAll('#stage .slide').length >= 50", timeout=8000)
        check("demo deck: no unknown templates", pg2.locator("#stage .slide .err").count() == 0)
        check("demo deck: no page errors " + "; ".join(err2), not err2)
        b.close()
    srv.shutdown()
    if fails:
        print("FAIL:", *fails, sep="\n  "); sys.exit(1)
    print("PASS: player code templates")

if __name__ == "__main__":
    main()
