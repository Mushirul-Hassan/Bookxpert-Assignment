import logging
import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("email")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_email(to: list[str], subject: str, body: str) -> None:

    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"\n--- EMAIL (not sent, SMTP not configured) ---\nTo: {to}\nSubject: {subject}\n{body}\n")
        return

    msg = EmailMessage()
    msg["From"] = SMTP_USER
    msg["To"] = ", ".join(to)
    msg["Subject"] = subject
    msg.set_content(body)


    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception:
        logger.exception("Failed to send email to %s", to)


def notify_managers_approval_required(
    manager_emails: list[str], order_id: int, customer_name: str, total: str, created_by: str
) -> None:
    send_email(
        manager_emails,
        f"Approval required: Order #{order_id}",
        f"Order #{order_id} needs your approval.\n\n"
        f"Customer: {customer_name}\n"
        f"Amount: {total}\n"
        f"Created by: {created_by}\n\n"
        f"Please log in to approve or reject it.",
    )


def notify_user_decision(
    user_email: str, order_id: int, decision: str, remarks: str | None, total: str
) -> None:
    send_email(
        [user_email],
        f"Order #{order_id} {decision.lower()}",
        f"Your order #{order_id} (amount {total}) was {decision.lower()} by the manager.\n"
        f"Remarks: {remarks or 'None'}",
    )