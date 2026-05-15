import requests

def scan_headers(url):
    try:
        response = requests.get(url)

        headers = response.headers

        security_headers = {
            "Content-Security-Policy": headers.get("Content-Security-Policy"),
            "X-Frame-Options": headers.get("X-Frame-Options"),
            "Strict-Transport-Security": headers.get("Strict-Transport-Security"),
            "X-Content-Type-Options": headers.get("X-Content-Type-Options")
        }

        missing_headers = []

        for key, value in security_headers.items():
            if value is None:
                missing_headers.append(key)

        return {
            "status": "success",
            "security_headers": security_headers,
            "missing_headers": missing_headers
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }