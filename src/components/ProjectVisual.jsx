import React from 'react';

function Window({ title, children }) {
  return (
    <div className="pv-window">
      <div className="pv-window__bar">
        <span className="pv-window__dot"></span>
        <span className="pv-window__dot"></span>
        <span className="pv-window__dot"></span>
        <span className="pv-window__title">{title}</span>
      </div>
      <div className="pv-window__body">{children}</div>
    </div>
  );
}

export default function ProjectVisual({ id }) {
  if (id === 'multi-firm') {
    return (
      <Window title="firm-dashboard.app">
        <div className="pv pv--multifirm">
          <div className="pv__header"><span className="pv__title">Firm Dashboard</span><span className="pv__badge">Multi-tenant</span></div>
          <div className="pv__stats">
            <div className="pv__stat"><span className="pv__stat-num">3</span><span className="pv__stat-label">Firms</span></div>
            <div className="pv__stat"><span className="pv__stat-num">128</span><span className="pv__stat-label">Staff</span></div>
            <div className="pv__stat"><span className="pv__stat-num">94%</span><span className="pv__stat-label">Attendance</span></div>
          </div>
          <div className="pv__table">
            <div className="pv__row pv__row--head"><span>Name</span><span>Firm</span><span>Status</span></div>
            <div className="pv__row"><span>R. Sharma</span><span>Patil</span><span className="pv__ok">Present</span></div>
            <div className="pv__row"><span>A. Patil</span><span>Namrata</span><span className="pv__ok">Present</span></div>
            <div className="pv__row"><span>V. Rao</span><span>Patil</span><span className="pv__warn">Late</span></div>
          </div>
          <div className="pv__chart">
            {[40, 65, 50, 80, 60, 75, 55].map((h, i) => (
              <div key={i} className="pv__bar" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </Window>
    );
  }
  if (id === 'accident') {
    return (
      <Window title="accident-detection.app">
        <div className="pv pv--accident">
          <div className="pv__frame">
            <div className="pv__bbox pv__bbox--1"><span className="pv__bbox-label">car · 0.94</span></div>
            <div className="pv__bbox pv__bbox--2"><span className="pv__bbox-label">car · 0.89</span></div>
            <div className="pv__bbox pv__bbox--3"><span className="pv__bbox-label">person · 0.71</span></div>
            <div className="pv__trail"></div>
            <div className="pv__scanline"></div>
            <span className="pv__camlabel">CAM 04 · LIVE</span>
            <span className="pv__rec">● REC</span>
          </div>
          <div className="pv__alert">
            <span className="pv__alert-dot"></span>
            ACCIDENT DETECTED
            <span className="pv__alert-sub">collision · frame 1842</span>
          </div>
          <div className="pv__meta">
            <div className="pv__meta-row"><span>Confidence</span><span>92.4%</span></div>
            <div className="pv__meta-row"><span>Tracking</span><span>ByteTrack</span></div>
            <div className="pv__meta-row"><span>Model</span><span>YOLOv8</span></div>
            <div className="pv__meta-row"><span>Location</span><span>18.52°N 73.85°E</span></div>
          </div>
          <div className="pv__timeline">
            {[0,1,2,3,4,5].map(i => <span key={i} className={`pv__tick ${i===3?'pv__tick--alert':''}`}></span>)}
          </div>
          <div className="pv__confbar">
            <div className="pv__confbar-fill"></div>
          </div>
        </div>
      </Window>
    );
  }
  if (id === 'zero-ui') {
    return (
      <Window title="zero-ui-emergency.app">
        <div className="pv pv--zeroui">
          <div className="pv__phone">
            <div className="pv__phone-screen">
              <div className="pv__status pv__status--ok">EMERGENCY MODE</div>
              <div className="pv__radar">
                <div className="pv__radar-sweep"></div>
                <div className="pv__radar-dot"></div>
              </div>
              <div className="pv__sensor-list">
                <div className="pv__sensor"><span>Accel</span><span>12.4 m/s²</span></div>
                <div className="pv__sensor"><span>GPS</span><span>18.52°N 73.85°E</span></div>
                <div className="pv__sensor"><span>State</span><span>Active</span></div>
              </div>
            </div>
          </div>
          <div className="pv__waves">
            {[0,1,2].map(i => <div key={i} className="pv__wave"></div>)}
          </div>
        </div>
      </Window>
    );
  }
  if (id === 'ecommerce') {
    return (
      <Window title="ecommerce-store.app">
        <div className="pv pv--ecom">
          <div className="pv__searchbar">
            <span className="pv__search-icon">⌕</span>
            <span className="pv__search-text">Search products…</span>
            <span className="pv__cart">Cart · 3</span>
          </div>
          <div className="pv__cats">
            {['All','Gear','Apparel','Safety'].map(c => <span key={c} className="pv__cat">{c}</span>)}
          </div>
          <div className="pv__products">
            {[
              { name: 'Safety Helmet', price: '₹1,299' },
              { name: 'Harness Pro', price: '₹3,499' },
              { name: 'Gloves X', price: '₹899' },
              { name: 'Vest Reflect', price: '₹1,799' },
            ].map(pr => (
              <div key={pr.name} className="pv__product">
                <div className="pv__product-img"></div>
                <div className="pv__product-name">{pr.name}</div>
                <div className="pv__product-price">{pr.price}</div>
                <button className="pv__add">Add</button>
              </div>
            ))}
          </div>
        </div>
      </Window>
    );
  }
  if (id === 'documind') {
    return (
      <Window title="documind-ai.app">
        <div className="pv pv--documind">
          <div className="pv__doc">
            <div className="pv__doc-line"></div>
            <div className="pv__doc-line pv__doc-line--short"></div>
            <div className="pv__doc-line"></div>
            <div className="pv__doc-line pv__doc-line--short"></div>
            <div className="pv__doc-line"></div>
          </div>
          <div className="pv__ai">
            <div className="pv__ai-header">
              <span className="pv__ai-dot"></span>
              AI Analysis
            </div>
            <div className="pv__ai-query">"What is the notice period?"</div>
            <div className="pv__ai-response">
              <div className="pv__ai-line"></div>
              <div className="pv__ai-line pv__ai-line--short"></div>
              <div className="pv__ai-line"></div>
            </div>
            <div className="pv__ai-meta">Semantic search · RAG · Ollama</div>
          </div>
        </div>
      </Window>
    );
  }
  return null;
}
