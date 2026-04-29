import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// Import Bootstrap CSS and JS for responsiveness and interactive components
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// ==========================================
// 🔗 Smart API Configuration
// ==========================================
// Automatically switches between Localhost and Hugging Face based on the environment
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://malindu12-sinhala-meme-api.hf.space";

// ==========================================
// 🌍 Translation Dictionary (EN & SI)
// ==========================================
const translations = {
  si: {
    navHome: "🏠 මුල් පිටුව",
    navDash: "📊 Dashboard",
    langSwitch: "English",
    heroTitle: "සිංහල මීම් පිරික්සුම",
    heroSub: "ඔබේ මීම් එක පහතින් අප්ලෝඩ් කර, එය ද්වේශසහගත ද නැද්ද යන්න AI හරහා දැනගන්න.",
    selectImg: "📸 මීම් පින්තූරය තෝරන්න:",
    dropHere: "මෙතන අතාරින්න...",
    dragDrop: "පින්තූරය මෙතනට අදින්න (Drag & Drop)",
    orClick: "හෝ Click කර තෝරන්න",
    textLabel: "✍️ මීම් එකේ අකුරු පේළිය (විකල්ප):",
    textPlaceholder: "ඔබට අවශ්‍ය නම් පමණක් මෙහි ටයිප් කරන්න... නැතහොත් AI විසින් පින්තූරයෙන් අකුරු කියවනු ඇත.",
    analyzeBtn: "🚀 ප්‍රතිඵලය බලන්න",
    analyzing: "⏳ AI එක කියවමින් පවතී...",
    hatefulResult: "මෙය ද්වේශසහගත/නරක මීම් එකකි.",
    nonHatefulResult: "මෙය සාමාන්‍ය මීම් එකකි.",
    confidence: "විශ්වාසදායකත්වය (Confidence Score):",
    wrongPred: "මේ අනාවැකිය වැරදිද?",
    reportBtn: "🚩 මෙය වැරදියි (Report)",
    reported: "✅ ප්‍රතිචාරය ලැබුණා",
    needImageAlert: "කරුණාකර මීම් පින්තූරයක් ලබාදෙන්න!",
    dashTitle: "📊 Admin Dashboard",
    dashSub: "පද්ධතිය භාවිතා කිරීමේ සංඛ්‍යාලේඛන සහ මෑත ඉතිහාසය.",
    backHome: "⬅️ ආපසු මුල් පිටුවට",
    totalChecked: "පරීක්ෂා කළ මුළු ගණන",
    historyTitle: "මෑතකදී පරීක්ෂා කළ මීම්ස් ඉතිහාසය",
    colTime: "වෙලාව (Time)",
    colText: "භාවිතා කළ අකුරු",
    colResult: "ප්‍රතිඵලය",
    colConfidence: "විශ්වාසය",
    noText: "[අකුරු නොමැත / OCR අසමත්]",
    loading: "⏳ දත්ත ලබා ගනිමින් පවතී...",
    clearHistoryBtn: "🗑️ ඉතිහාසය මකන්න",
    confirmDelete: "ඔබට විශ්වාසද සියලුම දත්ත මකා දැමිය යුතුයි කියා?"
  },
  en: {
    navHome: "🏠 Home",
    navDash: "📊 Dashboard",
    langSwitch: "සිංහල",
    heroTitle: "Sinhala Meme Checker",
    heroSub: "Upload your meme below and let AI determine if it contains hateful content.",
    selectImg: "📸 Select Meme Image:",
    dropHere: "Drop it here...",
    dragDrop: "Drag & Drop image here",
    orClick: "or Click to browse",
    textLabel: "✍️ Meme Text (Optional):",
    textPlaceholder: "Type text here if needed... otherwise AI will extract it via OCR.",
    analyzeBtn: "🚀 Analyze Meme",
    analyzing: "⏳ AI is analyzing...",
    hatefulResult: "This is a hateful/offensive meme.",
    nonHatefulResult: "This is a normal/safe meme.",
    confidence: "Confidence Score:",
    wrongPred: "Is this prediction incorrect?",
    reportBtn: "🚩 Report as wrong",
    reported: "✅ Feedback recorded",
    needImageAlert: "Please provide a meme image to proceed!",
    dashTitle: "📊 Admin Dashboard",
    dashSub: "System usage statistics and recent prediction history.",
    backHome: "⬅️ Back to Home",
    totalChecked: "Total Checked Memes",
    historyTitle: "Recent Meme Prediction History",
    colTime: "Timestamp",
    colText: "Extracted/Used Text",
    colResult: "Prediction",
    colConfidence: "Confidence",
    noText: "[No text found / OCR failed]",
    loading: "⏳ Fetching data...",
    clearHistoryBtn: "🗑️ Clear History",
    confirmDelete: "Are you sure you want to delete all history?"
  }
};

