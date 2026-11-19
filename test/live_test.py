"""Teacher live-lesson screen against the real API (demo data). Run: cd test && python3 live_test.py"""
import json, sys, urllib.request
from playwright.sync_api import sync_playwright
from live_server import Live

fails = []
def check(name, cond):
    if not cond: fails.append(name)

def student(L, path, body=None):
    req = urllib.request.Request(L.api + "/api/live/" + path, method="POST" if body is not None else "GET",
                                 data=None if body is None else json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r: return json.loads(r.read())

def main():
    with Live() as L, sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = b.new_context(viewport={"width": 1440, "height": 1000})
        name, value = L.cookie.split("=", 1)
        ctx.add_cookies([{"name": name, "value": value, "url": L.api}])
        ctx.add_init_script(f"localStorage.setItem('alaqai_api', '{L.api}')")
        ctx.route("https://fonts.googleapis.com/**", lambda r: r.abort())
        pg = ctx.new_page(); errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(L.base + "/app/index.html#/live/L1")
        pg.wait_for_selector("[data-code]")
        check("same code as the open lesson", pg.inner_text("[data-code]").replace(" ", "") == L.code)
        check("QR drawn", pg.locator("[data-qr] svg, [data-qr] img").count() == 1)
        pg.wait_for_selector("[data-card]")
        check("4 student cards, all off", pg.locator("[data-card]").count() == 4 and pg.locator("[data-card][data-status=off]").count() == 4)
        tok = student(L, f"{L.code}/join", {"studentId": "s1", "device": "t1"})["token"]
        student(L, f"{L.code}/answer", {"token": tok, "method": "steps", "template": "steps", "correct": 1, "total": 1})
        pg.wait_for_selector("[data-card=s1][data-status=done]", timeout=6000)
        tok3 = student(L, f"{L.code}/join", {"studentId": "s3", "device": "t3"})["token"]
        student(L, f"{L.code}/help", {"token": tok3})
        pg.wait_for_selector("[data-card=s3][data-status=help]", timeout=6000)
        check("help counter", pg.inner_text("[data-stat=help]").strip().startswith("1"))
        pg.screenshot(path="/tmp/shots/live.png", full_page=True)
        # screen break
        pg.click("[data-break-start]")
        pg.wait_for_timeout(500)
        board = L.teacher("GET", f"/api/live/{L.code}/board")
        check("break started on the server", bool(board["breakUntil"]))
        check("break countdown shown", pg.locator("[data-break-left]").count() == 1)
        pg.click("[data-break-stop]"); pg.wait_for_timeout(400)
        check("break stopped", not L.teacher("GET", f"/api/live/{L.code}/board")["breakUntil"])
        # ranking
        pg.click("[data-rank=top5]"); pg.wait_for_timeout(400)
        check("ranking top5", L.teacher("GET", f"/api/live/{L.code}/board")["ranking"] == "top5")
        check("top5 shown on the teacher screen", "Аружан" in pg.inner_text("[data-top]"))
        pg.click("[data-rank=off]"); pg.wait_for_timeout(300)
        # level change from the card
        pg.click("[data-card=s1]"); pg.click(".modal [data-setlevel=C]"); pg.wait_for_timeout(500)
        check("level C on the server", next(s for s in L.teacher("GET", f"/api/live/{L.code}/board")["students"] if s["id"] == "s1")["level"] == "C")
        # notebook mode + grade
        pg.click("[data-mode=notebook]"); pg.wait_for_timeout(300)
        pg.click("[data-card=s3]"); pg.click(".modal [data-grade='5']"); pg.wait_for_timeout(500)
        bd = L.teacher("GET", f"/api/live/{L.code}/board")
        check("notebook mode on the server", bd["mode"] == "notebook")
        check("grade 5 saved", next(s for s in bd["students"] if s["id"] == "s3")["grade"] == 5)
        check("screen time shown with limit 25", "25" in pg.inner_text("[data-screen]"))
        # end
        pg.click("[data-end]"); pg.click(".modal-back.confirm .btn-k")
        pg.wait_for_function("location.hash.startsWith('#/growth')", timeout=5000)
        check("no page errors: " + "; ".join(errors), not errors)
        b.close()
    if fails:
        print("FAIL:", *fails, sep="\n  "); sys.exit(1)
    print("PASS: teacher live screen")

if __name__ == "__main__":
    main()
