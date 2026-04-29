import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

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
// 🎨 Modern Premium CSS 
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
  .table-scroll-container::-webkit-scrollbar {
    width: 8px;
  }
  .table-scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1; 
    border-radius: 10px;
  }
  .table-scroll-container::-webkit-scrollbar-thumb {
    background: #c1c1c1; 
    border-radius: 10px;
  }
  .table-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8; 
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
            <li className="nav-item me-3 mb-2 mb-lg-0">
              <Link className={`nav-link fw-semibold ${location.pathname === '/' ? 'active text-info' : ''}`} to="/">
                {t.navHome}
              </Link>
            </li>
            <li className="nav-item me-4 mb-2 mb-lg-0">
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
// 🦶 Footer Component
// ==========================================
function Footer() {
  return (
    <footer className="footer mt-auto py-4 text-dark text-center" style={{background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(5px)'}}>
      <div className="container">
        <small className="fw-semibold opacity-75">&copy; 2026 Sinhala Meme AI Team. All rights reserved. | Research Project</small>
      </div>
    </footer>
  );
}

// ==========================================
// 🏠 1. Home Page (Meme Checker)
// ==========================================
function Home({ t }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e) => {
    if(e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processFile(file);
    else alert(t.needImageAlert);
  };

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
      // 🚨 යාවත්කාලීන කළ API ලින්ක් එක - 1 🚨
      const response = await axios.post('https://malindu12-sinhala-meme-api.hf.space/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === "error") {
        alert("🚨 AI එකේ දෝෂයක්: " + response.data.message);
        setLoading(false);
        return;
      }
      
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
      alert("API Error!");
    }
    setLoading(false);
  };

  return (
    <div className="container my-5 flex-shrink-0">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card meme-card p-4 p-md-5">
            <div className="card-body">
              
              <div className="text-center mb-5">
                <h1 className="fw-bolder mb-2" style={{
                  background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{t.heroTitle}</h1>
                <p className="text-secondary fs-5">{t.heroSub}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark fs-5">{t.selectImg}</label>
                    <div 
                      className={`card drop-zone p-3 text-center d-flex justify-content-center align-items-center ${isDragging ? 'drag-active' : ''}`} 
                      style={{ cursor: 'pointer', minHeight: '220px' }} 
                      onClick={() => document.getElementById('memeImage').click()}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="img-fluid rounded shadow-sm" style={{maxHeight: '190px', objectFit: 'contain'}} />
                      ) : (
                        <div className="py-4 text-primary opacity-75">
                          <i className="fs-1 mb-2">📥</i><br/>
                          <span className="fw-bold fs-5">{isDragging ? t.dropHere : t.dragDrop}</span><br/>
                          <small className="text-muted">{t.orClick}</small>
                        </div>
                      )}
                    </div>
                    <input type="file" id="memeImage" className="form-control d-none" accept="image/*" onChange={handleImageChange} />
                  </div>
                  
                  <div className="col-md-6 d-flex flex-column">
                    <label className="form-label fw-bold text-dark fs-5">{t.textLabel}</label>
                    <textarea 
                      className="form-control flex-grow-1 p-4 text-area-custom fs-5" 
                      placeholder={t.textPlaceholder} 
                      value={text} 
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-gradient btn-lg w-100 mt-5 rounded-pill py-3 fs-4" disabled={loading}>
                  {loading ? (
                    <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> {t.analyzing}</span>
                  ) : t.analyzeBtn}
                </button>
              </form>

              {result && (
                <div className={`alert mt-5 rounded-4 p-4 text-center border-0 shadow-sm ${result.prediction === 'HATEFUL' ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                  <h2 className="alert-heading fw-bolder mb-3">
                    {result.prediction === 'HATEFUL' ? `🚨 ${t.hatefulResult.split(' ')[0]} HATEFUL` : `✅ NON-HATEFUL`}
                  </h2>
                  <p className="fs-4 mb-4 opacity-75">{result.prediction === 'HATEFUL' ? t.hatefulResult : t.nonHatefulResult}</p>
                  
                  <div className="d-inline-flex justify-content-center align-items-center bg-white text-dark px-4 py-2 rounded-pill shadow-sm mb-4">
                    <span className="fw-semibold me-2">{t.confidence}</span>
                    <span className="badge bg-dark fs-5 px-3 rounded-pill">{result.confidence}%</span>
                  </div>
                  
                  <hr className="border-white opacity-25 my-3" />
                  
                  <div className="d-flex flex-column align-items-center">
                    <p className="mb-2 small opacity-75">{t.wrongPred}</p>
                    <button className="btn btn-sm btn-light text-danger fw-bold rounded-pill px-3" onClick={() => setFeedbackSent(true)} disabled={feedbackSent}>
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
// 📊 2. Admin Dashboard Page
// ==========================================
function Dashboard({ t }) {
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = () => {
    // 🚨 යාවත්කාලීන කළ API ලින්ක් එක - 2 🚨
    axios.get(`https://malindu12-sinhala-meme-api.hf.space/dashboard-data?t=${new Date().getTime()}`)
      .then(res => setDashboardData(res.data))
      .catch(err => alert("Error fetching dashboard data!"));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm(t.confirmDelete)) {
      // 🚨 යාවත්කාලීන කළ API ලින්ක් එක - 3 🚨
      axios.delete('https://malindu12-sinhala-meme-api.hf.space/clear-history')
        .then(() => {
          fetchDashboardData(); 
        })
        .catch(err => alert("Error clearing history!"));
    }
  };

  return (
    <div className="container my-5 flex-shrink-0">
      <div className="row align-items-center mb-5 bg-white p-4 rounded-4 shadow-sm" style={{background: 'rgba(255,255,255,0.8)'}}>
        <div className="col">
          <h1 className="text-primary fw-bolder mb-1">{t.dashTitle}</h1>
          <p className="text-muted fs-5 mb-0">{t.dashSub}</p>
        </div>
        <div className="col-auto">
           <Link to="/" className="btn btn-primary btn-lg rounded-pill shadow-sm fw-bold px-4">{t.backHome}</Link>
        </div>
      </div>

      {dashboardData ? (
        <>
          <div className="row mb-5 text-center g-4">
            <div className="col-md-4">
              <div className="card text-bg-primary h-100 meme-card shadow border-0" style={{background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)'}}>
                <div className="card-body p-4 d-flex flex-column justify-content-center">
                  <h5 className="card-title fs-5 mb-2 opacity-75 text-white">{t.totalChecked}</h5>
                  <h2 className="display-3 fw-bolder text-white mb-0">{dashboardData.total_checked}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-bg-danger h-100 meme-card shadow border-0" style={{background: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)'}}>
                <div className="card-body p-4 d-flex flex-column justify-content-center">
                  <h5 className="card-title fs-5 mb-2 opacity-75 text-white">🚨 HATEFUL</h5>
                  <h2 className="display-3 fw-bolder text-white mb-0">{dashboardData.hateful_total}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-bg-success h-100 meme-card shadow border-0" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                <div className="card-body p-4 d-flex flex-column justify-content-center">
                  <h5 className="card-title fs-5 mb-2 opacity-75 text-white">✅ NON-HATEFUL</h5>
                  <h2 className="display-3 fw-bolder text-white mb-0">{dashboardData.non_hateful_total}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="card meme-card shadow p-4 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">{t.historyTitle}</h3>
                <button className="btn btn-outline-danger rounded-pill fw-bold px-3 shadow-sm" onClick={handleClearHistory} disabled={dashboardData.total_checked === 0}>
                  {t.clearHistoryBtn}
                </button>
              </div>

              <div className="table-responsive table-scroll-container border border-light">
                <table className="table table-hover align-middle admin-table fs-6 mb-0">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 border-0">ID</th>
                      <th className="py-3 px-4 border-0">{t.colTime}</th>
                      <th className="py-3 px-4 border-0">{t.colText}</th>
                      <th className="py-3 px-4 border-0 text-center">{t.colResult}</th>
                      <th className="py-3 px-4 border-0 text-center">{t.colConfidence}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {dashboardData.history.length > 0 ? (
                      dashboardData.history.map((item) => (
                        <tr key={item.id} className="border-bottom">
                          <td className="fw-bold text-center text-muted px-4">{item.id}</td>
                          <td className="px-4 text-secondary">{item.time}</td>
                          <td className="px-4">
                            {item.text.trim() === "" ? <span className="text-danger small bg-danger bg-opacity-10 px-2 py-1 rounded">{t.noText}</span> : <span className="text-dark fw-medium">{item.text}</span>}
                          </td>
                          <td className="text-center px-4">
                            <span className={`badge ${item.prediction === 'HATEFUL' ? 'bg-danger' : 'bg-success'} fs-6 rounded-pill px-3 py-2 shadow-sm`}>
                              {item.prediction}
                            </span>
                          </td>
                          <td className="fw-bolder text-center fs-5 text-dark px-4">{item.confidence}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted fs-5">No history available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center mt-5 py-5">
            <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status"></div>
            <h4 className="mt-4 text-muted fw-bold">{t.loading}</h4>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 🚀 Main App Component (Routing & Language State)
// ==========================================
function App() {
  const [lang, setLang] = useState('en'); 
  const t = translations[lang]; 

  return (
    <Router>
      <style>{customStyles}</style>
      <div className="d-flex flex-column h-100 min-vh-100">
        <Header lang={lang} setLang={setLang} t={t} /> 
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home t={t} />} />
            <Route path="/dashboard" element={<Dashboard t={t} />} />
          </Routes>
        </main>
        <Footer /> 
      </div>
    </Router>
  );
}

export default App;