"""Student app on alaqai.online/join against the real API (demo data). Run: python3 test/join_test.py"""
import os, sys
from playwright.sync_api import sync_playwright
from live_server import Live

fails = []
def check(name, cond):
    if not cond: fails.append(name)

def main():
    with Live() as L, sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        ctx.add_init_script(f"try {{ localStorage.setItem('alaqai_api', '{L.api}') }} catch (e) {{}}")
        pg = ctx.new_page(); errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        # wrong code
        pg.goto(L.base + "/join/index.html")
        pg.fill("[data-code]", "000000"); pg.click("[data-go]")
        pg.wait_for_selector("[role=alert]:not([hidden])")
        check("unknown code message", len(pg.inner_text("[role=alert]")) > 3)
        # right code from the QR link
        pg.goto(L.base + f"/join/index.html?c={L.code}")
        pg.wait_for_selector("[data-student]")
        check("class list shown", pg.locator("[data-student]").count() == 4)
        pg.screenshot(path="/tmp/shots/join.png", full_page=True)
        pg.locator("[data-student]", has_text="Нұрлан").click()
        pg.wait_for_selector("iframe[data-player]")
        check("the student never sees a level", pg.locator("[data-level], .lvbadge").count() == 0 and not any(w in pg.inner_text("body") for w in ["Деңгей", "Уровень", "Level"]))
        f = None
        for _ in range(40):
            f = next((fr for fr in pg.frames if fr.url.endswith("player.html")), None)
            if f and f.evaluate("document.querySelectorAll('#stage .slide').length") > 0: break
            pg.wait_for_timeout(200)
        check("task for level A shown", f and "A:" in f.inner_text("#stage .slide.active .s-title"))
        # choose another method
        pg.click("[data-method=error]"); pg.wait_for_timeout(2600)
        f = next(fr for fr in pg.frames if fr.url.endswith("player.html"))
        check("error method shown", f.evaluate("!!document.querySelector('#stage .slide.active.tpl-error')"))
        # answer in the player → board shows done
        f.click("#stage .slide.active .er-row >> nth=0"); pg.wait_for_timeout(800)
        board = L.teacher("GET", f"/api/live/{L.code}/board")
        s3 = next(s for s in board["students"] if s["name"].startswith("Нұрлан"))
        check(f"answer reached the teacher ({s3['status']})", s3["status"] == "done" and s3["correct"] == 1)
        pg.screenshot(path="/tmp/shots/student.png", full_page=True)
        # help
        pg.click("[data-help]"); pg.wait_for_timeout(400)
        board = L.teacher("GET", f"/api/live/{L.code}/board")
        check("help reached the teacher", next(s for s in board["students"] if s["name"].startswith("Нұрлан"))["status"] == "help")
        # pressing «Check» again on the same task does not add points (no gaming the ranking)
        L.teacher("POST", f"/api/live/{L.code}/control", {"mode": "common"})
        pg.wait_for_timeout(2600)
        f = next(fr for fr in pg.frames if fr.url.endswith("player.html"))
        f.fill("#stage .slide.active .pd-in", "0\n1\n2")
        f.click("#stage .slide.active [data-act=check]"); pg.wait_for_timeout(300)
        f.click("#stage .slide.active [data-act=check]"); pg.wait_for_timeout(800)
        s3 = next(s for s in L.teacher("GET", f"/api/live/{L.code}/board")["students"] if s["name"].startswith("Нұрлан"))
        check(f"repeat check counted once (correct={s3['correct']}, total={s3['total']})", s3["correct"] == 2 and s3["total"] == 2)
        L.teacher("POST", f"/api/live/{L.code}/control", {"mode": "levels"})
        # break screen
        L.teacher("POST", f"/api/live/{L.code}/control", {"break": {"minutes": 5, "text": "Дәптерге блок-схема сыз"}})
        pg.wait_for_selector("[data-break]:not([hidden])", timeout=5000)
        check("break text shown", "блок-схема" in pg.inner_text("[data-break]"))
        check("player hidden during break", not pg.is_visible("iframe[data-player]"))
        pg.screenshot(path="/tmp/shots/break.png", full_page=True)
        L.teacher("POST", f"/api/live/{L.code}/control", {"break": None, "ranking": "top5"})
        pg.wait_for_selector("[data-ranking]:not([hidden])", timeout=5000)
        check("ranking shows the student", "Нұрлан" in pg.inner_text("[data-ranking]"))
        # reload keeps the student signed in
        pg.reload(); pg.wait_for_selector("[data-method]", timeout=5000)
        check("remembered after reload", "Нұрлан" in pg.inner_text("header"))
        # another device cannot take the same name
        pg2 = b.new_context(viewport={"width": 390, "height": 844}); pg2.add_init_script(f"try {{ localStorage.setItem('alaqai_api', '{L.api}') }} catch (e) {{}}")
        m = pg2.new_page(); m.goto(L.base + f"/join/index.html?c={L.code}"); m.wait_for_selector("[data-student]")
        check("taken name is disabled", m.locator("[data-student][disabled]", has_text="Нұрлан").count() == 1)
        check("no horizontal scroll on phone", m.evaluate("document.documentElement.scrollWidth <= 392"))
        # lesson ended
        L.teacher("POST", f"/api/live/{L.code}/control", {"end": True})
        pg.wait_for_selector("[data-ended]:not([hidden])", timeout=5000)
        check("no page errors: " + "; ".join(errors), not errors)
        b.close()
    if fails:
        print("FAIL:", *fails, sep="\n  "); sys.exit(1)
    print("PASS: student join app")

if __name__ == "__main__":
    main()
