import { useState, useRef, useMemo } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0a0a0a; min-height: 100vh; color: #f0f0f0; }
  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; position: relative; }
  .bg-glow { position: fixed; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,180,0,0.1) 0%, transparent 70%); pointer-events: none; z-index: 0; }
  .bg-glow2 { position: fixed; bottom: -100px; left: -100px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(100,100,255,0.06) 0%, transparent 70%); pointer-events: none; z-index: 0; }
  .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: rgba(12,12,12,0.95); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.07); display: flex; z-index: 50; padding: 8px 0 12px; }
  .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0; cursor: pointer; transition: all 0.2s; border: none; background: none; }
  .nav-icon { font-size: 22px; transition: transform 0.2s; }
  .nav-item.active .nav-icon { transform: translateY(-2px); }
  .nav-label { font-size: 10px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #444; transition: color 0.2s; }
  .nav-item.active .nav-label { color: #ffb400; }
  .nav-dot { width: 4px; height: 4px; border-radius: 50%; background: #ffb400; opacity: 0; transition: opacity 0.2s; }
  .nav-item.active .nav-dot { opacity: 1; }
  .page { flex: 1; padding-bottom: 80px; position: relative; z-index: 1; }
  .header { padding: 44px 24px 20px; }
  .header-badge { display: inline-block; background: rgba(255,180,0,0.15); border: 1px solid rgba(255,180,0,0.3); color: #ffb400; font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
  .header h1 { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; line-height: 1.1; color: #fff; }
  .header h1 span { color: #ffb400; }
  .header p { margin-top: 8px; font-size: 14px; color: #666; line-height: 1.6; }
  .meeting-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,180,0,0.1); border: 1px solid rgba(255,180,0,0.2); color: #ffb400; font-size: 12px; padding: 6px 14px; border-radius: 20px; margin: 0 24px 24px; width: fit-content; }
  .content { padding: 0 24px; }
  .upload-zone { border: 1.5px dashed rgba(255,180,0,0.3); border-radius: 20px; padding: 48px 24px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: rgba(255,255,255,0.02); position: relative; }
  .upload-zone:hover { border-color: rgba(255,180,0,0.7); background: rgba(255,180,0,0.04); }
  .upload-icon { width: 64px; height: 64px; background: rgba(255,180,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
  .upload-zone h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .upload-zone p { font-size: 13px; color: #666; }
  .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .card-preview { border-radius: 16px; overflow: hidden; margin-bottom: 20px; position: relative; }
  .card-preview img { width: 100%; height: 180px; object-fit: cover; display: block; }
  .card-preview-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 14px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); display: flex; align-items: center; justify-content: space-between; }
  .card-preview-overlay span { font-size: 12px; color: #aaa; }
  .change-btn { font-size: 12px; color: #ffb400; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; font-weight: 500; }
  .scanning-state { text-align: center; padding: 40px 0; }
  .scan-ring { width: 72px; height: 72px; border-radius: 50%; border: 2px solid rgba(255,180,0,0.15); border-top-color: #ffb400; animation: spin 1s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .scanning-state h3 { font-family: 'Syne', sans-serif; font-size: 18px; color: #fff; margin-bottom: 6px; }
  .scanning-state p { font-size: 13px; color: #666; }
  .results-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .check { width: 32px; height: 32px; background: rgba(80,200,120,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .results-header h3 { font-family: 'Syne', sans-serif; font-size: 17px; color: #fff; font-weight: 700; }
  .results-header p { font-size: 12px; color: #666; }
  .fields-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
  .field-row { padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 3px; }
  .field-row:last-child { border-bottom: none; }
  .field-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #555; }
  .field-input { background: none; border: none; color: #f0f0f0; font-family: 'DM Sans', sans-serif; font-size: 14px; width: 100%; outline: none; padding: 0; }
  .field-input:focus { color: #ffb400; }
  .btn-primary { width: 100%; padding: 15px; background: #ffb400; color: #0a0a0a; border: none; border-radius: 14px; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover { background: #ffc933; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-secondary { width: 100%; padding: 13px; background: transparent; color: #666; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.2s; margin-top: 10px; }
  .btn-secondary:hover { color: #fff; border-color: rgba(255,255,255,0.25); }
  .success-state { text-align: center; padding: 40px 0; }
  .success-icon { width: 80px; height: 80px; background: rgba(80,200,120,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 20px; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .success-state h3 { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 10px; }
  .success-state p { font-size: 14px; color: #666; line-height: 1.6; }
  .success-name { color: #ffb400; font-weight: 600; }
  .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 20px 0; }
  .error-box { background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2); color: #ff6b6b; font-size: 13px; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; line-height: 1.5; }
  .header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .export-btn { flex-shrink: 0; margin-top: 4px; padding: 10px 16px; background: rgba(255,180,0,0.15); border: 1px solid rgba(255,180,0,0.3); color: #ffb400; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .export-btn:hover { background: rgba(255,180,0,0.25); }
  .stats-row { display: flex; gap: 10px; padding: 0 24px; margin-bottom: 16px; }
  .stat-card { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 12px; text-align: center; }
  .stat-num { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #ffb400; }
  .stat-label { font-size: 10px; color: #555; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
  .filters { padding: 0 24px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px; }
  .search-box { position: relative; }
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 15px; color: #555; pointer-events: none; }
  .search-input { width: 100%; padding: 13px 14px 13px 42px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #f0f0f0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
  .search-input::placeholder { color: #444; }
  .search-input:focus { border-color: rgba(255,180,0,0.4); }
  .filter-row { display: flex; gap: 8px; }
  .filter-select { flex: 1; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f0f0f0; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; cursor: pointer; appearance: none; }
  .filter-select option { background: #1a1a1a; }
  .clear-btn { padding: 10px 14px; background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2); border-radius: 10px; color: #ff6b6b; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .results-info { padding: 0 24px; margin-bottom: 10px; font-size: 12px; color: #555; }
  .results-info span { color: #ffb400; font-weight: 500; }
  .members-list { padding: 0 24px; display: flex; flex-direction: column; gap: 10px; }
  .member-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
  .member-card:hover { border-color: rgba(255,180,0,0.2); }
  .member-card.expanded { border-color: rgba(255,180,0,0.3); }
  .member-main { padding: 14px; display: flex; align-items: center; gap: 12px; }
  .member-avatar { width: 42px; height: 42px; border-radius: 10px; background: linear-gradient(135deg, rgba(255,180,0,0.2), rgba(255,100,50,0.2)); border: 1px solid rgba(255,180,0,0.2); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; color: #ffb400; flex-shrink: 0; }
  .member-info { flex: 1; min-width: 0; }
  .member-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .member-biz { font-size: 12px; color: #777; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .member-role-tag { font-size: 10px; padding: 3px 8px; background: rgba(255,180,0,0.1); border: 1px solid rgba(255,180,0,0.15); color: #ffb400; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
  .member-details { padding: 14px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 8px; }
  .detail-row { display: flex; align-items: center; gap: 10px; }
  .detail-icon { font-size: 13px; width: 20px; text-align: center; flex-shrink: 0; }
  .detail-text { font-size: 13px; color: #aaa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .meeting-date-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; color: #555; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 3px 8px; margin-top: 2px; width: fit-content; }
  .empty-state { text-align: center; padding: 60px 24px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }
  .empty-state h3 { font-family: 'Syne', sans-serif; font-size: 18px; color: #444; margin-bottom: 8px; }
  .empty-state p { font-size: 13px; color: #333; }
  .toast { position: fixed; bottom: 88px; left: 50%; transform: translateX(-50%); background: #1a1a1a; border: 1px solid rgba(255,180,0,0.3); color: #ffb400; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 500; z-index: 100; animation: slideUp 0.3s ease; white-space: nowrap; }
  @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
`;

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function exportToCSV(data) {
  const headers = ["Name", "Business", "Role", "Phone", "Email", "Website", "Address", "Meeting Date"];
  const rows = data.map(m => [m.name, m.business, m.role, m.phone, m.email, m.website, m.address, m.meetingDate]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c || ""}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "BNI_Members.csv";
  a.click();
  URL.revokeObjectURL(url);
}

async function scanCardWithGemini(base64, mimeType) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("No Gemini API key found in .env");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: `Extract all contact details from this business card image. Return ONLY a raw JSON object with these exact fields, no markdown, no backticks, no explanation:
{"name":"","business":"","role":"","phone":"","email":"","website":"","address":""}` }
          ]
        }]
      })
    }
  );

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── SCANNER PAGE ──
function ScannerPage({ onMemberAdded }) {
  const [step, setStep] = useState("upload");
  const [image, setImage] = useState(null);
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const handleImage = (file) => {
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      setImage(e.target.result);
      setStep("scanning");
      const base64 = e.target.result.split(",")[1];
      const mimeType = file.type || "image/jpeg";
      try {
        const parsed = await scanCardWithGemini(base64, mimeType);
        setFields(parsed);
        setStep("review");
      } catch (err) {
        setError("Could not read card. Please try again or fill in manually.");
        setFields({});
        setStep("review");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    onMemberAdded(fields);
    setSubmitting(false);
    setStep("success");
  };

  const reset = () => { setStep("upload"); setImage(null); setFields({}); setError(""); };

  const fieldDefs = [
    { key: "name", label: "Full Name" },
    { key: "business", label: "Business / Company" },
    { key: "role", label: "Role / Designation" },
    { key: "phone", label: "Phone Number" },
    { key: "email", label: "Email Address" },
    { key: "website", label: "Website" },
    { key: "address", label: "City / Address" },
  ];

  return (
    <div className="page">
      <div className="header">
        <div className="header-badge">🤝 BNI Network</div>
        <h1>Scan Your<br /><span>Business Card</span></h1>
        <p>Snap a photo — your details go straight to the directory.</p>
      </div>

      <div className="meeting-tag">📅 {today}</div>

      <div className="content">
        {step === "upload" && (
          <div className="upload-zone" onClick={() => fileRef.current.click()}>
            <div className="upload-icon">📇</div>
            <h3>Take a Photo</h3>
            <p>Tap to open camera or upload<br />your business card image</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={e => handleImage(e.target.files[0])}
            />
          </div>
        )}

        {step === "scanning" && (
          <>
            {image && <div className="card-preview"><img src={image} alt="card" /></div>}
            <div className="scanning-state">
              <div className="scan-ring" />
              <h3>Reading your card...</h3>
              <p>Gemini AI is extracting your details</p>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            {image && (
              <div className="card-preview">
                <img src={image} alt="card" />
                <div className="card-preview-overlay">
                  <span>Card scanned ✓</span>
                  <button className="change-btn" onClick={reset}>Change photo</button>
                </div>
              </div>
            )}
            <div className="results-header">
              <div className="check">✅</div>
              <div>
                <h3>Details Extracted</h3>
                <p>Review and edit if needed</p>
              </div>
            </div>
            {error && <div className="error-box">⚠️ {error}</div>}
            <div className="fields-card">
              {fieldDefs.map(({ key, label }) => (
                <div className="field-row" key={key}>
                  <div className="field-label">{label}</div>
                  <input
                    className="field-input"
                    value={fields[key] || ""}
                    onChange={e => setFields({ ...fields, [key]: e.target.value })}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !fields.name}>
              {submitting ? "Saving..." : "✓ Save to BNI Directory"}
            </button>
            <button className="btn-secondary" onClick={reset}>Scan Again</button>
          </>
        )}

        {step === "success" && (
          <div className="success-state">
            <div className="success-icon">🎉</div>
            <h3>You're in the<br />Directory!</h3>
            <p>
              <span className="success-name">{fields.name}</span> from{" "}
              <span className="success-name">{fields.business}</span> has been added.
            </p>
            <div className="divider" />
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={reset}>
              Scan Another Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN PAGE ──
function AdminPage({ members }) {
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState("");

  const months = [...new Set(members.map(m => m.month))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter(m => {
      const matchSearch = !q ||
        m.name?.toLowerCase().includes(q) ||
        m.business?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.address?.toLowerCase().includes(q);
      const matchMonth = !monthFilter || m.month === monthFilter;
      return matchSearch && matchMonth;
    });
  }, [search, monthFilter, members]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleExport = () => {
    exportToCSV(filtered);
    showToast(`✓ Exported ${filtered.length} members to CSV`);
  };

  return (
    <div className="page">
      <div className="header">
        <div className="header-badge">🛡️ Admin Panel</div>
        <div className="header-row">
          <h1>BNI <span>Directory</span></h1>
          <button className="export-btn" onClick={handleExport}>⬇ Export</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{members.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{months.length}</div>
          <div className="stat-label">Months</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{filtered.length}</div>
          <div className="stat-label">Showing</div>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search name, business, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-row">
          <select className="filter-select" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
            <option value="">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(search || monthFilter) && (
            <button className="clear-btn" onClick={() => { setSearch(""); setMonthFilter(""); }}>✕ Clear</button>
          )}
        </div>
      </div>

      <div className="results-info">
        Showing <span>{filtered.length}</span> of {members.length} members
      </div>

      <div className="members-list">
        {members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📇</div>
            <h3>No members yet</h3>
            <p>Scan a business card to add the first member!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try a different search or clear filters</p>
          </div>
        ) : filtered.map(m => (
          <div
            key={m.id}
            className={`member-card ${expanded === m.id ? "expanded" : ""}`}
            onClick={() => setExpanded(expanded === m.id ? null : m.id)}
          >
            <div className="member-main">
              <div className="member-avatar">{getInitials(m.name || "?")}</div>
              <div className="member-info">
                <div className="member-name">{m.name}</div>
                <div className="member-biz">{m.business}</div>
              </div>
              {m.role && <div className="member-role-tag">{m.role.split(" ")[0]}</div>}
            </div>
            {expanded === m.id && (
              <div className="member-details">
                {m.role && <div className="detail-row"><span className="detail-icon">💼</span><span className="detail-text">{m.role}</span></div>}
                {m.phone && <div className="detail-row"><span className="detail-icon">📞</span><span className="detail-text">{m.phone}</span></div>}
                {m.email && <div className="detail-row"><span className="detail-icon">✉️</span><span className="detail-text">{m.email}</span></div>}
                {m.website && <div className="detail-row"><span className="detail-icon">🌐</span><span className="detail-text">{m.website}</span></div>}
                {m.address && <div className="detail-row"><span className="detail-icon">📍</span><span className="detail-text">{m.address}</span></div>}
                <div className="meeting-date-tag">📅 Added {new Date(m.meetingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ── MAIN APP ──
function App() {
  const [tab, setTab] = useState("scan");
  const [members, setMembers] = useState([]);

  const addMember = (fields) => {
    const today = new Date();
    const month = today.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    setMembers(prev => [{
      id: Date.now(),
      ...fields,
      meetingDate: today.toISOString().split("T")[0],
      month,
    }, ...prev]);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <div className="bg-glow" />
        <div className="bg-glow2" />
        {tab === "scan" && <ScannerPage onMemberAdded={addMember} />}
        {tab === "admin" && <AdminPage members={members} />}
        <nav className="bottom-nav">
          <button className={`nav-item ${tab === "scan" ? "active" : ""}`} onClick={() => setTab("scan")}>
            <span className="nav-icon">📇</span>
            <span className="nav-label">Scan Card</span>
            <span className="nav-dot" />
          </button>
          <button className={`nav-item ${tab === "admin" ? "active" : ""}`} onClick={() => setTab("admin")}>
            <span className="nav-icon">🗂️</span>
            <span className="nav-label">Directory</span>
            <span className="nav-dot" />
          </button>
        </nav>
      </div>
    </>
  );
}

export default App;