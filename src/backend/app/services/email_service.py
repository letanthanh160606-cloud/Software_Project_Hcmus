import logging
import smtplib
from email.message import EmailMessage

from app.config import get_settings

logger = logging.getLogger(__name__)


def build_otp_html(otp_code: str, expire_minutes: int = 5) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Omni Platforms - Email Verification</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f0eb; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <h1 style="color: #F5820D; font-size: 26px; margin-top: 0; margin-bottom: 8px;">Omni Platforms</h1>
        <p style="color: #666666; font-size: 15px; margin-bottom: 28px;">Your Personal Content Distributor</p>

        <div style="border-top: 1px solid #eeeeee; margin-bottom: 28px;"></div>

        <p style="color: #333333; font-size: 16px; margin-bottom: 16px;">Hello,</p>
        <p style="color: #555555; font-size: 15px; margin-bottom: 24px;">Your verification code for registration is:</p>

        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #FA4A06; margin: 24px 0; padding: 18px; background: #fef5ed; border-radius: 10px; border: 1px dashed #F5820D;">
            {otp_code}
        </div>

        <p style="color: #888888; font-size: 14px; margin-top: 24px;">This code will expire in <strong>{expire_minutes} minutes</strong>.</p>
        <p style="color: #aaaaaa; font-size: 13px; margin-top: 12px;">If you did not request this verification code, please ignore this email.</p>
    </div>
</body>
</html>"""


def send_otp_email(to_email: str, otp_code: str) -> bool:

    settings = get_settings()

    if not settings.smtp_username or not settings.smtp_password:
        logger.warning(
            f"SMTP_USERNAME or SMTP_PASSWORD not configured. OTP code for {to_email} is: {otp_code}"
        )
        print(f"\n==========================================")
        print(f" [DEV MODE] OTP Code for {to_email}: {otp_code}")
        print(f"==========================================\n")
        return True

    try:
        msg = EmailMessage()
        msg["Subject"] = f"{otp_code} is your Omni Platforms verification code"
        msg["From"] = settings.email_from or settings.smtp_username
        msg["To"] = to_email

        html_content = build_otp_html(otp_code, settings.otp_expire_minutes)
        msg.set_content(
            f"Your verification code is: {otp_code}. It will expire in {settings.otp_expire_minutes} minutes."
        )
        msg.add_alternative(html_content, subtype="html")

        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)

        logger.info(f"Successfully sent OTP email to {to_email}")
        return True

    except Exception as exc:
        logger.error(f"Failed to send OTP email to {to_email}: {exc}")
        print(f"SMTP ERROR: Failed to send email to {to_email}: {exc}")
        print(f"[FALLBACK LOG] OTP Code for {to_email}: {otp_code}")
        return False
