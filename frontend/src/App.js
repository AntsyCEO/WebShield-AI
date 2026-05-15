import React, { useState } from "react";

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div
      style={{
        background: "rgba(10,10,14,0.85)",
        border: `1px solid ${accent}33`,
        borderRadius: 14,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        backdropFilter: "blur(14px)",
        transition: "border-color 0.25s, box-shadow 0.25s",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent + "88";
        e.currentTarget.style.boxShadow = `0 0 18px ${accent}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = accent + "33";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: 22, lineHeight: 1 }}>{icon}</div>
      <div style={{ color: "#6b7280", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: accent, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ── Severity Badge ─────────────────────────────────────────────────────────────
function SeverityBadge({ level }) {
  const map = {
    CRITICAL: { bg: "#3d0000", border: "#ff2020", text: "#ff6060" },
    HIGH:     { bg: "#2d1000", border: "#ff6320", text: "#ff8c4b" },
    MEDIUM:   { bg: "#2a1d00", border: "#e0a020", text: "#f0c040" },
    LOW:      { bg: "#001f12", border: "#00c97a", text: "#00e888" },
  };
  const s = map[level] || map.LOW;
  return (
    <span style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.text,
      borderRadius: 6,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      ...(level === "CRITICAL" ? { animation: "pulse 1.6s ease-in-out infinite" } : {}),
    }}>{level}</span>
  );
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, level }) {
  const colorMap = { CRITICAL: "#ff2020", HIGH: "#ff6320", MEDIUM: "#e0a020", LOW: "#00c97a" };
  const color = colorMap[level] || "#00c97a";
  const r = 54, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1a1a1f" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s", filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.1em", marginTop: 2 }}>RISK SCORE</div>
      </div>
    </div>
  );
}

// ── Terminal Log ───────────────────────────────────────────────────────────────
function TerminalLog({ lines }) {
  return (
    <div style={{
      background: "#070709", border: "1px solid #1e1e28", borderRadius: 10,
      padding: "16px 18px", fontFamily: "'JetBrains Mono','Fira Mono','Courier New',monospace",
      fontSize: 12, lineHeight: 1.8,
    }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {["#ff5f57","#febc2e","#28c840"].map((c,i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
        ))}
        <span style={{ color: "#4b4b60", fontSize: 11, marginLeft: 6 }}>webshield — scan</span>
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.startsWith("[ERR]") ? "#ff4d4d" : l.startsWith("[OK]") ? "#00c97a" : l.startsWith("[WARN]") ? "#f0c040" : "#a0a0b8" }}>
          <span style={{ color: "#3d3d55", userSelect: "none" }}>$ </span>{l}
        </div>
      ))}
      <div style={{ color: "#ff3b3b", marginTop: 4 }}>
        <span style={{ color: "#3d3d55" }}>$ </span>
        <span style={{ borderRight: "2px solid #ff3b3b", paddingRight: 2, animation: "blink 1s step-end infinite" }}> </span>
      </div>
    </div>
  );
}

// ── SSL Status Pill ────────────────────────────────────────────────────────────
function SSLPill({ ok, label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: ok ? "rgba(0,201,122,0.08)" : "rgba(255,30,30,0.08)",
      border: `1px solid ${ok ? "rgba(0,201,122,0.25)" : "rgba(255,30,30,0.25)"}`,
      color: ok ? "#00c97a" : "#ff5050",
      borderRadius: 6, padding: "3px 9px",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
    }}>
      <span>{ok ? "●" : "●"}</span>{label}
    </span>
  );
}

// ── SSL/TLS Card ───────────────────────────────────────────────────────────────
function SSLCard({ ssl }) {
  if (!ssl) return null;

  const expired    = ssl.certificate_expired;
  const soonExpiry = ssl.days_until_expiry !== null && ssl.days_until_expiry >= 0 && ssl.days_until_expiry <= 14;
  const expiryColor = expired ? "#ff4040" : soonExpiry ? "#f0c040" : "#00c97a";

  const tlsColorMap = { "TLSv1.3": "#00c97a", "TLSv1.2": "#f0c040", "TLSv1.1": "#ff6320", "TLSv1": "#ff4040", "SSLv3": "#ff2020" };
  const tlsColor = ssl.tls_version ? (tlsColorMap[ssl.tls_version] || "#a0a0b8") : "#6b7280";

  const rows = [
    { label: "HTTPS Enabled",  value: ssl.https_enabled ? "Yes" : "No",          color: ssl.https_enabled ? "#00c97a" : "#ff4040" },
    { label: "TLS Version",    value: ssl.tls_version || "N/A",                  color: tlsColor },
    { label: "Cipher Suite",   value: ssl.cipher_name || "N/A",                  color: ssl.weak_cipher ? "#ff6320" : "#a0a0b8" },
    { label: "Key Strength",   value: ssl.cipher_bits ? `${ssl.cipher_bits} bit` : "N/A", color: ssl.cipher_bits >= 256 ? "#00c97a" : "#f0c040" },
    { label: "Issuer",         value: ssl.certificate_issuer || "N/A",            color: "#a0a0b8" },
    { label: "Subject",        value: ssl.certificate_subject || "N/A",           color: "#a0a0b8" },
    { label: "Expiry",         value: ssl.certificate_expiry || "N/A",            color: expiryColor },
    { label: "Days Remaining", value: ssl.days_until_expiry !== null ? `${ssl.days_until_expiry} days` : "N/A", color: expiryColor },
  ];

  return (
    <div className="glass-card result-anim" style={{ marginBottom: 18 }}>
      {/* Header */}
      <div className="header-row">
        <div className="dot" style={{ background: ssl.https_enabled ? "#00c97a" : "#ff3030", boxShadow: `0 0 6px ${ssl.https_enabled ? "#00c97a" : "#ff3030"}` }} />
        <span className="card-title">SSL / TLS Analysis</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <SSLPill ok={ssl.https_enabled}        label={ssl.https_enabled ? "HTTPS ON" : "NO HTTPS"} />
          <SSLPill ok={!ssl.weak_tls}            label={ssl.weak_tls ? "WEAK TLS" : "STRONG TLS"} />
          <SSLPill ok={!ssl.certificate_expired} label={ssl.certificate_expired ? "CERT EXPIRED" : "CERT VALID"} />
        </div>
      </div>

      {/* Error state */}
      {ssl.error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(255,30,30,0.06)", border: "1px solid rgba(255,30,30,0.2)", borderRadius: 8, marginBottom: 14, fontFamily: "monospace", fontSize: 12, color: "#ff7070" }}>
          <span style={{ color: "#ff3030" }}>▲</span>
          <span>{ssl.error}</span>
        </div>
      )}

      {/* Two-column grid of detail rows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        {rows.map(({ label, value, color }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
            fontSize: 12, gap: 12,
          }}>
            <span style={{ color: "#6b7280", letterSpacing: "0.04em", flexShrink: 0 }}>{label}</span>
            <span style={{ color, fontFamily: "'JetBrains Mono',monospace", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* SAN domains */}
      {ssl.san_domains && ssl.san_domains.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
            Subject Alt Names ({ssl.san_domains.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ssl.san_domains.slice(0, 12).map((d, i) => (
              <span key={i} style={{
                fontFamily: "monospace", fontSize: 11,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 5, padding: "3px 8px", color: "#a0a0b8",
              }}>{d}</span>
            ))}
            {ssl.san_domains.length > 12 && (
              <span style={{ fontSize: 11, color: "#4b4b60", padding: "3px 8px" }}>+{ssl.san_domains.length - 12} more</span>
            )}
          </div>
        </div>
      )}

      {/* SSL issues list */}
      {ssl.ssl_issues && ssl.ssl_issues.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
            SSL Issues ({ssl.ssl_issues.length})
          </div>
          {ssl.ssl_issues.map((issue, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 7,
              background: "rgba(255,30,30,0.06)", border: "1px solid rgba(255,30,30,0.15)",
              marginBottom: 6, fontSize: 12, color: "#e0b0b0",
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              <span style={{ color: "#ff3030" }}>▲</span>{issue}
            </div>
          ))}
        </div>
      )}

      {/* SSL Risk footer */}
      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: 11, color: "#6b7280" }}>SSL Risk Contribution</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, height: 5, background: "#1a1a24", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${ssl.ssl_risk_score || 0}%`, height: "100%",
              background: ssl.ssl_risk_score >= 50 ? "#ff2020" : ssl.ssl_risk_score >= 25 ? "#f0c040" : "#00c97a",
              borderRadius: 3, transition: "width 0.8s ease" }} />
          </div>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#e0e0f0", fontWeight: 700 }}>
            {ssl.ssl_risk_score || 0}%
          </span>
          <SeverityBadge level={ssl.ssl_severity || "LOW"} />
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [url, setUrl]           = useState("");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [termLines, setTermLines] = useState([]);

  const scanWebsite = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);
    setTermLines([]);

    const steps = [
      "[+] Initializing WebShield scanner v3.5.0...",
      "[+] Resolving target: " + url,
      "[+] Probing HTTP/HTTPS endpoints...",
      "[+] Enumerating response headers...",
      "[+] Checking Content-Security-Policy...",
      "[+] Checking Strict-Transport-Security...",
      "[+] Checking X-Frame-Options...",
      "[+] Checking Referrer-Policy...",
      "[+] Opening TLS handshake on :443...",
      "[+] Inspecting SSL certificate chain...",
      "[+] Evaluating cipher suite strength...",
      "[+] Calculating combined threat vector score...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 220));
      setTermLines(prev => [...prev, steps[i]]);
    }

    try {
      // Use the new combined full-scan endpoint
      const response = await fetch(`http://127.0.0.1:5000/scan/full?url=${encodeURIComponent(url)}`);
      const data     = await response.json();

      const issueCount = (data.missing_headers?.length || 0) + (data.ssl?.ssl_issues?.length || 0);
      setTermLines(prev => [
        ...prev,
        `[OK] Scan complete — ${issueCount} issue(s) found | Combined risk: ${data.combined_score || 0}%`,
      ]);
      setResult(data);
    } catch (error) {
      setTermLines(prev => [...prev, "[ERR] Connection failed: " + error.message]);
      alert("Scan failed — ensure the backend is running.");
    }
    setLoading(false);
  };

  // Use combined_score when available, fall back to header-only calculation
  const getRiskScore = () => {
    if (!result) return 0;
    if (result.combined_score !== undefined) return result.combined_score;
    return Math.min((result.missing_headers?.length || 0) * 25, 100);
  };

  const getRiskLevel = () => {
    const s = getRiskScore();
    if (s >= 60) return "CRITICAL";
    if (s >= 40) return "HIGH";
    if (s >= 20) return "MEDIUM";
    return "LOW";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { min-height: 100vh; }
        body { font-family: 'DM Sans', system-ui, sans-serif; background: #07070a; color: #d4d4e0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d12; }
        ::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 3px; }

        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.6} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,30,30,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,30,30,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .result-anim { animation: fadeIn 0.4s ease forwards; }

        .nav-link { color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;padding:6px 12px;border-radius:6px;transition:color .2s,background .2s;letter-spacing:.02em; }
        .nav-link:hover { color:#e0e0f0;background:rgba(255,255,255,0.05); }
        .nav-link.active { color:#ff4040; }

        .scan-input { background:rgba(10,10,18,.9);border:1px solid #1e1e30;color:#e0e0f0;border-radius:10px;padding:14px 18px;font-size:14px;font-family:'JetBrains Mono',monospace;outline:none;width:100%;transition:border-color .2s,box-shadow .2s; }
        .scan-input:focus { border-color:#ff3030;box-shadow:0 0 0 3px rgba(255,30,30,.12); }
        .scan-input::placeholder { color:#3d3d55; }

        .scan-btn { background:linear-gradient(135deg,#cc1a1a 0%,#991010 100%);border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;letter-spacing:.05em;padding:14px 28px;cursor:pointer;white-space:nowrap;transition:transform .15s,box-shadow .2s,filter .2s;box-shadow:0 0 14px rgba(200,20,20,.35); }
        .scan-btn:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 0 22px rgba(220,30,30,.5);filter:brightness(1.1); }
        .scan-btn:active:not(:disabled) { transform:scale(.98); }
        .scan-btn:disabled { opacity:.55;cursor:not-allowed; }

        .glass-card { background:rgba(10,10,18,.82);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:24px;backdrop-filter:blur(16px);transition:border-color .25s; }
        .glass-card:hover { border-color:rgba(255,255,255,.1); }

        .header-row { display:flex;align-items:center;gap:8px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.05); }
        .card-title { font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6b7280; }
        .dot { width:6px;height:6px;border-radius:50%;background:#ff3030;box-shadow:0 0 6px #ff3030;flex-shrink:0; }

        .missing-item { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;background:rgba(255,30,30,.06);border:1px solid rgba(255,30,30,.15);margin-bottom:8px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#e0b0b0;transition:background .2s; }
        .missing-item:hover { background:rgba(255,30,30,.1); }

        .present-item { display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12.5px;gap:12px; }
        .present-item:last-child { border-bottom:none; }
        .present-key { font-family:'JetBrains Mono',monospace;color:#00c97a;flex-shrink:0; }
        .present-val { color:#6b7280;font-family:'JetBrains Mono',monospace;text-align:right;word-break:break-all; }

        .rec-item { display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;color:#a0a0b8; }
        .rec-item:last-child { border-bottom:none; }
        .rec-num { font-family:'JetBrains Mono',monospace;font-size:11px;color:#ff4040;background:rgba(255,30,30,.1);border:1px solid rgba(255,30,30,.2);border-radius:4px;padding:2px 6px;flex-shrink:0;margin-top:1px; }

        @media (max-width:768px) {
          .stats-grid { grid-template-columns:1fr 1fr !important; }
          .results-grid { grid-template-columns:1fr !important; }
          .scan-row { flex-direction:column !important; }
          .nav-links-wrap { display:none !important; }
          .ssl-detail-grid { grid-template-columns:1fr !important; }
        }
        @media (max-width:480px) { .stats-grid { grid-template-columns:1fr !important; } }
      `}</style>

      <div className="grid-bg" style={{ minHeight: "100vh", position: "relative" }}>
        {/* Glows */}
        <div style={{ position:"fixed",top:-120,left:-120,width:440,height:440,background:"radial-gradient(circle,rgba(180,10,10,.18) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }} />
        <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden",opacity:.025 }}>
          <div style={{ width:"100%",height:2,background:"linear-gradient(transparent,rgba(255,30,30,.8),transparent)",animation:"scanline 6s linear infinite" }} />
        </div>

        {/* Navbar */}
        <nav style={{ position:"sticky",top:0,zIndex:50,background:"rgba(7,7,10,.88)",borderBottom:"1px solid rgba(255,255,255,.06)",backdropFilter:"blur(20px)",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60 }}>
          <div style={{ display:"flex",alignItems:"center",gap:28 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:30,height:30,background:"linear-gradient(135deg,#cc1a1a,#991010)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:"0 0 14px rgba(200,20,20,.4)" }}>🛡</div>
              <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#f0f0f8",letterSpacing:"-0.3px" }}>
                WebShield<span style={{ color:"#ff3030" }}>AI</span>
              </span>
            </div>
            <div className="nav-links-wrap" style={{ display:"flex",gap:2 }}>
              {["Dashboard","Threats","Reports","Intel"].map((n,i) => (
                <span key={n} className={`nav-link${i===0?" active":""}`}>{n}</span>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(0,201,122,.08)",border:"1px solid rgba(0,201,122,.2)",borderRadius:6,padding:"5px 10px" }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"#00c97a",animation:"pulse 2s ease-in-out infinite" }} />
              <span style={{ color:"#00c97a",fontSize:11,fontWeight:600,letterSpacing:".05em" }}>SYSTEMS ONLINE</span>
            </div>
            <div style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,cursor:"pointer" }}>⚙</div>
          </div>
        </nav>

        {/* Main */}
        <main style={{ position:"relative",zIndex:10,maxWidth:1200,margin:"0 auto",padding:"40px 28px 80px" }}>

          {/* Hero */}
          <div style={{ marginBottom:36 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,30,30,.08)",border:"1px solid rgba(255,30,30,.2)",borderRadius:20,padding:"4px 12px",marginBottom:16 }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:"#ff4040",animation:"pulse 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize:11,color:"#ff6060",fontWeight:600,letterSpacing:".1em" }}>SECURITY OPERATIONS CENTER</span>
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,5vw,44px)",fontWeight:800,letterSpacing:"-1px",color:"#f4f4f8",lineHeight:1.1,marginBottom:12 }}>
              Advanced Vulnerability<br/>
              <span style={{ color:"#ff3030" }}>Scanner</span>
            </h1>
            <p style={{ color:"#6b7280",fontSize:15,maxWidth:520,lineHeight:1.65 }}>
              Real-time analysis of security headers, SSL/TLS certificates, and threat vectors. Enterprise-grade reconnaissance at your fingertips.
            </p>
          </div>

          {/* Stats Row */}
          <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:32 }}>
            <StatCard icon="🔍" label="Scans Today"    value="—"  sub="Ready to scan"   accent="#ff3030" />
            <StatCard icon="⚠️" label="Threats Found"  value={result ? (result.missing_headers?.length || 0) + (result.ssl?.ssl_issues?.length || 0) : "—"} sub={result ? "Total issues" : "Awaiting scan"} accent="#ff6320" />
            <StatCard icon="🔒" label="SSL Status"     value={result ? (result.ssl?.https_enabled ? "SECURE" : "INSECURE") : "—"} sub={result ? (result.ssl?.tls_version || "No TLS") : "Awaiting scan"} accent="#00c97a" />
            <StatCard icon="📡" label="Risk Score"     value={result ? getRiskScore() + "%" : "—"} sub={result ? getRiskLevel() + " risk" : "Awaiting scan"} accent="#e0a020" />
          </div>

          {/* Scan Box */}
          <div className="glass-card" style={{ marginBottom:28 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:18 }}>
              <div className="dot" />
              <span className="card-title">Target Reconnaissance</span>
            </div>
            <div className="scan-row" style={{ display:"flex",gap:12,alignItems:"stretch" }}>
              <div style={{ position:"relative",flex:1 }}>
                <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#3d3d55",fontSize:13,fontFamily:"monospace",pointerEvents:"none" }}>https://</span>
                <input className="scan-input" type="text" placeholder="target-domain.com"
                  value={url} onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && scanWebsite()}
                  style={{ paddingLeft:72 }} />
              </div>
              <button className="scan-btn" onClick={scanWebsite} disabled={loading || !url}>
                {loading ? "⟳  Scanning..." : "⚡ Launch Scan"}
              </button>
            </div>
            <div style={{ marginTop:10,display:"flex",gap:16,flexWrap:"wrap" }}>
              {["HTTP Headers","TLS Config","SSL Certificate","Cipher Audit","Expiry Check"].map(t => (
                <span key={t} style={{ fontSize:11,color:"#3d3d55",display:"flex",alignItems:"center",gap:4 }}>
                  <span style={{ color:"#00c97a" }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Terminal */}
          {termLines.length > 0 && (
            <div style={{ marginBottom:28 }} className="result-anim">
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                <div className="dot" />
                <span className="card-title">Scan Output</span>
              </div>
              <TerminalLog lines={termLines} />
            </div>
          )}

          {/* ── Results ── */}
          {result && (
            <div className="result-anim">

              {/* SSL/TLS Card — full width above the two-column grid */}
              <SSLCard ssl={result.ssl} />

              {/* Two-column grid: threat score left, headers right */}
              <div className="results-grid" style={{ display:"grid",gridTemplateColumns:"300px 1fr",gap:18,alignItems:"start" }}>

                {/* Left column */}
                <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

                  {/* Combined Threat Score */}
                  <div className="glass-card" style={{ textAlign:"center" }}>
                    <div className="header-row" style={{ justifyContent:"center" }}>
                      <div className="dot" />
                      <span className="card-title">Combined Threat Score</span>
                    </div>
                    <div style={{ display:"flex",justifyContent:"center",marginBottom:18 }}>
                      <ScoreRing score={getRiskScore()} level={getRiskLevel()} />
                    </div>
                    <SeverityBadge level={getRiskLevel()} />
                    <div style={{ marginTop:16,display:"flex",flexDirection:"column",gap:8 }}>
                      {[
                        { l:"Missing Headers", v: result.missing_headers?.length || 0, c:"#ff4040" },
                        { l:"Present Headers",  v: Object.keys(result.security_headers || {}).length, c:"#00c97a" },
                        { l:"SSL Issues",       v: result.ssl?.ssl_issues?.length || 0, c: result.ssl?.ssl_issues?.length ? "#ff6320" : "#00c97a" },
                        { l:"SSL Risk Score",   v: `${result.ssl?.ssl_risk_score || 0}%`, c:"#e0a020" },
                      ].map(r => (
                        <div key={r.l} style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"#6b7280" }}>
                          <span>{r.l}</span>
                          <span style={{ color:r.c,fontWeight:700,fontFamily:"monospace" }}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="glass-card">
                    <div className="header-row">
                      <div className="dot" />
                      <span className="card-title">Recommendations</span>
                    </div>
                    {[
                      "Enable Content-Security-Policy",
                      "Use Strict-Transport-Security",
                      "Enable X-Content-Type-Options",
                      "Prevent clickjacking with X-Frame-Options",
                      "Upgrade TLS to 1.3+",
                      "Renew certificate before expiry",
                    ].map((r, i) => (
                      <div key={i} className="rec-item">
                        <span className="rec-num">R{String(i+1).padStart(2,"0")}</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column: headers */}
                <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                  <div className="glass-card">
                    <div className="header-row">
                      <div className="dot" />
                      <span className="card-title">Missing Security Headers</span>
                      <span style={{ marginLeft:"auto",background:"rgba(255,30,30,.12)",border:"1px solid rgba(255,30,30,.25)",color:"#ff5050",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700 }}>
                        {result.missing_headers?.length || 0} critical
                      </span>
                    </div>
                    {result.missing_headers?.length > 0 ? (
                      result.missing_headers.map((h, i) => (
                        <div key={i} className="missing-item">
                          <span style={{ color:"#ff3030",fontSize:14 }}>▲</span>
                          <span style={{ flex:1 }}>{h}</span>
                          <span style={{ color:"#4d2020",fontSize:10,letterSpacing:".06em" }}>NOT SET</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color:"#00c97a",fontSize:13,display:"flex",alignItems:"center",gap:8 }}>
                        <span>✅</span> All critical security headers detected.
                      </div>
                    )}
                  </div>

                  <div className="glass-card">
                    <div className="header-row">
                      <div className="dot" style={{ background:"#00c97a",boxShadow:"0 0 6px #00c97a" }} />
                      <span className="card-title">Detected Security Headers</span>
                      <span style={{ marginLeft:"auto",background:"rgba(0,201,122,.08)",border:"1px solid rgba(0,201,122,.2)",color:"#00c97a",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700 }}>
                        {Object.keys(result.security_headers || {}).length} found
                      </span>
                    </div>
                    {Object.entries(result.security_headers || {}).length > 0 ? (
                      Object.entries(result.security_headers).map(([k, v]) => (
                        <div key={k} className="present-item">
                          <span className="present-key">{k}</span>
                          <span className="present-val">{typeof v === "string" ? v : JSON.stringify(v)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color:"#ff4040",fontSize:13 }}>No security headers detected.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}