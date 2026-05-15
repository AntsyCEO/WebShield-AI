"""
ssl_scanner.py  –  WebShield AI  |  SSL/TLS Analysis Module
------------------------------------------------------------
Place this file at:  scanner/ssl_scanner.py
Usage in app.py:     from scanner.ssl_scanner import scan_ssl
"""

import ssl
import socket
from datetime import datetime, timezone


# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_scheme(url: str) -> str:
    """Remove http:// or https:// and any trailing path so we get a raw hostname."""
    for prefix in ("https://", "http://"):
        if url.startswith(prefix):
            url = url[len(prefix):]
    return url.split("/")[0].split(":")[0]


def _get_cert(hostname: str, port: int = 443, timeout: int = 8) -> dict:
    """Open a TLS connection and return the raw cert dict + negotiated protocol."""
    ctx = ssl.create_default_context()
    conn = ctx.wrap_socket(socket.create_connection((hostname, port), timeout=timeout),
                           server_hostname=hostname)
    cert   = conn.getpeercert()
    proto  = conn.version()        # e.g. "TLSv1.3"
    cipher = conn.cipher()         # (name, protocol, bits)
    conn.close()
    return cert, proto, cipher


def _parse_expiry(cert: dict):
    """Return (expiry_dt, days_remaining, is_expired)."""
    raw = cert.get("notAfter", "")
    try:
        expiry = datetime.strptime(raw, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        now    = datetime.now(timezone.utc)
        delta  = (expiry - now).days
        return expiry.strftime("%Y-%m-%d %H:%M:%S UTC"), delta, delta < 0
    except Exception:
        return raw, None, False


def _parse_issuer(cert: dict) -> str:
    """Flatten the issuer tuple-of-tuples into a readable string."""
    try:
        parts = {k: v for pair in cert.get("issuer", []) for k, v in pair}
        org  = parts.get("organizationName", "")
        cn   = parts.get("commonName", "")
        return f"{org} ({cn})" if org and cn else org or cn or "Unknown"
    except Exception:
        return "Unknown"


def _parse_subject(cert: dict) -> str:
    try:
        parts = {k: v for pair in cert.get("subject", []) for k, v in pair}
        return parts.get("commonName", "Unknown")
    except Exception:
        return "Unknown"


def _sans(cert: dict) -> list:
    try:
        return [v for t, v in cert.get("subjectAltName", []) if t == "DNS"]
    except Exception:
        return []


WEAK_PROTOCOLS = {"SSLv2", "SSLv3", "TLSv1", "TLSv1.1"}

WEAK_CIPHERS = {
    "RC4", "DES", "3DES", "MD5", "EXPORT", "NULL", "anon"
}


def _cipher_is_weak(cipher_name: str) -> bool:
    upper = cipher_name.upper()
    return any(w in upper for w in WEAK_CIPHERS)


def _ssl_risk_score(result: dict) -> dict:
    """
    Return a numeric risk contribution (0-100) from SSL findings only.
    Designed to be ADDED to the header-based score externally.
    """
    score  = 0
    issues = []

    if not result["https_enabled"]:
        score += 40
        issues.append("HTTPS not enabled")

    if result.get("certificate_expired"):
        score += 30
        issues.append("SSL certificate is expired")

    days = result.get("days_until_expiry")
    if days is not None and 0 <= days <= 14:
        score += 15
        issues.append(f"Certificate expires in {days} day(s)")

    if result.get("weak_tls"):
        score += 20
        issues.append(f"Weak TLS version: {result.get('tls_version')}")

    if result.get("weak_cipher"):
        score += 10
        issues.append(f"Weak cipher suite: {result.get('cipher_name')}")

    severity = "LOW"
    if score >= 50:
        severity = "CRITICAL"
    elif score >= 30:
        severity = "HIGH"
    elif score >= 15:
        severity = "MEDIUM"

    return {"ssl_risk_score": min(score, 100), "ssl_severity": severity, "ssl_issues": issues}


# ── Public API ────────────────────────────────────────────────────────────────

def scan_ssl(url: str) -> dict:
    """
    Main entry point.  Returns a JSON-serialisable dict with all SSL/TLS data.
    """
    hostname = _strip_scheme(url)

    base = {
        "hostname":            hostname,
        "https_enabled":       False,
        "tls_version":         None,
        "cipher_name":         None,
        "cipher_bits":         None,
        "weak_tls":            False,
        "weak_cipher":         False,
        "certificate_subject": None,
        "certificate_issuer":  None,
        "certificate_expiry":  None,
        "days_until_expiry":   None,
        "certificate_expired": False,
        "san_domains":         [],
        "error":               None,
    }

    try:
        cert, proto, cipher = _get_cert(hostname)

        base["https_enabled"]       = True
        base["tls_version"]         = proto
        base["cipher_name"]         = cipher[0]
        base["cipher_bits"]         = cipher[2]
        base["weak_tls"]            = proto in WEAK_PROTOCOLS
        base["weak_cipher"]         = _cipher_is_weak(cipher[0])
        base["certificate_subject"] = _parse_subject(cert)
        base["certificate_issuer"]  = _parse_issuer(cert)

        expiry_str, days, expired   = _parse_expiry(cert)
        base["certificate_expiry"]  = expiry_str
        base["days_until_expiry"]   = days
        base["certificate_expired"] = expired
        base["san_domains"]         = _sans(cert)

    except ssl.SSLError as e:
        base["error"] = f"SSL error: {str(e)}"
    except socket.timeout:
        base["error"] = "Connection timed out"
    except ConnectionRefusedError:
        base["error"] = "Connection refused (port 443 closed)"
    except Exception as e:
        base["error"] = str(e)

    # Risk analysis always runs, even on error
    risk = _ssl_risk_score(base)
    base.update(risk)

    return base