"""Browser checks: Google-only sign-in (no phone), admin panel «Расход и лимиты»
and «Администраторы» by e-mail — in example-data mode and against the real API
(alaqai.back/scripts/dev-live.js with DEV_ROLE=owner).
Run: python3 test/admin_test.py"""
import os, sys, json
from playwright.sync_api import sync_playwright
from live_server import Live

fails = []
def check(name, cond):
    if not cond: fails.append(name)

def main():
    os.environ["DEV_ROLE"] = "owner"
    with Live() as lv, sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = b.new_context(viewport={"width": 1440, "height": 1000})
        ctx.add_init_script(f"try {{ localStorage.setItem('alaqai_api', '{lv.api}'); }} catch (e) {{}}")
        pg = ctx.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))

        # --- v2 sign-in: Google only ---
        pg.goto(lv.base + "/app/index.html#/login")
        pg.wait_for_selector(".li-form", timeout=8000)
        check("no phone field on the sign-in page", pg.locator("input[name=phone]").count() == 0)
        check("no SMS button", pg.locator("text=SMS").count() == 0)
        check("Google button area", pg.locator("[data-google]").count() == 1)
        pg.goto(lv.base + "/app/index.html#/login/code?phone=%2B77771234567")
        pg.wait_for_timeout(400)
        check("no SMS code screen", pg.locator("input[name=code]").count() == 0)

        # --- a guest cannot use the teacher app: everything needs a Google account ---
        pg.goto(lv.base + "/app/index.html#/classes")
        pg.wait_for_selector(".li-form", timeout=8000)
        check(f"guest is sent to sign-in ({pg.url})", "#/login" in pg.url and "classes" in pg.url)
        check("no example-without-sign-in link", pg.locator("a[href='#/preview']").count() == 0)

        # --- admin gate: no phone sign-in ---
        pg.goto(lv.base + "/admin/index.html")
        pg.wait_for_selector(".ag-card", timeout=8000)
        check("admin gate has no phone link", pg.locator(".ag-phone").count() == 0 and pg.locator("a[href*='login?next=admin']").count() == 0)

        # --- example data ---
        pg.click("[data-demo]")
        pg.wait_for_selector(".as-item[href='#/usage']", timeout=8000)
        pg.goto(lv.base + "/admin/index.html#/usage")
        pg.wait_for_selector("[data-service=gemini]", timeout=8000)
        check("five services", pg.locator("[data-service]").count() == 5)
        check("teachers listed", pg.locator("[data-teacher]").count() > 5)
        pg.fill("[data-service=gemini] input", "10")
        pg.click("[data-limits] .btn-k")
        pg.wait_for_timeout(300)
        check("demo gemini limit shown and full", "full" in (pg.locator("[data-service=gemini]").get_attribute("class") or ""))
        pg.goto(lv.base + "/admin/index.html#/admins")
        pg.wait_for_selector("[data-add]", timeout=8000)
        pg.fill("[data-add] input", "new.admin@gmail.com")
        pg.click("[data-add] .btn-k")
        pg.wait_for_selector("[data-admin='new.admin@gmail.com']", timeout=4000)

        # --- real API as the owner ---
        sess = lv.cookie.split("=", 1)
        ctx.add_cookies([{"name": sess[0], "value": sess[1], "url": lv.api}])
        pg.goto("about:blank")  # a real reload: the admin page reads the session at start
        pg.goto(lv.base + "/admin/index.html#/usage")
        pg.wait_for_selector("[data-service=gemini]", timeout=8000)
        check("no demo pill in live mode", pg.locator(".page-head .tag").count() == 0)
        today = pg.locator("[data-service=gemini] [data-today]").inner_text()
        check(f"live gemini count from the server ({today})", today == "2")
        check("demo teacher row", pg.locator("[data-teacher]").count() == 1)
        pg.fill("[data-service=pexels] input", "100")
        pg.click("[data-limits] .btn-k")
        pg.wait_for_timeout(500)
        u = lv.teacher("GET", "/api/admin/usage")
        check("pexels limit saved on the server", next(s for s in u["services"] if s["id"] == "pexels")["limit"] == 100)
        pg.click("[data-edit]")
        pg.fill(".modal input[name=extra]", "25")
        pg.fill(".modal input[name=cap]", "0")
        pg.click(".modal-foot .btn-k")
        pg.wait_for_timeout(500)
        t = lv.teacher("GET", "/api/admin/usage")["teachers"][0]
        check(f"extra and cap saved {t}", t["extraWeek"] == 25 and t["dailyCap"] == 0)
        check("row shows AI off", pg.locator("[data-teacher] .us-off").count() == 1)

        pg.goto(lv.base + "/admin/index.html#/admins")
        pg.wait_for_selector("[data-add]", timeout=8000)
        pg.fill("[data-add] input", "Helper@Gmail.com")
        pg.click("[data-add] .btn-k")
        pg.wait_for_selector("[data-admin='helper@gmail.com']", timeout=4000)
        check("admin e-mail saved on the server", lv.teacher("GET", "/api/admin/admin-emails")["emails"] == ["helper@gmail.com"])
        pg.click("[data-remove='helper@gmail.com']")
        pg.click(".modal-back.confirm .btn-k")
        pg.wait_for_timeout(500)
        check("admin e-mail removed", lv.teacher("GET", "/api/admin/admin-emails")["emails"] == [])

        check(f"no page errors {errors}", not errors)
        b.close()
    if fails:
        print("FAIL: " + "; ".join(fails)); sys.exit(1)
    print("PASS: Google sign-in and admin usage")

if __name__ == "__main__":
    main()
