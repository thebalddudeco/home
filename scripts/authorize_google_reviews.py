"""Owner-operated loopback OAuth setup. Credentials stay outside the website."""
import argparse
import base64
import hashlib
import hmac
import json
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--client-file', required=True)
    parser.add_argument('--private-dir', required=True)
    parser.add_argument('--port', type=int, default=8767)
    args = parser.parse_args()
    client = json.loads(Path(args.client_file).read_text(encoding='utf-8'))['installed']
    private = Path(args.private_dir)
    if not private.is_dir():
        raise RuntimeError('Create a private credentials directory before starting.')
    state, verifier = secrets.token_urlsafe(32), secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b'=').decode()
    redirect = f'http://127.0.0.1:{args.port}/callback'
    auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode({
        'client_id': client['client_id'], 'redirect_uri': redirect,
        'response_type': 'code', 'scope': 'https://www.googleapis.com/auth/business.manage',
        'access_type': 'offline', 'prompt': 'consent', 'state': state,
        'code_challenge': challenge, 'code_challenge_method': 'S256',
        'login_hint': 'info@thebalddude.co',
    })
    complete = False

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *unused):
            pass  # Callback URLs contain authorization codes.

        def page(self, status, message):
            self.send_response(status)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.end_headers()
            self.wfile.write(('<!doctype html><title>Review sync authorization</title>'
                '<body style="font:20px system-ui;background:#080f0d;color:#fff;padding:8vw">'
                '<h1>The Bald Dude Co.</h1><p>' + message + '</p>'
                '<script>history.replaceState(null,"","/result")</script></body>').encode())

        def do_GET(self):
            nonlocal complete
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == '/start':
                self.send_response(302)
                self.send_header('Location', auth_url)
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                return
            if parsed.path != '/callback':
                return self.page(404, 'Use the authorization link prepared in this chat.')
            query = urllib.parse.parse_qs(parsed.query)
            if not hmac.compare_digest(query.get('state', [''])[0], state):
                return self.page(400, 'Authorization state did not match. No credentials were saved.')
            if 'error' in query or not query.get('code'):
                return self.page(400, 'Authorization was not granted. No credentials were saved.')
            values = {'client_id': client['client_id'], 'client_secret': client['client_secret'],
                'code': query['code'][0], 'code_verifier': verifier,
                'redirect_uri': redirect, 'grant_type': 'authorization_code'}
            try:
                req = urllib.request.Request('https://oauth2.googleapis.com/token',
                    data=urllib.parse.urlencode(values).encode(),
                    headers={'Content-Type': 'application/x-www-form-urlencoded'})
                with urllib.request.urlopen(req, timeout=30) as response:
                    token = json.load(response)
                if not token.get('refresh_token'):
                    return self.page(400, 'Google did not return offline access. The sync is not active.')
                result = {'client_id': client['client_id'], 'client_secret': client['client_secret'],
                    'refresh_token': token['refresh_token'], 'scope': token.get('scope'),
                    'project_id': client['project_id']}
                temporary = private / 'credentials.tmp'
                temporary.write_text(json.dumps(result), encoding='utf-8')
                temporary.replace(private / 'credentials.json')
                complete = True
                self.page(200, 'Google authorization received. Credentials were saved privately on this computer. '
                    'The website sync still needs its API access and deployment check.')
            except (urllib.error.URLError, ValueError, KeyError, OSError):
                self.page(502, 'Google authorization could not be completed. No secret details are displayed.')

    server = HTTPServer(('127.0.0.1', args.port), Handler)
    server.timeout = 1
    end = time.monotonic() + 1800
    while not complete and time.monotonic() < end:
        server.handle_request()
    server.server_close()


if __name__ == '__main__':
    main()
