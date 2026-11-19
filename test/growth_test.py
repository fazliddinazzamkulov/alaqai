"""Student growth screen from synced attempts. Run: cd test && python3 growth_test.py"""
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
        pg.goto(base + "/app/index.html#/growth"); pg.wait_for_selector("[data-st]")
        check("two students listed", pg.locator("[data-st]").count() == 2)
        check("lagging student flagged", "Нұрлан" in pg.inner_text("[data-attn]"))
        pg.click("[data-st=s1]"); pg.wait_for_selector("[data-chart] circle")
        check("one chart point per lesson", pg.locator("[data-chart] circle").count() == 4)
        check("best method first", pg.locator("[data-mbar]").first.get_attribute("data-mbar") == "steps")
        check("recommendation offers level C", pg.locator("[data-up=C]").count() == 1)
        pg.screenshot(path="/tmp/shots/growth.png", full_page=True)
        pg.click("[data-up=C]"); pg.wait_for_timeout(300)
        lv = pg.evaluate("JSON.parse(localStorage.getItem('alaqai:v1:students')).find(s => s.id === 's1').level")
        check("level saved as C", lv == "C")
        pg.fill("[data-note]", "Жақсы түсіндіреді"); pg.locator("h1").click(); pg.wait_for_timeout(300)
        note = pg.evaluate("JSON.parse(localStorage.getItem('alaqai:v1:students')).find(s => s.id === 's1').note")
        check("teacher note saved", note == "Жақсы түсіндіреді")
        pg.click("[data-st=s2]"); pg.wait_for_selector("[data-down=A]")
        check("weak student: suggestion to go down to A", pg.locator("[data-down=A]").count() == 1)
        check("no page errors: " + "; ".join(errors), not errors)
        b.close()
    srv.shutdown()
    if fails:
        print("FAIL:", *fails, sep="\n  "); sys.exit(1)
    print("PASS: growth screen")

if __name__ == "__main__":
    main()
