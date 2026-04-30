import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://malindu12-sinhala-meme-api.hf.space";

const translations = {
  si: {
    navHome: "🏠 මුල් පිටුව", navDash: "📊 Dashboard", langSwitch: "English",
    heroTitle: "සිංහල මීම් පිරික්සුම", selectImg: "📸 මීම් පින්තූරය:",
    dragDrop: "පින්තූරය මෙතනට අදින්න (Drag & Drop)", analyzeBtn: "🚀 පරීක්ෂා කරන්න",
    hatefulResult: "ද්වේශසහගත මීම් එකකි", nonHatefulResult: "සාමාන්‍ය මීම් එකකි",
    reportBtn: "🚩 Report", exportBtn: "📥 දත්ත බාගත කරන්න (CSV)",
    searchPlaceholder: "අකුරු වලින් සොයන්න...", filterAll: "සියල්ල",
  },
  en: {
    navHome: "🏠 Home", navDash: "📊 Dashboard", langSwitch: "සිංහල",
    heroTitle: "Sinhala Meme Checker", selectImg: "📸 Select Meme:",
    dragDrop: "Drag & Drop image here", analyzeBtn: "🚀 Analyze Meme",
    hatefulResult: "Hateful Content Detected", nonHatefulResult: "Safe / Normal Meme",
    reportBtn: "🚩 Report Wrong", exportBtn: "📥 Export to CSV",
    searchPlaceholder: "Search by text...", filterAll: "All",
  }
};

const customStyles = `
  body { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
  .meme-card { border-radius: 20px; border: none; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
  .drop-zone { border: 2px dashed #007bff; border-radius: 15px; cursor: pointer; transition: 0.3s; }
  .drop-zone.active { background: #e7f1ff; transform: scale(1.02); }
  .table-container { max-height: 500px; overflow-y: auto; }
`;

function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  return (
    <Router>
      <style>{customStyles}</style>
      <Header lang={lang} setLang={setLang} t={t} />
      <Routes>
        <Route path="/" element={<Home t={t} />} />
        <Route path="/dashboard" element={<Dashboard t={t} />} />
      </Routes>
    </Router>
  );
}

function Header({ lang, setLang, t }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🤖 Sinhala Meme AI</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/">{t.navHome}</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/dashboard">{t.navDash}</Link></li>
            <li className="nav-item ms-3"><button className="btn btn-primary btn-sm rounded-pill" onClick={() => setLang(lang === 'si' ? 'en' : 'si')}>{t.langSwitch}</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Home({ t }) {
  const [image, setImage] = useState(null);
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

  const handlePredict = async () => {
    if (!image) return alert("Select an image first!");
    setLoading(true);
    const fd = new FormData(); fd.append('file', image); fd.append('text', "");
    try {
      const res = await axios.post(`${API_BASE_URL}/predict`, fd);
      setResult(res.data);
    } catch (e) { alert("Error!"); }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="card meme-card p-5 mx-auto" style={{maxWidth: '800px'}}>
        <h1 className="text-center fw-bold text-primary mb-4">{t.heroTitle}</h1>
        <div 
          className={`drop-zone p-5 text-center mb-4 ${isDragging ? 'active' : ''}`}
          onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {e.preventDefault(); setIsDragging(false); onFileSelect(e.dataTransfer.files[0]);}}
          onClick={() => document.getElementById('inp').click()}
        >
          {preview ? <img src={preview} className="img-fluid rounded" style={{maxHeight: '250px'}} alt="preview" /> : <p className="m-0 text-muted">{t.dragDrop}</p>}
          <input type="file" id="inp" hidden onChange={(e) => onFileSelect(e.target.files[0])} />
        </div>
        <button className="btn btn-primary btn-lg w-100 rounded-pill" onClick={handlePredict} disabled={loading}>{loading ? "Analyzing..." : t.analyzeBtn}</button>
        
        {result && (
          <div className={`alert mt-4 rounded-4 text-center ${result.prediction === 'HATEFUL' ? 'alert-danger' : 'alert-success'}`}>
            <h3>{result.prediction === 'HATEFUL' ? t.hatefulResult : t.nonHatefulResult}</h3>
            <p className="fw-bold">Confidence: {result.confidence}%</p>
            <button className="btn btn-outline-dark btn-sm rounded-pill mt-2">{t.reportBtn}</button>
          </div>
        )}
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
    if(window.confirm("Delete this?")) axios.delete(`${API_BASE_URL}/delete-history/${id}`).then(() => fetchHistory());
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Time,Text,Result,Confidence\n";
    data.history.forEach(r => csvContent += `${r.id},${r.time},"${r.text}",${r.prediction},${r.confidence}%\n`);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a"); link.setAttribute("href", encodedUri);
    link.setAttribute("download", "meme_history.csv"); document.body.appendChild(link);
    link.click();
  };

  const filteredHistory = data?.history.filter(item => 
    (filter === "ALL" || item.prediction === filter) &&
    (item.text.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{t.navDash}</h2>
        <button className="btn btn-success rounded-pill fw-bold" onClick={exportCSV}>{t.exportBtn}</button>
      </div>
      
      {data && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4"><div className="card p-3 bg-primary text-white text-center rounded-4"><h5>Total</h5><h3>{data.total_checked}</h3></div></div>
            <div className="col-md-4"><div className="card p-3 bg-danger text-white text-center rounded-4"><h5>Hateful</h5><h3>{data.hateful_total}</h3></div></div>
            <div className="col-md-4"><div className="card p-3 bg-success text-white text-center rounded-4"><h5>Safe</h5><h3>{data.non_hateful_total}</h3></div></div>
          </div>

          <div className="card meme-card p-4">
            <div className="row mb-3">
              <div className="col-md-8"><input type="text" className="form-control rounded-pill" placeholder={t.searchPlaceholder} onChange={(e) => setSearch(e.target.value)} /></div>
              <div className="col-md-4">
                <select className="form-select rounded-pill" onChange={(e) => setFilter(e.target.value)}>
                  <option value="ALL">{t.filterAll}</option>
                  <option value="HATEFUL">Hateful</option>
                  <option value="NON-HATEFUL">Safe</option>
                </select>
              </div>
            </div>
            <div className="table-responsive table-container">
              <table className="table table-hover">
                <thead className="table-dark sticky-top">
                  <tr><th>Time</th><th>Text</th><th>Result</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredHistory?.map(item => (
                    <tr key={item.id}>
                      <td><small>{item.time}</small></td>
                      <td>{item.text || "No text"}</td>
                      <td><span className={`badge rounded-pill ${item.prediction === 'HATEFUL' ? 'bg-danger' : 'bg-success'}`}>{item.prediction}</span></td>
                      <td><button className="btn btn-sm btn-outline-danger border-0" onClick={() => deleteOne(item.id)}>🗑️</button></td>
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