// ==========================================
// 🎨 Custom Premium CSS
// ==========================================
const customStyles = `
  body { background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); font-family: 'Segoe UI', sans-serif; min-height: 100vh; }
  .meme-card { border-radius: 24px; border: none; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); box-shadow: 0 20px 40px rgba(0,0,0,0.08)!important; transition: all 0.3s ease; }
  .drop-zone { background-color: #f8fbff; border: 2px dashed #a1c4fd; border-radius: 20px; transition: all 0.3s ease; }
  .text-area-custom { border-radius: 20px; border: 1px solid #e0e0e0; resize: none; transition: all 0.3s ease; }
  .btn-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; font-weight: 600; box-shadow: 0 10px 20px rgba(118, 75, 162, 0.3); transition: all 0.3s ease; }
  .navbar-custom { background: rgba(33, 37, 41, 0.95) !important; backdrop-filter: blur(10px); }
  .table-scroll-container { max-height: 400px; overflow-y: auto; border-radius: 10px; }
`;

// ==========================================
// 🏢 Header Component
// ==========================================
function Header({ lang, setLang, t }) {
  const location = useLocation();
  const toggleLanguage = () => setLang(lang === 'si' ? 'en' : 'si');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="fs-2 me-2">🤖</span>
          <div>
            <span className="fw-bold fs-4">Sinhala Meme AI</span><br/>
            <small className="text-white-50" style={{fontSize: '0.7rem'}}>Research Prototype</small>
          </div>
        </Link>
        
        {/* Bootstrap Hamburger Menu Toggle */}
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className={`nav-link fw-semibold ${location.pathname === '/' ? 'active text-info' : ''}`} to="/">{t.navHome}</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link fw-semibold ${location.pathname === '/dashboard' ? 'active text-info' : ''}`} to="/dashboard">{t.navDash}</Link>
            </li>
            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
              <button className="btn btn-light btn-sm rounded-pill px-4 fw-bold text-primary" onClick={toggleLanguage}>
                🌍 {t.langSwitch}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

// ==========================================
// 🏠 Home Component (Meme Prediction)
// ==========================================
function Home({ t }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const processFile = (file) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { alert(t.needImageAlert); return; }
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image);
    formData.append('text', text || " ");

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formData);
      setResult(response.data);
    } catch (error) {
      alert("API Error! Please check if backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card meme-card p-4">
            <div className="card-body text-center">
              <h1 className="fw-bold text-primary">{t.heroTitle}</h1>
              <p className="text-muted mb-4">{t.heroSub}</p>
              
              <form onSubmit={handleSubmit} className="text-start">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">{t.selectImg}</label>
                    <div className="card drop-zone p-3 text-center" style={{cursor: 'pointer'}} onClick={() => document.getElementById('fileInput').click()}>
                      {imagePreview ? <img src={imagePreview} alt="Preview" className="img-fluid rounded" style={{maxHeight: '180px'}} /> : <div className="py-5">📥 Click to Upload</div>}
                    </div>
                    <input type="file" id="fileInput" className="d-none" onChange={(e) => processFile(e.target.files[0])} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">{t.textLabel}</label>
                    <textarea className="form-control text-area-custom h-100" placeholder={t.textPlaceholder} value={text} onChange={(e) => setText(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="btn btn-gradient btn-lg w-100 mt-5 rounded-pill" disabled={loading}>
                  {loading ? t.analyzing : t.analyzeBtn}
                </button>
              </form>

              {result && (
                <div className={`alert mt-5 rounded-4 ${result.prediction === 'HATEFUL' ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                  <h2 className="fw-bold">{result.prediction}</h2>
                  <p>{result.prediction === 'HATEFUL' ? t.hatefulResult : t.nonHatefulResult}</p>
                  <span className="badge bg-dark px-3 py-2 rounded-pill">{t.confidence} {result.confidence}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 📊 Dashboard Component (Admin Stats)
// ==========================================
function Dashboard({ t }) {
  const [data, setData] = useState(null);

  const fetchData = () => {
    axios.get(`${API_BASE_URL}/dashboard-data?t=${new Date().getTime()}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="container my-5">
      <h1 className="fw-bold text-primary mb-4">{t.dashTitle}</h1>
      {data ? (
        <>
          <div className="row g-4 mb-5 text-white">
            <div className="col-md-4"><div className="card meme-card bg-primary p-4"><h5>Total</h5><h2>{data.total_checked}</h2></div></div>
            <div className="col-md-4"><div className="card meme-card bg-danger p-4"><h5>Hateful</h5><h2>{data.hateful_total}</h2></div></div>
            <div className="col-md-4"><div className="card meme-card bg-success p-4"><h5>Safe</h5><h2>{data.non_hateful_total}</h2></div></div>
          </div>
          <div className="card meme-card p-4 shadow">
            <h3 className="fw-bold mb-4">{t.historyTitle}</h3>
            <div className="table-responsive table-scroll-container">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr><th>Time</th><th>Text</th><th className="text-center">Result</th></tr>
                </thead>
                <tbody>
                  {data.history.map(item => (
                    <tr key={item.id}>
                      <td>{item.time}</td>
                      <td>{item.text || t.noText}</td>
                      <td className="text-center"><span className={`badge rounded-pill ${item.prediction === 'HATEFUL' ? 'bg-danger' : 'bg-success'}`}>{item.prediction}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : <h4>{t.loading}</h4>}
    </div>
  );
}

// ==========================================
// 🚀 App Component
// ==========================================
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
        <footer className="py-4 text-center bg-light mt-auto">
          <small>&copy; 2026 Sinhala Meme AI Team | Research Project</small>
        </footer>
      </div>
    </Router>
  );
}

export default App;