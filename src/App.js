import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://malindu12-sinhala-meme-api.hf.space";

// ==========================================
// 🌍 Translation Dictionary (Updated Names)
// ==========================================
const translations = {
  si: {
    navHome: "🏠 මුල් පිටුව", navDash: "📊 Dashboard", langSwitch: "English",
    heroTitle: "Sinhala Meme Detector", heroSub: "ඔබේ මීම් එක පහතින් අප්ලෝඩ් කර, එය ද්වේශසහගත ද නැද්ද යන්න AI හරහා දැනගන්න.",
    selectImg: "📸 මීම් පින්තූරය තෝරන්න:", dropHere: "මෙතන අතාරින්න...", dragDrop: "පින්තූරය මෙතනට අදින්න (Drag & Drop) හෝ Click කරන්න",
    textLabel: "✍️ මීම් එකේ අකුරු පේළිය (විකල්ප):", textPlaceholder: "අවශ්‍ය නම් පමණක් මෙහි ටයිප් කරන්න... නැතහොත් AI විසින් අකුරු කියවනු ඇත.",
    analyzeBtn: "🚀 ප්‍රතිඵලය පරීක්ෂා කරන්න", analyzing: "⏳ AI එක කියවමින් පවතී...",
    hatefulResult: "මෙය ද්වේශසහගත මීම් එකකි", nonHatefulResult: "මෙය සාමාන්‍ය මීම් එකකි", confidence: "විශ්වාසය:",
    reportBtn: "🚩 Report", exportBtn: "📥 දත්ත බාගත කරන්න (CSV)", searchPlaceholder: "අකුරු වලින් සොයන්න...", filterAll: "සියල්ල",
  },
  en: {
    navHome: "🏠 Home", navDash: "📊 Dashboard", langSwitch: "සිංහල",
    heroTitle: "Sinhala Meme Detector", heroSub: "Upload your meme below and let AI determine if it contains hateful content.",
    selectImg: "📸 Select Meme Image:", dropHere: "Drop it here...", dragDrop: "Drag & Drop image here or Click to browse",
    textLabel: "✍️ Meme Text (Optional):", textPlaceholder: "Type text here if needed... otherwise AI will extract it via OCR.",
    analyzeBtn: "🚀 Analyze Meme", analyzing: "⏳ AI is analyzing...",
    hatefulResult: "Hateful Content Detected", nonHatefulResult: "Safe / Normal Meme", confidence: "Confidence Score:",
    reportBtn: "🚩 Report Wrong", exportBtn: "📥 Export to CSV", searchPlaceholder: "Search by text...", filterAll: "All",
  }
};

// ==========================================
// 🎨 Premium CSS Styling
// ==========================================
const customStyles = `
  body { 
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    min-height: 100vh;
  }
  .meme-card { 
    border-radius: 24px; 
    border: none; 
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.08)!important;
  }
  .drop-zone { 
    background-color: #f8fbff;
    border: 2px dashed #a1c4fd;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease; 
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .drop-zone:hover { background-color: #eef5ff; border-color: #66a6ff; }
  .drop-zone.active { background-color: #e0f0ff; border: 3px dashed #0d6efd; transform: scale(1.02); }
  .text-area-custom {
    border-radius: 20px;
    border: 1px solid #e0e0e0;
    background-color: #fafafa;
    resize: none;
    transition: all 0.3s ease;
  }
  .text-area-custom:focus { border-color: #667eea; box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25); background-color: #ffffff; outline: none; }
  .btn-gradient { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    border: none; color: white; font-weight: 600; letter-spacing: 0.5px;
    box-shadow: 0 10px 20px rgba(118, 75, 162, 0.3); transition: all 0.3s ease; 
  }
  .btn-gradient:hover { background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); transform: translateY(-2px); color: white; }
  .navbar-custom { background: rgba(33, 37, 41, 0.95) !important; backdrop-filter: blur(10px); }
  .table-container { max-height: 450px; overflow-y: auto; border-radius: 10px; }
`;

