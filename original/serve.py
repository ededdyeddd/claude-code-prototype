#!/usr/bin/env python3
"""Serve the prototype locally with SPA fallback: python3 serve.py [port]"""
import http.server, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path):
            self.path = "/index.html"
        return super().send_head()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
print(f"Serving on http://localhost:{port}")
http.server.ThreadingHTTPServer(("", port), Handler).serve_forever()
