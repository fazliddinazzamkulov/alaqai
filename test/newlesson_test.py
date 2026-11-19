"""Create-lesson flow with a mocked AI server. Run: python3 test/newlesson_test.py"""
import functools, http.server, json, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fails = []
def check(name, cond):
    if not cond: fails.append(name)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

STEP = {"type": "steps", "title": "Пошагово", "steps": [{"q": "Сколько раз?", "answer": "3"}]}
LEVEL = {"steps": [STEP],
         "example": [{"type": "example", "title": "Пример", "steps": ["s = 0", "s = 6"], "answer": "6"},
                     {"type": "input", "title": "Сам", "tasks": [{"q": "1+2+3+4", "answer": 10}]}],
         "error": [{"type": "error", "title": "Ошибка", "code": True, "steps": ["for i in range(3)", "    print(i)"], "wrong": 0, "fix": "for i in range(3):"}]}
REPLIES = {
    "[part:deck]": {"title": "Цикл for", "slides": [
        {"type": "title", "title": "Цикл for", "goals": ["Узнаем for"]},
        {"type": "notes", "title": "Цикл", "points": ["повторяет действия"]},
        {"type": "code", "title": "Сумма", "code": "s = 0\nfor i in range(4):\n    s += i\nprint(s)", "steps": [{"line": 1, "text": "s = 0"}]},
        {"type": "predict", "title": "Что выведет?", "code": "print(2+3)", "answer": "5"},
        {"type": "zzz"},
        {"type": "summary", "title": "Итог", "points": ["for повторяет"]}]},
    "[part:tasks]": {"common": [{"type": "quiz", "questions": [{"q": "for — это?", "options": ["цикл", "условие"], "answer": 0}]}],
                     "levels": {"A": LEVEL, "B": LEVEL, "C": LEVEL}},
    "[part:ksp]": {"section": "Программалау", "methods": "Миға шабуыл", "health": "Көзге жаттығу",
                   "stages": [{"stage": "Басы", "minutes": 5}, {"stage": "alaqai", "minutes": 10, "screen": True},
                              {"stage": "Практика", "minutes": 15, "screen": True}, {"stage": "Соңы", "minutes": 5}]},
}
prompts = []

def ai(route):
    body = route.request.post_data_json
    text = body["contents"][0]["parts"][0]["text"]
    prompts.append(text)
    key = next(k for k in REPLIES if text.startswith(k))
    route.fulfill(status=200, content_type="application/json",
                  body=json.dumps({"candidates": [{"content": {"parts": [{"text": json.dumps(REPLIES[key], ensure_ascii=False)}]}}]}))

def store(pg, name):
    return pg.evaluate(f"JSON.parse(localStorage.getItem('alaqai:v1:{name}') || '[]')")

def make_class(pg, base):
    pg.goto(base + "/app/index.html#/classes"); pg.wait_for_selector("[data-new-class]")
    pg.click("[data-new-class]"); pg.fill("input[name=name]", "8 «А»"); pg.fill("input[name=subject]", "Информатика")
    pg.fill("textarea[name=students]", "Аружан\nТимур"); pg.click(".modal-foot .btn-k"); pg.wait_for_selector("[data-student]")
    return store(pg, "classes")[0]["id"]

def main():
    srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        # --- with AI ---
        ctx = b.new_context(viewport={"width": 1440, "height": 1000})
        ctx.route("https://api.alaqai.online/api/ai/generate", ai)
        ctx.route("https://api.alaqai.online/**", lambda r: r.abort() if "/api/ai/generate" not in r.request.url else r.fallback())
        pg = ctx.new_page(); errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        cid = make_class(pg, base)
        pg.goto(base + f"/app/index.html#/new?topic=Цикл%20for&classId={cid}")
        pg.wait_for_selector("[data-create]")
        check("subject taken from class", pg.input_value("input[name=subject]") == "Информатика")
        check("informatics templates preselected", pg.locator("[data-type=predict][aria-pressed=true]").count() == 1)
        pg.click("[data-img=none]")
        pg.screenshot(path="/tmp/shots/new.png", full_page=True)
        pg.click("[data-create]")
        pg.wait_for_function("location.hash.startsWith('#/lesson/')", timeout=15000)
        deck = store(pg, "presentations")[0]["deck"]
        check(f"deck normalized (5 slides, got {len(deck['slides'])})", len(deck["slides"]) == 5)
        tasks = store(pg, "tasks")[0]
        check("tasks for A, B, C", set(tasks["levels"].keys()) == {"A", "B", "C"})
        check("example method has 2 slides", len(tasks["levels"]["B"]["example"]) == 2)
        ksp = store(pg, "ksp")[0]
        check("ksp minutes = 40", sum(s["minutes"] for s in ksp["stages"]) == 40)
        check("ksp has screen break", any(s.get("rest") for s in ksp["stages"]))
        lesson = store(pg, "lessons")[0]
        check("lesson links parts", all(lesson["parts"].get(k) for k in ("presentationId", "kspId", "tasksId")))
        check("deck prompt offers predict", any(t.startswith("[part:deck]") and '"type":"predict"' in t for t in prompts))
        check("ksp prompt got the deck summary", any(t.startswith("[part:ksp]") and "Цикл" in t for t in prompts))
        check("no page errors: " + "; ".join(errors), not errors)
        # --- AI offline: error + create without AI ---
        ctx2 = b.new_context(viewport={"width": 1440, "height": 1000})
        ctx2.route("https://api.alaqai.online/**", lambda r: r.abort())
        pg2 = ctx2.new_page()
        cid2 = make_class(pg2, base)
        pg2.goto(base + f"/app/index.html#/new?topic=Сила%20тока&classId={cid2}")
        pg2.wait_for_selector("[data-create]"); pg2.click("[data-create]")
        pg2.wait_for_selector("[data-noai]", timeout=10000)
        check("offline message shown", pg2.locator("[role=alert]").count() >= 1)
        pg2.click("[data-noai]")
        pg2.wait_for_function("location.hash.startsWith('#/lesson/')", timeout=8000)
        d2 = store(pg2, "presentations")[0]["deck"]
        check("blank deck starts with title", d2["slides"][0]["type"] == "title" and d2["slides"][0]["title"] == "Сила тока")
        check("blank ksp = 40 min", sum(s["minutes"] for s in store(pg2, "ksp")[0]["stages"]) == 40)
        b.close()
    srv.shutdown()
    if fails:
        print("FAIL:", *fails, sep="\n  "); sys.exit(1)
    print("PASS: create lesson")

if __name__ == "__main__":
    main()
