"""Mini demo lesson (/mini/): a teacher opens the CSS lesson, students join from other
devices, answer, the teacher grades. Runs against the real API (alaqai.back dev-live).
Run: cd test && python3 mini_test.py"""
import sys
from playwright.sync_api import sync_playwright
from live_server import Live

fails = []
def check(name, cond):
    if not cond: fails.append(name)

def page(b, live, w=1280, h=900):
    ctx = b.new_context(viewport={"width": w, "height": h})
    ctx.add_init_script(f"localStorage.setItem('alaqai_api', '{live.api}')")
    pg = ctx.new_page(); pg.errors = []
    pg.on("pageerror", lambda e: pg.errors.append(str(e)))
    pg.on("dialog", lambda d: d.accept())
    return pg

with Live() as live, sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    t = page(b, live)
    t.goto(live.base + "/mini/"); t.click("[data-go=teacher]"); t.click("#tf [type=submit]")
    t.wait_for_selector("[data-code]"); code = t.inner_text("[data-code]").strip()
    check("teacher gets a 4-digit code: " + code, len(code) == 4 and code.isdigit())
    check("empty class hint", "әлі кірген жоқ" in t.inner_text("main"))

    # student 1 on a phone: right on c1, wrong on c2, text c3
    s1 = page(b, live, 390, 844)
    s1.goto(live.base + "/mini/"); s1.click("[data-go=student]")
    s1.fill("#jf [name=code]", code); s1.fill("#jf [name=name]", "Аружан Сейтқали"); s1.click("#jf [type=submit]")
    s1.wait_for_selector("[data-task]")
    check("student sees 6 tasks", s1.locator("[data-task]").count() == 6)
    body = s1.inner_text("main")
    check("student never sees a level", "Деңгей" not in body and "деңгей" not in body)
    s1.click("[data-task=c1] .opt >> nth=0"); s1.wait_for_selector("[data-task=c1] .res.ok")
    s1.click("[data-task=c2] .opt >> nth=0"); s1.wait_for_selector("[data-task=c2] .res.bad")
    s1.fill("[data-f=c3] input", "color"); s1.click("[data-f=c3] [type=submit]"); s1.wait_for_selector("[data-task=c3] .res.ok")
    check("student score 2/6", s1.inner_text("[data-score]").replace(" ", "") == "2/6")
    check("answered task is locked", s1.locator("[data-task=c1] .opt >> nth=1").is_disabled())
    check("phone: no sideways scroll", s1.evaluate("document.documentElement.scrollWidth") <= 392)
    s1.screenshot(path="/tmp/shots/mini-student.png", full_page=True)

    # student 2 joins with the link from the board
    s2 = page(b, live, 390, 844)
    s2.goto(live.base + "/mini/?code=" + code); s2.fill("#jf [name=name]", "Нұрлан Бекұлы"); s2.click("#jf [type=submit]"); s2.wait_for_selector("[data-task]")

    t.wait_for_selector("[data-row]:nth-child(2)", timeout=8000)
    check("teacher sees both students", t.locator("[data-row]").count() == 2)
    row1 = t.locator("[data-row]").filter(has_text="Аружан")
    check("teacher sees ✓ ✗ ✓", [row1.locator(".cell").nth(i).inner_text()[:1] for i in range(3)] == ["✓", "✗", "✓"])
    check("task points 2/6", row1.locator("td.pts").first.inner_text().replace("\n", "") == "2/6")

    # override: c2 counted right; hand points 4/5
    row1.locator(".cell").nth(1).click(); t.wait_for_timeout(500)
    row1 = t.locator("[data-row]").filter(has_text="Аружан")
    check("override makes ✓ with mark", row1.locator(".cell").nth(1).inner_text().startswith("✓") and row1.locator(".cell .ed").count() == 1)
    row1.locator("[data-extra]").click(); t.wait_for_selector("dialog[open]")
    t.fill("dialog [name=p]", "9"); t.fill("dialog [name=m]", "5"); t.click("dialog [value=save]")
    check("points over max rejected", t.locator("dialog[open]").count() == 1)
    t.fill("dialog [name=p]", "4"); t.click("dialog [value=save]"); t.wait_for_timeout(500)
    row1 = t.locator("[data-row]").filter(has_text="Аружан")
    check("total 7/11: " + row1.locator("[data-total]").inner_text(), row1.locator("[data-total]").inner_text().replace("\n", "") == "7/11")
    check("percent 64", row1.locator(".pct").inner_text() == "64")
    check("no 10-point grade column", "/10" not in t.inner_text("[data-journal] thead"))

    # level C for Нұрлан → he gets other tasks, still no level shown
    t.locator("[data-row]").filter(has_text="Нұрлан").locator("select").select_option("C"); t.wait_for_timeout(500)
    s2.reload(); s2.wait_for_selector("[data-task]")
    check("level change gives C tasks", s2.locator("[data-task=h1]").count() == 1 and s2.locator("[data-task=b1]").count() == 0)
    t.screenshot(path="/tmp/shots/mini-teacher.png", full_page=True)

    with t.expect_download() as dl: t.click("[data-csv]")
    csv = open(dl.value.path(), "rb").read().decode("utf-8-sig")
    check("csv rows", csv.count("\r\n") == 2 and "Аружан Сейтқали" in csv and '"7/11"' in csv)

    # end lesson
    t.click("[data-close]"); t.wait_for_selector("[data-reopen]")
    s1.reload(); s1.wait_for_selector(".note")
    check("student sees the lesson ended", "аяқталды" in s1.inner_text(".note"))
    # teacher reload keeps the room
    t.goto(live.base + "/mini/"); t.click("[data-go=resume]"); t.wait_for_selector("[data-row]")
    check("teacher reopens the board after reload", t.locator("[data-row]").count() == 2)
    errs = t.errors + s1.errors + s2.errors
    check("no page errors: " + "; ".join(errs), not errs)
    b.close()

if fails:
    print("FAIL:", *fails, sep="\n  "); sys.exit(1)
print("PASS: mini lesson")
