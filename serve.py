"""serve.py — Local preview server for the built portfolio site.

Usage:
    python serve.py          # serves on http://localhost:8000
    python serve.py 9000     # serves on a custom port

Contact form:
    The server handles POST to /contact.php.
    Set environment variables to send real email via SMTP:
        SMTP_USER   your Gmail address
        SMTP_PASS   Gmail App Password (myaccount.google.com/apppasswords)
        SMTP_HOST   (optional, default: smtp.gmail.com)
        SMTP_PORT   (optional, default: 587)
        TO_EMAIL    (optional, default: monislow@msu.edu)
    Without those vars set, submissions are printed to the console.
"""

import email.mime.text
import http.server
import json
import os
import smtplib
import sys
import urllib.parse
import webbrowser
from pathlib import Path


def _load_dotenv():
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, val = line.partition("=")
                os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

_load_dotenv()

DOCS_DIR     = Path(__file__).parent / "docs"
DEFAULT_PORT = 8000
TO_EMAIL     = os.environ.get("TO_EMAIL", "monislow@msu.edu")


def _send_email(name: str, sender: str, message: str):
    """Try to send via SMTP. Returns (success, error_string)."""
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    if not smtp_user or not smtp_pass:
        return False, "SMTP_USER / SMTP_PASS not set"

    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))

    try:
        msg = email.mime.text.MIMEText(
            f"From: {name} <{sender}>\n\n{message}", "plain", "utf-8"
        )
        msg["Subject"]  = f"Portfolio message from {name}"
        msg["From"]     = smtp_user
        msg["To"]       = TO_EMAIL
        msg["Reply-To"] = f"{name} <{sender}>"

        with smtplib.SMTP(smtp_host, smtp_port) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(smtp_user, smtp_pass)
            smtp.send_message(msg)
        return True, None
    except Exception as exc:
        return False, str(exc)


class _Handler(http.server.SimpleHTTPRequestHandler):
    """Static file server with no-cache headers + contact form POST handler."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, format, *args):
        pass  # suppress per-request noise

    # ── CORS pre-flight ─────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
        self.end_headers()

    # ── Contact form ─────────────────────────────────────────
    def do_POST(self):
        if self.path.rstrip("/") not in ("/contact.php", "/contact"):
            self.send_response(404)
            self.end_headers()
            return

        length  = int(self.headers.get("Content-Length", 0))
        raw     = self.rfile.read(length).decode("utf-8")
        params  = urllib.parse.parse_qs(raw)
        name    = params.get("name",    [""])[0].strip()
        sender  = params.get("email",   [""])[0].strip()
        message = params.get("message", [""])[0].strip()

        if not name or not sender or not message:
            self._json(400, {"error": "Name, email and message are required"})
            return

        ok, err = _send_email(name, sender, message)

        if ok:
            print(f"[contact] Email sent from {name} <{sender}>")
            self._json(200, {"success": True})
        else:
            print(f"\n[contact] Message received (SMTP not configured: {err})")
            print(f"  From:    {name} <{sender}>")
            print(f"  Message: {message}\n")
            self._json(200, {"success": True, "logged": True})

    def _json(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT

    if not DOCS_DIR.exists():
        sys.exit(
            "Error: docs/ directory not found.\n"
            "Run  python build.py  first to generate the site."
        )

    os.chdir(DOCS_DIR)

    url = f"http://localhost:{port}"
    print(f"Portfolio preview -> {url}")
    print(f"Contact form POST -> {url}/contact.php")
    print("Press Ctrl+C to stop.\n")

    with http.server.HTTPServer(("", port), _Handler) as httpd:
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()
