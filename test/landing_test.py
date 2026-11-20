"""Landing: minimal, no trial/pricing words, burger menu on phones. Run: python3 test/landing_test.py"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import functools, http.server, socketserver, threading, sys
from playwright.sync_api import sync_playwright
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv = socketserver.TCPServer(("127.0.0.1",0), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
base=f"http://127.0.0.1:{srv.server_address[1]}"
fails=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    errs=[]
    d=b.new_page(viewport={"width":1440,"height":900}); d.on("pageerror", lambda e: errs.append(str(e)))
    d.goto(base+"/index.html"); d.wait_for_timeout(500)
    d.screenshot(path="/tmp/shots/landing.png")
    if d.locator("#burger").is_visible(): fails.append("burger on desktop")
    d.locator(".hdr-r [data-lang=ru]").click()
    if "Подготовка" not in d.locator("h1").inner_text(): fails.append("ru switch")
    for w in ["пробн","бесплатно","Тариф","Начать"]:
        if w.lower() in d.content().lower(): fails.append("word "+w)
    # the only demo mention is the link to the working demo copy (no server needed)
    if d.locator("a[href='demo/']").count() != 1: fails.append("demo link")
    if d.inner_text("body").lower().count("демо") != 1: fails.append("word демо outside the demo link")
    m=b.new_page(viewport={"width":390,"height":844}); m.on("pageerror", lambda e: errs.append(str(e)))
    m.goto(base+"/index.html"); m.wait_for_timeout(500)
    if m.locator(".hdr-r").is_visible(): fails.append("top menu visible on phone")
    if not m.locator("#burger").is_visible(): fails.append("no burger")
    if m.evaluate("document.documentElement.scrollWidth")>392: fails.append("hscroll")
    m.screenshot(path="/tmp/shots/landing-phone.png")
    m.click("#burger"); m.wait_for_timeout(200)
    if not m.locator("#mmenu a[href='app/#/login']").is_visible(): fails.append("menu login")
    m.screenshot(path="/tmp/shots/landing-phone-menu.png")
    if errs: fails.append(str(errs))
print("FAIL: " + "; ".join(fails)) if fails else print("PASS: landing"); sys.exit(1 if fails else 0)
