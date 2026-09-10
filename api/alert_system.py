import smtplib
from email.mime.text import MIMEText
import os

def send_sms_alert(phone_number: str, message: str) -> str:
    """
    Sends SMS alert via Twilio client if configured, or logs alert message.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "AC_MOCK_SID_HACKATHON")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "MOCK_TOKEN_HACKATHON")
    
    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        msg = client.messages.create(
            body=message[:160],
            from_=os.getenv("TWILIO_PHONE_NUMBER", "+15005550006"),
            to=phone_number
        )
        print(f"[SMS ALERT] Sent to {phone_number} (SID: {msg.sid})")
        return getattr(msg, 'sid', 'MOCK_SID_SENT')
    except Exception as e:
        print(f"[SMS DISPATCH] TO {phone_number}: {message[:140]}... (Note: {e})")
        return "MOCK_SMS_SENT"

def send_email_alert(email: str, subject: str, body: str):
    """
    Sends SMTP email alert if credentials available, or logs email alert.
    """
    sender = os.getenv("SMTP_SENDER", "floodguard.alert@gmail.com")
    password = os.getenv("SMTP_PASSWORD", "")
    
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = email
    
    if password:
        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(sender, password)
                server.sendmail(sender, email, msg.as_string())
            print(f"[EMAIL ALERT] Sent to {email}")
        except Exception as e:
            print(f"[EMAIL DISPATCH ERROR] ({e})")
    else:
        print(f"[EMAIL DISPATCH] TO {email} Subject: '{subject}' Body length: {len(body)} chars")

def check_and_alert(location: str, prediction: dict, alert_contacts: list):
    """
    Evaluates alert thresholds (CRITICAL, HIGH) and dispatches automated alerts.
    """
    alert_level = prediction.get('alert_level', 'MINIMAL')
    current_prob = prediction['current']['flood_probability']
    max_future_prob = prediction.get('max_probability_next_3h', current_prob)
    
    if alert_level == 'CRITICAL':
        message = (
            f"[CRITICAL FLOOD ALERT] - {location}\n"
            f"Current Flood Prob: {current_prob*100:.1f}%\n"
            f"Max in Next 3h: {max_future_prob*100:.1f}%\n"
            f"Rainfall: {prediction['current']['rainfall_mm']} mm | River: {prediction['current']['river_level_m']} m\n"
            f"IMMEDIATE EVACUATION & ACTION REQUIRED!"
        )
        for contact in alert_contacts:
            if contact.get('type') == 'sms':
                send_sms_alert(contact.get('value'), message)
            elif contact.get('type') == 'email':
                send_email_alert(contact.get('value'), f"[CRITICAL FLOOD ALERT] {location}", message)
                
    elif alert_level == 'HIGH':
        message = (
            f"[HIGH FLOOD RISK] - {location}\n"
            f"Current Flood Prob: {current_prob*100:.1f}%\n"
            f"Max in Next 3h: {max_future_prob*100:.1f}%\n"
            f"Rainfall: {prediction['current']['rainfall_mm']} mm\n"
            f"Monitor situation closely."
        )
        for contact in alert_contacts:
            if contact.get('type') == 'email':
                send_email_alert(contact.get('value'), f"[HIGH FLOOD RISK] {location}", message)
            elif contact.get('type') == 'sms':
                send_sms_alert(contact.get('value'), message)
