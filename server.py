#!/usr/bin/env python3
"""
Citizen Charter Web Server (Hardened Python Fallback - No XAMPP Required)
Corazon Locsin Montelibano Memorial Regional Hospital (CLMMRH)

Security Hardening Features:
  - Zero Subprocess / Zero Shell Execution (Immune to command injection)
  - Strict Path Traversal Prevention (Rejects null bytes, Alternate Data Streams, dot-dot attacks)
  - Extension Whitelisting (Blocks direct access to scripts, configs, .bat, .vbs, .php, .env)
  - Anti-DoS Body Size Capping (Max 512 KB payload)
  - Strict Input Sanitization (Prevents object injection & parameter pollution)
  - Full OWASP Security Headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
  - Information Disclosure Protection (No server banner leakage)
"""

import os
import sys
import json
import time
import socket
import re
from urllib.parse import urlparse, parse_qs, unquote
from http.server import HTTPServer, BaseHTTPRequestHandler

# Dedicated port: 6767 ('C'=67, 'C'=67 in ASCII for Citizen Charter)
# Free from conflicts with XAMPP (80), Tomcat/Vue (8080), React/Next (3000), Vite (5173), etc.
PORT = int(os.environ.get('PORT', 6767))
FALLBACK_PORT = 8899
HOST = os.environ.get('HOST', '0.0.0.0')
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT_DIR, 'data')
SERVICES_FILE = os.path.join(DATA_DIR, 'services.json')
MAX_BODY_SIZE = 512 * 1024  # 512 KB limit

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(SERVICES_FILE):
    with open(SERVICES_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f, indent=2)

ALLOWED_MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8'
}

BLOCKED_EXTENSIONS = {
    '.bat', '.cmd', '.vbs', '.ps1', '.sh',
    '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
    '.py', '.pyc',
    '.exe', '.dll', '.msi',
    '.json', '.jsonl', '.log',
    '.env', '.ini', '.config', '.bak', '.swp', '.git'
}

def sanitize_string(val, max_len=100000):
    if not isinstance(val, str):
        if val is None:
            return ''
        val = str(val)
    # Strip dangerous control chars (except tab, newline, carriage return)
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', val)
    return cleaned[:max_len]

def get_local_ips():
    ips = []
    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None):
            ip = info[4][0]
            if ':' not in ip and not ip.startswith('127.'):
                if ip not in ips:
                    ips.append(ip)
    except Exception:
        pass
    return ips

