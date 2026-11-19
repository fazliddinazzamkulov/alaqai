"""Browser checks of the v2 teacher app (no server needed: AI calls are not made).
Run: python3 test/app_test.py"""
import functools, http.server, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fails = []


def check(name, cond):
    if not cond:
        fails.append(name)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def main():
    srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = b.new_context(viewport={"width": 1440, "height": 1000})
        # No server in tests: every API call fails fast, as when offline.
        ctx.route("https://api.alaqai.online/**", lambda r: r.abort())
        pg = ctx.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))

        # --- shell, default language kk ---
        pg.goto(base + "/app/index.html#/home")
        pg.wait_for_selector(".side .nav", timeout=8000)
        check("default language is kk", pg.evaluate("document.documentElement.lang") == "kk")
        navs = pg.locator(".side .nav").all_inner_texts()
        check(f"five menu items {navs}", len(navs) == 5)
        check("menu in Kazakh", any("Басты бет" in n for n in navs))
        check("create button", pg.locator(".side a.btn.b").count() == 1)
        pg.locator(".langs button", has_text="РУС").click()
        pg.wait_for_timeout(300)
        check("switch to Russian", any("Главная" in n for n in pg.locator(".side .nav").all_inner_texts()))

        # --- classes: create a class with students, change a level ---
        pg.goto(base + "/app/index.html#/classes")
        pg.wait_for_selector("[data-new-class]")
        pg.click("[data-new-class]")
        pg.fill("input[name=name]", "8 «А»")
        pg.fill("textarea[name=students]", "Аружан Сейтқали\nТимур Каримов\nНұрлан Бекұлы")
        pg.click(".modal-foot .btn-k")
        pg.wait_for_selector("[data-student]")
        check("three students listed", pg.locator("[data-student]").count() == 3)
        check("default level B", pg.locator("[data-student] .lv.B").count() == 3)
        pg.locator("[data-student]").first.locator("[data-level=A]").click()
        pg.wait_for_timeout(200)
        check("level changed to A", pg.locator("[data-student] .lv.A").count() >= 1)

        # --- home shows the class and an empty growth state ---
        pg.goto(base + "/app/index.html#/home")
        pg.wait_for_selector("[data-quick]")
        check("class in quick create select", "8 «А»" in pg.locator("[data-quick] select").inner_text())
        os.makedirs("/tmp/shots", exist_ok=True)
        pg.screenshot(path="/tmp/shots/home.png", full_page=True)
        m = b.new_page(viewport={"width": 390, "height": 844})
        m.goto(base + "/app/index.html#/home"); m.wait_for_timeout(800)
        check("no horizontal scroll on phone", m.evaluate("document.documentElement.scrollWidth <= 392"))
        m.screenshot(path="/tmp/shots/home-phone.png", full_page=True)
        check("no page errors: " + "; ".join(errors), not errors)
        b.close()
    srv.shutdown()
    if fails:
        print("FAIL:", *fails, sep="\n  ")
        sys.exit(1)
    print("PASS: teacher app shell")


if __name__ == "__main__":
    main()
