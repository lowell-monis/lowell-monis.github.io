"""send_contact_email.py — Called by the GitHub Actions contact-form workflow."""

import email.mime.text
import os
import smtplib
import sys


def main():
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    to_email  = os.environ.get("TO_EMAIL", "")
    name      = os.environ.get("SENDER_NAME", "")
    sender    = os.environ.get("SENDER_EMAIL", "")
    message   = os.environ.get("SENDER_MESSAGE", "")

    missing = [k for k, v in {
        "SMTP_USER": smtp_user, "SMTP_PASS": smtp_pass,
        "TO_EMAIL": to_email, "SENDER_NAME": name,
        "SENDER_EMAIL": sender, "SENDER_MESSAGE": message,
    }.items() if not v]

    if missing:
        print(f"Missing env vars: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    msg = email.mime.text.MIMEText(
        f"From: {name} <{sender}>\n\n{message}", "plain", "utf-8"
    )
    msg["Subject"]  = f"Portfolio contact from {name}"
    msg["From"]     = smtp_user
    msg["To"]       = to_email
    msg["Reply-To"] = f"{name} <{sender}>"

    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(smtp_user, smtp_pass)
        smtp.send_message(msg)

    print(f"Email sent: {name} <{sender}>")


if __name__ == "__main__":
    main()