class HardenedHandler(BaseHTTPRequestHandler):
    server_version = "WebPlatform"
    sys_version = ""

    def send_security_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        self.send_header('Content-Security-Policy',
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.ckeditor.com; "
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
            "font-src 'self' https://cdnjs.cloudflare.com data:; "
            "img-src 'self' data: blob:; "
            "connect-src 'self'; "
            "frame-ancestors 'self';"
        )
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_security_headers()
        self.end_headers()

    def do_GET(self):
        self.handle_request(is_head=False)

    def do_HEAD(self):
        self.handle_request(is_head=True)

    def handle_request(self, is_head=False):
        parsed = urlparse(self.path)
        raw_path = parsed.path or '/'

        try:
            pathname = unquote(raw_path)
        except Exception:
            self.send_response(400)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'400 Bad Request')
            return

        # Security check: null bytes, Alternate Data Streams, backslashes
        if '\0' in pathname or ':' in pathname or '\\' in pathname:
            self.send_response(400)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'400 Bad Request: Invalid Characters')
            return

        while '//' in pathname:
            pathname = pathname.replace('//', '/')

        lower_path = pathname.lower()
        # Root redirects
        if lower_path in ('/', '/ccmain', '/ccmain/', '/main.html'):
            self.send_response(302)
            self.send_security_headers()
            self.send_header('Location', '/ccmain/main.html')
            self.end_headers()
            return

        rel_path = pathname
        if lower_path.startswith('/ccmain/'):
            rel_path = rel_path[len('/ccmain/'):]
        elif rel_path.startswith('/'):
            rel_path = rel_path[1:]

        if not rel_path:
            rel_path = 'main.html'

        safe_path = os.path.abspath(os.path.join(ROOT_DIR, rel_path))
        try:
            if os.path.commonpath([ROOT_DIR, safe_path]) != ROOT_DIR:
                self.send_response(403)
                self.send_security_headers()
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'403 Forbidden')
                return
        except ValueError:
            self.send_response(403)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'403 Forbidden')
            return

        # Block direct access to data directory
        if safe_path.startswith(DATA_DIR) or safe_path.lower().endswith('services.json'):
            self.send_response(403)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'403 Forbidden')
            return

        filename = os.path.basename(safe_path).lower()
        if filename in ('server.js', 'server.py', 'package.json'):
            self.send_response(404)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'404 Not Found')
            return

        _, ext = os.path.splitext(safe_path)
        ext = ext.lower()

        if ext in BLOCKED_EXTENSIONS or ext not in ALLOWED_MIME_TYPES:
            self.send_response(404)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'404 Not Found')
            return

        if not os.path.isfile(safe_path):
            self.send_response(404)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            msg = f'<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>404 - File Not Found</h2><p><a href="/ccmain/main.html">Go to Citizen Charter Builder</a></p></body></html>'
            self.wfile.write(msg.encode('utf-8'))
            return

        content_type = ALLOWED_MIME_TYPES.get(ext, 'application/octet-stream')

        try:
            file_size = os.path.getsize(safe_path)
            self.send_response(200)
            self.send_security_headers()
            self.send_header('Content-Type', content_type)
            if ext == '.html':
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            else:
                self.send_header('Cache-Control', 'public, max-age=3600')
            self.send_header('Content-Length', str(file_size))
            self.end_headers()

            if not is_head:
                with open(safe_path, 'rb') as f:
                    while chunk := f.read(65536):
                        self.wfile.write(chunk)
        except Exception as e:
            self.send_response(500)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'500 Server Error')

    def do_POST(self):
        parsed = urlparse(self.path)
        pathname = unquote(parsed.path)

        # Intercept save_service.php in-memory (no PHP runtime or shell invocation)
        if pathname.lower() in ('/ccmain/save_service.php', '/save_service.php'):
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                if content_len > MAX_BODY_SIZE:
                    self.send_response(413)
                    self.send_security_headers()
                    self.send_header('Content-Type', 'text/plain')
                    self.end_headers()
                    self.wfile.write(b'413 Payload Too Large')
                    return

                body = self.rfile.read(content_len).decode('utf-8', errors='ignore')
                content_type = self.headers.get('Content-Type', '')

                if 'application/json' in content_type:
                    data = json.loads(body)
                else:
                    raw_qs = parse_qs(body)
                    data = {k: v[0] if len(v) == 1 else v for k, v in raw_qs.items()}

                if not isinstance(data, dict):
                    data = {}

                new_record = {
                    'id': int(time.time() * 1000),
                    'savedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                    'serviceName': sanitize_string(data.get('serviceName'), 255),
                    'description': sanitize_string(data.get('description'), 50000),
                    'office': sanitize_string(data.get('office'), 500),
                    'classification': sanitize_string(data.get('classification'), 100),
                    'transactionTypes': sanitize_string(data.get('transactionTypes', data.get('transaction_type')), 255),
                    'whoMayAvail': sanitize_string(data.get('whoMayAvail', data.get('who_may_avail')), 2000),
                    'requirements': sanitize_string(data.get('requirements'), 50000),
                    'processOverview': sanitize_string(data.get('processOverview'), 50000),
                    'feesToBePaid': sanitize_string(data.get('feesToBePaid'), 500),
                    'processingTime': sanitize_string(data.get('processingTime'), 500)
                }

                current = []
                try:
                    if os.path.exists(SERVICES_FILE):
                        with open(SERVICES_FILE, 'r', encoding='utf-8') as f:
                            parsed_json = json.load(f)
                            if isinstance(parsed_json, list):
                                current = parsed_json
                except Exception:
                    current = []

                current.append(new_record)
                temp_file = SERVICES_FILE + '.tmp'
                with open(temp_file, 'w', encoding='utf-8') as f:
                    json.dump(current, f, indent=2)
                os.replace(temp_file, SERVICES_FILE)

                self.send_response(200)
                self.send_security_headers()
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'New record created successfully')
            except Exception as e:
                self.send_response(400)
                self.send_security_headers()
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'Error: Invalid request payload')
        else:
            self.send_response(404)
            self.send_security_headers()
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'404 Not Found')

def start_server(port):
    try:
        server = HTTPServer((HOST, port), HardenedHandler)
        ips = get_local_ips()
        port_suffix = '' if port == 80 else f':{port}'
        print('================================================================')
        print('   Citizen Charter Builder Server (Hardened - No XAMPP)')
        print('   Protected against: PHP2Shell, Node2Shell, Path Traversal')
        print('================================================================')
        print(f' Status: RUNNING on Port {port}')
        print(f' Web Root: {ROOT_DIR}\n')
        print(' Access URLs:')
        print(f'   - Local:    http://localhost{port_suffix}/ccmain/main.html')
        for ip in ips:
            print(f'   - Network:  http://{ip}{port_suffix}/ccmain/main.html')
        print(f'   - Target:   http://172.16.254.100{port_suffix}/ccmain/main.html')
        print('================================================================\n')
        server.serve_forever()
    except PermissionError:
        print(f'\n[ERROR] Permission denied on Port {port}. Right-click and Run as Administrator.')
    except OSError as e:
        if (e.errno == 10048 or 'already in use' in str(e).lower()) and port == PORT and not os.environ.get('PORT'):
            print(f'\n[CONFLICT AVOIDANCE] Port {PORT} is in use.')
            print(f'Switching seamlessly to secondary Port {FALLBACK_PORT}...\n')
            start_server(FALLBACK_PORT)
        elif e.errno == 10048 or 'already in use' in str(e).lower():
            print(f'\n[ERROR] Port {port} is already in use by another application!')
        else:
            print(f'\n[ERROR] {e}')
    except KeyboardInterrupt:
        print('\nServer stopped.')

if __name__ == '__main__':
    start_server(PORT)
