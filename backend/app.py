from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner.headers import scan_headers
from scanner.ssl_scanner import scan_ssl

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "WebShield AI Backend Running"


# ── Existing: Header Scan ─────────────────────────────────────────────────────
@app.route("/scan", methods=["GET"])
def scan():
    url = request.args.get("url")
    if not url:
        return jsonify({"status": "error", "message": "URL is required"})
    return jsonify(scan_headers(url))


# ── New: SSL/TLS Scan ─────────────────────────────────────────────────────────
@app.route("/scan/ssl", methods=["GET"])
def scan_ssl_route():
    url = request.args.get("url")
    if not url:
        return jsonify({"status": "error", "message": "URL is required"})
    return jsonify(scan_ssl(url))


# ── New: Combined Full Scan ───────────────────────────────────────────────────
@app.route("/scan/full", methods=["GET"])
def scan_full():
    """Run both header and SSL scans and merge results into one response."""
    url = request.args.get("url")
    if not url:
        return jsonify({"status": "error", "message": "URL is required"})

    headers_result = scan_headers(url)
    ssl_result     = scan_ssl(url)

    # Merge combined risk score
    header_score   = len(headers_result.get("missing_headers", [])) * 25
    ssl_score      = ssl_result.get("ssl_risk_score", 0)
    combined_score = min(header_score + ssl_score, 100)

    if combined_score >= 60:
        combined_severity = "CRITICAL"
    elif combined_score >= 40:
        combined_severity = "HIGH"
    elif combined_score >= 20:
        combined_severity = "MEDIUM"
    else:
        combined_severity = "LOW"

    return jsonify({
        **headers_result,
        "ssl":              ssl_result,
        "combined_score":   combined_score,
        "combined_severity": combined_severity,
    })


if __name__ == "__main__":
    app.run(debug=True)