function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  return (
    <Router>
      <style>{customStyles}</style>
      <div className="d-flex flex-column min-vh-100">
        <Header lang={lang} setLang={setLang} t={t} />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home t={t} />} />
            <Route path="/dashboard" element={<Dashboard t={t} />} />
          </Routes>
        </main>
        <footer className="py-4 text-center text-dark opacity-75 fw-semibold mt-auto">
          <small>&copy; 2026 Sinhala Meme Detector AI Team</small>
        </footer>
      </div>
    </Router>
  );
}

function Header({ lang, setLang, t }) {
  const location = useLocation();
  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm sticky-top">
      <div className="container py-1">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="fs-2 me-2">🤖</span>
          <div>
            <span className="fw-bold fs-4" style={{letterSpacing: '1px'}}>Sinhala Meme Detector</span><br/>
            <small className="text-white-50" style={{fontSize: '0.75rem', fontWeight: '500'}}>Research Prototype</small>
          </div>
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center fs-5">
            <li className="nav-item me-3"><Link className={`nav-link fw-semibold ${location.pathname === '/' ? 'active text-info' : ''}`} to="/">{t.navHome}</Link></li>
            <li className="nav-item me-4"><Link className={`nav-link fw-semibold ${location.pathname === '/dashboard' ? 'active text-info' : ''}`} to="/dashboard">{t.navDash}</Link></li>
            <li className="nav-item mt-2 mt-lg-0"><button className="btn btn-light btn-sm rounded-pill px-4 fw-bold text-primary shadow-sm" onClick={() => setLang(lang === 'si' ? 'en' : 'si')}>🌍 {t.langSwitch}</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Home({ t }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please select an image first!");
    setLoading(true);
    setResult(null);

    const fd = new FormData(); 
    fd.append('file', image); 
    fd.append('text', text || " "); // Added text input back!

    try {
      const res = await axios.post(`${API_BASE_URL}/predict`, fd);
      setResult(res.data);
    } catch (e) { alert("API Connection Error!"); }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card meme-card p-4 p-md-5">
            <div className="text-center mb-5">
              <h1 className="fw-bolder text-primary mb-2" style={{background: 'linear-gradient(45deg, #1e3c72, #2a5298)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{t.heroTitle}</h1>
              <p className="text-secondary fs-5">{t.heroSub}</p>
            </div>
            
            <form onSubmit={handlePredict}>
              <div className="row g-4 mb-4">
                {/* Left Column: Image Upload */}
                <div className="col-md-6">
                  <label className="form-label fw-bold fs-5">{t.selectImg}</label>
                  <div 
                    className={`drop-zone p-3 text-center ${isDragging ? 'active' : ''}`}
                    onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {e.preventDefault(); setIsDragging(false); onFileSelect(e.dataTransfer.files[0]);}}
                    onClick={() => document.getElementById('inp').click()}
                  >
                    {preview ? (
                      <img src={preview} className="img-fluid rounded shadow-sm" style={{maxHeight: '190px', objectFit: 'contain'}} alt="preview" />
                    ) : (
                      <div className="text-primary opacity-75">
                        <i className="fs-1 mb-2 d-block">📥</i>
                        <span className="fw-bold">{t.dragDrop}</span>
                      </div>
                    )}
                    <input type="file" id="inp" hidden accept="image/*" onChange={(e) => onFileSelect(e.target.files[0])} />
                  </div>
                </div>

                {/* Right Column: Text Input */}
                <div className="col-md-6 d-flex flex-column">
                  <label className="form-label fw-bold fs-5">{t.textLabel}</label>
                  <textarea 
                    className="form-control text-area-custom flex-grow-1 p-4 fs-5" 
                    placeholder={t.textPlaceholder} 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-gradient btn-lg w-100 mt-4 rounded-pill py-3 fs-4" disabled={loading}>
                {loading ? <span><span className="spinner-border spinner-border-sm me-2"></span>{t.analyzing}</span> : t.analyzeBtn}
              </button>
            </form>
            
            {/* Beautiful Result Alert */}
            {result && (
              <div className={`alert mt-5 rounded-4 p-4 text-center border-0 shadow-sm ${result.prediction === 'HATEFUL' ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                <h2 className="fw-bolder mb-3">{result.prediction === 'HATEFUL' ? `🚨 ${result.prediction}` : `✅ ${result.prediction}`}</h2>
                <p className="fs-4 mb-4 opacity-75">{result.prediction === 'HATEFUL' ? t.hatefulResult : t.nonHatefulResult}</p>
                <div className="d-inline-flex bg-white text-dark px-4 py-2 rounded-pill shadow-sm mb-4">
                  <span className="fw-semibold me-2">{t.confidence}</span>
                  <span className="badge bg-dark fs-5 px-3 rounded-pill">{result.confidence}%</span>
                </div>
                <hr className="border-white opacity-25" />
                <button className="btn btn-sm btn-light text-danger fw-bold rounded-pill px-4 mt-2 shadow-sm">{t.reportBtn}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ t }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchHistory = () => axios.get(`${API_BASE_URL}/dashboard-data`).then(r => setData(r.data));
  useEffect(() => { fetchHistory(); }, []);

  const deleteOne = (id) => {
    if(window.confirm("Are you sure?")) axios.delete(`${API_BASE_URL}/delete-history/${id}`).then(() => fetchHistory());
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Time,Text,Result,Confidence\n";
    data.history.forEach(r => csvContent += `${r.id},${r.time},"${r.text}",${r.prediction},${r.confidence}%\n`);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a"); link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sinhala_meme_detector_history.csv"); document.body.appendChild(link);
    link.click();
  };

  const filteredHistory = data?.history.filter(item => 
    (filter === "ALL" || item.prediction === filter) &&
    (item.text.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5 bg-white p-4 rounded-4 shadow-sm" style={{background: 'rgba(255,255,255,0.8)'}}>
        <h2 className="fw-bolder text-primary m-0">{t.navDash}</h2>
        <button className="btn btn-success rounded-pill fw-bold shadow-sm px-4" onClick={exportCSV}>{t.exportBtn}</button>
      </div>
      
      {data && (
        <>
          <div className="row g-4 mb-5 text-center">
            <div className="col-md-4"><div className="card meme-card p-4" style={{background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', color: 'white'}}><h5>Total Checked</h5><h2 className="display-4 fw-bold m-0">{data.total_checked}</h2></div></div>
            <div className="col-md-4"><div className="card meme-card p-4" style={{background: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)', color: 'white'}}><h5>Hateful</h5><h2 className="display-4 fw-bold m-0">{data.hateful_total}</h2></div></div>
            <div className="col-md-4"><div className="card meme-card p-4" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white'}}><h5>Safe</h5><h2 className="display-4 fw-bold m-0">{data.non_hateful_total}</h2></div></div>
          </div>

          <div className="card meme-card p-4">
            <div className="row mb-4 g-3">
              <div className="col-md-8"><input type="text" className="form-control form-control-lg rounded-pill px-4 bg-light border-0" placeholder={t.searchPlaceholder} onChange={(e) => setSearch(e.target.value)} /></div>
              <div className="col-md-4">
                <select className="form-select form-select-lg rounded-pill px-4 bg-light border-0 fw-semibold text-secondary" onChange={(e) => setFilter(e.target.value)}>
                  <option value="ALL">{t.filterAll}</option><option value="HATEFUL">Hateful Only</option><option value="NON-HATEFUL">Safe Only</option>
                </select>
              </div>
            </div>
            <div className="table-responsive table-container border border-light">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark sticky-top">
                  <tr><th className="py-3 px-4 border-0">Time</th><th className="py-3 px-4 border-0">Text</th><th className="py-3 px-4 border-0 text-center">Result</th><th className="py-3 px-4 border-0 text-center">Action</th></tr>
                </thead>
                <tbody className="bg-white">
                  {filteredHistory?.map(item => (
                    <tr key={item.id} className="border-bottom">
                      <td className="px-4 text-secondary"><small>{item.time}</small></td>
                      <td className="px-4 fw-medium">{item.text || <span className="text-danger small bg-danger bg-opacity-10 px-2 py-1 rounded">No text</span>}</td>
                      <td className="text-center px-4"><span className={`badge px-3 py-2 rounded-pill shadow-sm ${item.prediction === 'HATEFUL' ? 'bg-danger' : 'bg-success'}`}>{item.prediction}</span></td>
                      <td className="text-center px-4"><button className="btn btn-sm btn-outline-danger rounded-circle border-0" style={{width: '35px', height: '35px'}} onClick={() => deleteOne(item.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;