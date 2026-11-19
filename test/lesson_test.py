"""Lesson screen: presentation tab (player, thumbnails, edits, AI template change),
tasks tab and KSP tab with Word export. Run: python3 test/lesson_test.py"""
import functools, http.server, json, os, socketserver, sys, threading, tempfile
from playwright.sync_api import sync_playwright
import docx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fails = []
def check(name, cond):
    if not cond: fails.append(name)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

DECK = {"lang": "ru", "slides": [
    {"type": "title", "title": "Цикл for", "goals": ["Узнаем for"]},
    {"type": "notes", "title": "Цикл", "points": ["повторяет действия"]},
    {"type": "predict", "title": "Что выведет?", "code": "print(2+3)", "answer": "5"},
    {"type": "summary", "title": "Итог", "points": ["for повторяет"]}]}
ERR = {"type": "error", "title": "Найди ошибку", "code": True, "steps": ["print(2+3", "x = 1"], "wrong": 0, "fix": "print(2+3)"}
TASKS = {"id": "tk1", "lessonId": "L1", "common": [DECK["slides"][2]],
         "levels": {"C": {"error": [ERR]}, "B": {"steps": [{"type": "steps", "title": "Шаги", "steps": [{"q": "2+3?", "answer": "5"}]}]}}}
KSP = {"id": "k1", "lessonId": "L1", "topic": "Цикл for", "methods": "Миға шабуыл", "health": "Көзге жаттығу",
       "stages": [{"stage": "Басы", "minutes": 5, "teacher": "Сәлемдеседі", "students": "", "assessment": "", "resources": "Слайд 1"},
                  {"stage": "alaqai", "minutes": 35, "screen": True, "teacher": "", "students": "", "assessment": "", "resources": ""}]}
SEED = {"lessons": [{"id": "L1", "classId": None, "topic": "Цикл for", "subject": "Информатика", "lang": "ru", "date": "2026-11-19", "parts": {"presentationId": "P1", "tasksId": "tk1", "kspId": "k1"}}],
        "presentations": [{"id": "P1", "lessonId": "L1", "title": "Цикл for", "lang": "ru", "deck": DECK}],
        "tasks": [TASKS], "ksp": [KSP]}

def ai(route):
    route.fulfill(status=200, content_type="application/json",
                  body=json.dumps({"candidates": [{"content": {"parts": [{"text": json.dumps(ERR, ensure_ascii=False)}]}}]}))

def store(pg, name):
    return pg.evaluate(f"JSON.parse(localStorage.getItem('alaqai:v1:{name}') || '[]')")

def active_index(frame):
    return frame.evaluate("[...document.querySelectorAll('#stage .slide')].findIndex(s => s.classList.contains('active'))")

def main():
    srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = b.new_context(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
        ctx.add_init_script("try { localStorage.setItem('alaqai_last_user', JSON.stringify({name: 'Тест Мұғалім', email: 't@test.kz'})) } catch (e) {}")  # signed in before; offline now
        ctx.route("https://api.alaqai.online/api/ai/generate", ai)
        ctx.route("https://api.alaqai.online/**", lambda r: r.abort() if "/api/ai/generate" not in r.request.url else r.fallback())
        pg = ctx.new_page(); errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(base + "/app/index.html#/home"); pg.wait_for_selector(".side .nav")
        pg.evaluate("seed => { for (const [k, v] of Object.entries(seed)) localStorage.setItem('alaqai:v1:' + k, JSON.stringify(v)); }", SEED)
        pg.goto(base + "/app/index.html#/lesson/L1")
        pg.wait_for_selector("[data-thumb]")
        frame = pg.frame_locator("iframe[data-player]")
        frame.locator("#stage .slide").nth(3).wait_for(state="attached", timeout=8000)
        f = next(fr for fr in pg.frames if fr.url.endswith("player.html"))
        check("player shows 4 slides", f.evaluate("document.querySelectorAll('#stage .slide').length") == 4)
        check("4 thumbnails", pg.locator("[data-thumb]").count() == 4)
        pg.locator("[data-thumb]").nth(2).click(); pg.wait_for_timeout(400)
        check("thumbnail opens slide 3", active_index(f) == 2)
        check("panel names the template", "Что выведет" in pg.locator("[data-panel]").inner_text() or "Не шығарады" in pg.locator("[data-panel]").inner_text())
        check("ask button readable (white text)", pg.eval_on_selector("[data-ask]", "e => getComputedStyle(e).color") == "rgb(255, 255, 255)")
        pg.screenshot(path="/tmp/shots/lesson.png", full_page=True)
        # change template with AI
        pg.click("[data-retype=error]")
        pg.wait_for_function("JSON.parse(localStorage.getItem('alaqai:v1:presentations'))[0].deck.slides[2].type === 'error'", timeout=8000)
        check("slide 3 became error", store(pg, "presentations")[0]["deck"]["slides"][2]["type"] == "error")
        # move slide 3 up, then delete slide 2
        pg.click("[data-op=up]"); pg.wait_for_timeout(300)
        check("moved up", store(pg, "presentations")[0]["deck"]["slides"][1]["type"] == "error")
        pg.click("[data-op=del]"); pg.click(".modal-back.confirm .btn-k"); pg.wait_for_timeout(300)
        check("deleted", len(store(pg, "presentations")[0]["deck"]["slides"]) == 3)
        check("thumbnails follow", pg.locator("[data-thumb]").count() == 3)
        # tasks tab
        pg.click("[data-tab=tasks]"); pg.wait_for_selector("[data-lvl]")
        pg.click("[data-lvl=C]"); pg.click("[data-method=error]"); pg.wait_for_timeout(900)
        f2 = next(fr for fr in pg.frames if fr.url.endswith("player.html"))
        check("tasks preview shows the C/error slide", f2.evaluate("!!document.querySelector('#stage .slide.tpl-error')"))
        # ksp tab
        pg.click("[data-tab=ksp]"); pg.wait_for_selector(".ksp-doc")
        check("methods row shown", "Методы и приёмы" in pg.locator(".ksp-doc").inner_text() or "Әдіс-тәсілдер" in pg.locator(".ksp-doc").inner_text())
        cell = pg.locator(".ksp-doc [data-k=methods]")
        cell.click(); cell.fill("Миға шабуыл, жұптық жұмыс"); pg.locator(".ksp-doc .kd-title").click(); pg.wait_for_timeout(300)
        check("ksp edit saved", store(pg, "ksp")[0]["methods"] == "Миға шабуыл, жұптық жұмыс")
        with pg.expect_download() as dl:
            pg.click("[data-word]")
        path = os.path.join(tempfile.mkdtemp(), "ksp.docx"); dl.value.save_as(path)
        text = "\n".join(c.text for t in docx.Document(path).tables for r in t.rows for c in r.cells)
        check("docx has methods", "жұптық жұмыс" in text)
        check("docx has 2 stages", "Басы" in text and "alaqai" in text)
        check("no page errors: " + "; ".join(errors), not errors)
        b.close()
    srv.shutdown()
    if fails:
        print("FAIL:", *fails, sep="\n  "); sys.exit(1)
    print("PASS: lesson screen")

if __name__ == "__main__":
    main()
