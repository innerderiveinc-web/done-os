#!/usr/bin/env python3
"""
DONE — Local Dev Server with SPA Fallback & .env Injection
Zero-dependency static server running on Python 3.
Serves index.html for all SPA routes (/dashboard, /requests, /r/..., etc.)
Parses .env and injects window.__DONE_CONFIG__ into index.html
"""
import http.server
import socketserver
import os
import sys
import json

PORT = int(os.environ.get('PORT', 3000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def load_env():
    env_vars = {}
    env_path = os.path.join(DIRECTORY, '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars

class SPAModuleHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Clean path
        path = self.path.split('?')[0].split('#')[0]
        local_file = os.path.join(DIRECTORY, path.lstrip('/'))

        # If file exists and not index.html, serve directly
        if os.path.exists(local_file) and not os.path.isdir(local_file) and path != '/index.html' and path != '/':
            return super().do_GET()

        # If requesting static assets under /src/ or specific extensions that are missing, return 404
        if path.startswith('/src/') or path.endswith(('.js', '.css', '.png', '.jpg', '.svg', '.json', '.sql')):
            return super().do_GET()

        # SPA rewrite: serve index.html with injected .env config
        index_path = os.path.join(DIRECTORY, 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()

            env_vars = load_env()
            config_script = f"<script>window.__DONE_CONFIG__ = {json.dumps(env_vars)};</script>"
            content = content.replace('</head>', f"{config_script}\n</head>")

            encoded = content.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
            return

        return super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), SPAModuleHandler) as httpd:
        print(f"\n==================================================")
        print(f"  DONE — Request-to-Completion OS Dev Server")
        print(f"  Running at: http://localhost:{PORT}")
        print(f"  Mode: DEMO / LOCAL (.env auto-injection active)")
        print(f"==================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            sys.exit(0)
