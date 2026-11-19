"""Screenshot a page of this repo in headless Chrome.
Usage: python3 scripts/shot.py <path-with-query-or-hash> <out.png> [width] [height] [wait_ms]
Example: python3 scripts/shot.py "app/index.html#/home" /tmp/home.png 1440 1000
The repo is served on a free local port so ES modules and fetch() work."""
import functools, http.server, socketserver, sys, threading
from playwright.sync_api import sync_playwright


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def main():
    path, out = sys.argv[1], sys.argv[2]
    w = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
    h = int(sys.argv[4]) if len(sys.argv) > 4 else 1000
    wait = int(sys.argv[5]) if len(sys.argv) > 5 else 1200
    srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory="."))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": w, "height": h})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console: " + m.text) if m.type == "error" else None)
        pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/{path}")
        pg.wait_for_timeout(wait)
        pg.screenshot(path=out, full_page=True)
        b.close()
    srv.shutdown()
    for e in errs:
        print("PAGE ERROR:", e)
    print("saved", out)


if __name__ == "__main__":
    main()
