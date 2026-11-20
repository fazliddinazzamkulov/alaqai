"""Grade journal: points per student × lesson, manual points, CSV. Run: cd test && python3 journal_test.py"""
import functools, http.server, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fails = []
def check(name, cond):
    if not cond: fails.append(name)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def A(st, lesson, method, c, n, day):
    return {"id": f"{st}{lesson}{method}{day}", "studentId": st, "lessonId": lesson, "classId": "c1", "method": method, "correct": c, "total": n, "level": "B", "at": f"2026-11-{day:02d}T09:00:00Z"}

SEED = {
    "classes": [{"id": "c1", "name": "8 «А»", "subject": "Информатика"}],
    "students": [{"id": "s1", "classId": "c1", "name": "Аружан Сейтқали", "level": "B"}, {"id": "s2", "classId": "c1", "name": "Нұрлан Бекұлы", "level": "B"}],
    "attempts": [A("s1", "L1", "steps", 1, 2, 10), A("s1", "L1", "error", 0, 2, 10), A("s1", "L2", "steps", 3, 3, 12), A("s1", "L3", "steps", 2, 2, 14), A("s1", "L4", "steps", 3, 3, 16), A("s1", "L4", "error", 2, 2, 16),
                 A("s2", "L2", "steps", 0, 3, 12), A("s2", "L3", "example", 1, 3, 14), A("s2", "L4", "error", 0, 2, 16)],
    "lessons": [{"id": f"L{i}", "classId": "c1", "topic": f"Сабақ {i}", "date": f"2026-11-{9 + 2 * i:02d}"} for i in range(1, 5)],
}

def main():
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = b.new_context(viewport={"width": 1440, "height": 1000})
        ctx.add_init_script("try { localStorage.setItem('alaqai_last_user', JSON.stringify({name: 'Тест Мұғалім', email: 't@test.kz'})) } catch (e) {}")  # signed in before; offline now
        ctx.route("https://api.alaqai.online/**", lambda r: r.abort())
        pg = ctx.new_page(); errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(base + "/app/index.html#/home"); pg.wait_for_selector(".side .nav")
        pg.evaluate("seed => { for (const [k, v] of Object.entries(seed)) localStorage.setItem('alaqai:v1:' + k, JSON.stringify(v)); }", SEED)
        pg.goto(base + "/app/index.html#/journal"); pg.wait_for_selector("[data-journal]")
        check("menu has journal item", pg.locator(".side a[href='#/journal']").count() == 1)
        check("one row per student", pg.locator("[data-row]").count() == 2)
        check("one column per lesson (+name, total, %)", pg.locator("[data-journal] thead th").count() == 4 + 3)
        cell = pg.inner_text("[data-cell='s1|L1']").replace("\n", "")
        check("L1 cell sums attempts 1/4: " + cell, cell.startswith("1/4"))
        tot = pg.inner_text("[data-row=s1] td.jr-tot >> nth=0").replace("\n", "")
        check("s1 total 11/14: " + tot, tot == "11/14")
        check("s1 percent 79", pg.inner_text("[data-row=s1] .jr-pct") == "79")
        check("empty cell shows dot", pg.inner_text("[data-cell='s2|L1']").strip() == "·")
        check("no 10-point grade column", "/10" not in pg.inner_text("[data-journal] thead"))
        pg.screenshot(path="/tmp/shots/journal.png", full_page=True)
        pg.click("[data-cell='s2|L1']"); pg.wait_for_selector(".modal input[name=got]")
        pg.fill(".modal input[name=got]", "7"); pg.fill(".modal input[name=max]", "5"); pg.click(".modal [type=submit]"); pg.wait_for_timeout(200)
        check("points above max rejected, modal stays", pg.locator(".modal").count() == 1)
        pg.fill(".modal input[name=got]", "4"); pg.click(".modal [type=submit]"); pg.wait_for_timeout(300)
        check("manual points shown in cell", pg.inner_text("[data-cell='s2|L1']").replace("\n", "").startswith("4/5"))
        marks = pg.evaluate("JSON.parse(localStorage.getItem('alaqai:v1:marks') || '[]')")
        check("manual points saved as a mark", len(marks) == 1 and marks[0]["points"] == 4 and marks[0]["maxPoints"] == 5 and marks[0]["studentId"] == "s2")
        tot2 = pg.inner_text("[data-row=s2] td.jr-tot >> nth=0").replace("\n", "")
        check("s2 total includes manual points 5/13: " + tot2, tot2 == "5/13")
        pg.click("[data-cell='s2|L1']"); pg.wait_for_selector(".modal [data-clear]"); pg.click(".modal [data-clear]"); pg.wait_for_timeout(300)
        check("manual points removed", pg.inner_text("[data-cell='s2|L1']").strip() == "·" and pg.evaluate("JSON.parse(localStorage.getItem('alaqai:v1:marks')).length") == 0)
        with pg.expect_download() as dl: pg.click("[data-csv]")
        csv = open(dl.value.path(), "rb").read().decode("utf-8-sig")
        check("csv has header and both students", "Аружан Сейтқали" in csv and "Нұрлан Бекұлы" in csv and csv.count("\r\n") == 2)
        check("csv has s1 total", '"11/14"' in csv)
        check("no page errors: " + "; ".join(errors), not errors)
        b.close()
    srv.shutdown()
    if fails:
        print("FAIL:", *fails, sep="\n  "); sys.exit(1)
    print("PASS: grade journal")

if __name__ == "__main__":
    main()
