import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// ==========================================
// 🔗 Smart API Configuration
// ==========================================
// Automatically switches between Localhost (for development) and Hugging Face (for production)
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://malindu12-sinhala-meme-api.hf.space";

// ==========================================
// 🌍 Translation Dictionary
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
    transition: transform 0.3s ease, box-shadow 0.3s ease; 
  }
  .meme-card:hover { 
    transform: translateY(-5px); 
    box-shadow: 0 25px 50px rgba(0,0,0,0.12)!important; 
  }
  .drop-zone { 
    background-color: #f8fbff;
    border: 2px dashed #a1c4fd;
    border-radius: 20px;
    transition: all 0.3s ease; 
  }
  .drop-zone:hover {
    background-color: #eef5ff;
    border-color: #66a6ff;
  }
  .drag-active { 
    background-color: #e0f0ff !important; 
    border: 3px dashed #0d6efd !important; 
    transform: scale(1.02); 
  }
  .text-area-custom {
    border-radius: 20px;
    border: 1px solid #e0e0e0;
    background-color: #fafafa;
    transition: all 0.3s ease;
    resize: none;
  }
  .text-area-custom:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
    background-color: #ffffff;
    outline: none;
  }
  .btn-gradient { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    border: none; 
    color: white; 
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 10px 20px rgba(118, 75, 162, 0.3);
    transition: all 0.3s ease; 
  }
  .btn-gradient:hover { 
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); 
    box-shadow: 0 15px 25px rgba(118, 75, 162, 0.4);
    transform: translateY(-2px);
    color: white; 
  }
  .admin-table thead { background: linear-gradient(45deg, #2c3e50, #4ca1af); color: white; position: sticky; top: 0; z-index: 1; }
  .navbar-custom {
    background: rgba(33, 37, 41, 0.95) !important;
    backdrop-filter: blur(10px);
  }
  .table-scroll-container {
    max-height: 400px;
    overflow-y: auto;
    border-radius: 10px;
  }
`;

// ==========================================
// 🏢 Header Component
// ==========================================
function Header({ lang, setLang, t }) {
  const location = useLocation();
  const toggleLanguage = () => setLang(lang === 'si' ? 'en' : 'si');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm sticky-top">
      <div className="container py-1">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="fs-2 me-2">🤖</span>
          <div>
            <span className="fw-bold fs-4" style={{letterSpacing: '1px'}}>Sinhala Meme AI</span><br/>
            <small className="text-white-50" style={{fontSize: '0.75rem', fontWeight: '500'}}>Research Prototype</small>
          </div>
        </Link>
        
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-light btn-sm d-lg-none me-2 rounded-pill" onClick={toggleLanguage}>
            🌍 {t.langSwitch}
          </button>
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto fs-5 align-items-lg-center">
            <li className="nav-item me-3">
              <Link className={`nav-link fw-semibold ${location.pathname === '/' ? 'active text-info' : ''}`} to="/">
                {t.navHome}
              </Link>
            </li>
            <li className="nav-item me-4">
              <Link className={`nav-link fw-semibold ${location.pathname === '/dashboard' ? 'active text-info' : ''}`} to="/dashboard">
                {t.navDash}
              </Link>
            </li>
            <li className="nav-item d-none d-lg-block">
              <button className="btn btn-light btn-sm rounded-pill px-4 fw-bold shadow-sm text-primary" onClick={toggleLanguage}>
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
// 🏠 Home Page Component
// ==========================================
function Home({ t }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // File handling logic
  const processFile = (file) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageChange = (e) => {
    if(e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processFile(file);
    else alert(t.needImageAlert);
  };

  // Submit form to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { alert(t.needImageAlert); return; }

    setLoading(true);
    setResult(null);
    setFeedbackSent(false);

    const formData = new FormData();
    formData.append('file', image);
    formData.append('text', text ? text : " ");

    try {
      // POST to Dynamic API URL
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === "error") {
        alert("🚨 AI Error: " + response.data.message);
      } else {
        setResult(response.data);
      }
    } catch (error) {
      console.error("API Connection Error:", error);
      alert("Cannot connect to Backend API!");
    }
    setLoading(false);
  };

  return (
    <div className="container my-5 flex-shrink-0">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card meme-card p-4 p-md-5">
            <div className="card-body text-center">
              <h1 className="fw-bolder mb-2 text-primary">{t.heroTitle}</h1>
              <p className="text-secondary fs-5">{t.heroSub}</p>
              
              <form onSubmit={handleSubmit} className="mb-4 text-start">
                <div className="row g-4 mt-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">{t.selectImg}</label>
                    <div 
                      className={`card drop-zone p-3 text-center ${isDragging ? 'drag-active' : ''}`} 
                      style={{ cursor: 'pointer', minHeight: '220px' }} 
                      onClick={() => document.getElementById('memeImage').click()}
                      onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}}
                      onDragLeave={(e) => {e.preventDefault(); setIsDragging(false);}}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="img-fluid rounded shadow-sm" style={{maxHeight: '190px'}} />
                      ) : (
                        <div className="py-4 text-primary opacity-75">
                          <i className="fs-1">📥</i><br/>
                          <span className="fw-bold">{isDragging ? t.dropHere : t.dragDrop}</span>
                        </div>
                      )}
                    </div>
                    <input type="file" id="memeImage" className="d-none" accept="image/*" onChange={handleImageChange} />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold">{t.textLabel}</label>
                    <textarea 
                      className="form-control text-area-custom h-100" 
                      placeholder={t.textPlaceholder} 
                      value={text} 
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-gradient btn-lg w-100 mt-5 rounded-pill py-3" disabled={loading}>
                  {loading ? t.analyzing : t.analyzeBtn}
                </button>
              </form>

              {result && (
                <div className={`alert mt-5 rounded-4 p-4 ${result.prediction === 'HATEFUL' ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                  <h2 className="fw-bolder mb-2">{result.prediction}</h2>
                  <p className="fs-5">{result.prediction === 'HATEFUL' ? t.hatefulResult : t.nonHatefulResult}</p>
                  <div className="badge bg-dark fs-6 px-3 py-2 rounded-pill">
                    {t.confidence} {result.confidence}%
                  </div>
                  <div className="mt-4">
                    <small className="d-block mb-2">{t.wrongPred}</small>
                    <button className="btn btn-sm btn-light text-danger fw-bold rounded-pill" onClick={() => setFeedbackSent(true)} disabled={feedbackSent}>
                      {feedbackSent ? t.reported : t.reportBtn}
                    </button>
                  </div>
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
// 📊 Dashboard Component
// ==========================================
function Dashboard({ t }) {
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch metrics and history from the API
  const fetchDashboardData = () => {
    axios.get(`${API_BASE_URL}/dashboard-data?t=${new Date().getTime()}`)
      .then(res => setDashboardData(res.data))
      .catch(err => console.error("History fetch error:", err));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm(t.confirmDelete)) {
      axios.delete(`${API_BASE_URL}/clear-history`)
        .then(() => fetchDashboardData())
        .catch(err => alert("Clear history failed!"));
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary fw-bolder">{t.dashTitle}</h1>
        <Link to="/" className="btn btn-primary rounded-pill px-4">{t.backHome}</Link>
      </div>

      {dashboardData ? (
        <>
          <div className="row mb-5 text-center g-4">
            <div className="col-md-4">
              <div className="card meme-card bg-primary text-white p-4">
                <h5>{t.totalChecked}</h5>
                <h2 className="display-4 fw-bold">{dashboardData.total_checked}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card meme-card bg-danger text-white p-4">
                <h5>🚨 HATEFUL</h5>
                <h2 className="display-4 fw-bold">{dashboardData.hateful_total}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card meme-card bg-success text-white p-4">
                <h5>✅ NON-HATEFUL</h5>
                <h2 className="display-4 fw-bold">{dashboardData.non_hateful_total}</h2>
              </div>
            </div>
          </div>

          <div className="card meme-card shadow p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold">{t.historyTitle}</h3>
              <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={handleClearHistory}>{t.clearHistoryBtn}</button>
            </div>
            <div className="table-responsive table-scroll-container">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>{t.colTime}</th>
                    <th>{t.colText}</th>
                    <th className="text-center">{t.colResult}</th>
                    <th className="text-center">{t.colConfidence}</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.time}</td>
                      <td>{item.text || t.noText}</td>
                      <td className="text-center">
                        <span className={`badge rounded-pill ${item.prediction === 'HATEFUL' ? 'bg-danger' : 'bg-success'}`}>
                          {item.prediction}
                        </span>
                      </td>
                      <td className="text-center fw-bold">{item.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : <h4 className="text-center mt-5">{t.loading}</h4>}
    </div>
  );
}

// ==========================================
// 🚀 App Root
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
          <small>&copy; 2026 Sinhala Meme AI Team</small>
        </footer>
      </div>
    </Router>
  );
}

export default App;