import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import SceneCanvas from './components/SceneCanvas.jsx';
import ProjectLab from './components/ProjectLab.jsx';
import SkillsConstellation from './components/SkillsConstellation.jsx';
import Terminal from './components/Terminal.jsx';

const PHONE_DISPLAY = '+91 9356761880';
const PHONE_TEL = '+919356761880';

const SKILLS = [
  { title: 'Programming', desc: 'Java, Python, JavaScript, SQL', tags: ['Java','Python','JavaScript','SQL'] },
  { title: 'Frontend & backend', desc: 'React, Node, Express, REST', tags: ['React.js','HTML','CSS','Node.js','Express.js','REST APIs','React Router','Axios','Mongoose'] },
  { title: 'Databases', desc: 'MongoDB, MySQL, PostgreSQL, Neon, Prisma', tags: ['MongoDB','MySQL','PostgreSQL','Neon','Prisma ORM'] },
  { title: 'AI / ML', desc: 'Scikit-learn, TensorFlow, PyTorch, OpenCV', tags: ['Scikit-learn','TensorFlow','PyTorch','OpenCV','NumPy','Pandas','Matplotlib','Seaborn','ANN','CNN','Transfer Learning','Classification','Regression','Model Evaluation'] },
  { title: 'NLP / AI', desc: 'Semantic search, RAG, Ollama', tags: ['Semantic Search','Tokenization','Text Preprocessing','Ollama','RAG'] },
  { title: 'Developer tools', desc: 'Git, Docker, CI/CD', tags: ['Git','GitHub','Docker','Postman','Jenkins','GitHub Actions','CI/CD'] },
];

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    el.querySelectorAll('.reveal').forEach(n => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

export default function App() {
  const [introHidden, setIntroHidden] = useState(() => sessionStorage.getItem('introSeen') === '1');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [repos, setRepos] = useState([]);
  const [ghQuery, setGhQuery] = useState('');
  const [ghLoading, setGhLoading] = useState(true);
  const [ghError, setGhError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [timelinePct, setTimelinePct] = useState(0);
  const [timeStr, setTimeStr] = useState('');
  const [backVisible, setBackVisible] = useState(false);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lastY = useRef(0);

  const rootRef = useReveal();

  // Intro
  useEffect(() => {
    if (introHidden) return;
    const t = setTimeout(() => { setIntroHidden(true); sessionStorage.setItem('introSeen', '1'); }, reduceMotion ? 400 : 2200);
    return () => clearTimeout(t);
  }, [introHidden, reduceMotion]);

  // Mobile menu: close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Cursor
  useEffect(() => {
    if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursor-dot');
    let mx=0,my=0,cx=0,cy=0, raf;
    const label = document.getElementById('cursor-label');
    const onMove = (e) => { mx=e.clientX; my=e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; if (label) label.style.transform = `translate(${mx+16}px,${my+16}px)`; };
    const onOver = (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t && label) { label.textContent = t.getAttribute('data-cursor'); label.classList.add('is-visible'); cursor.classList.add('is-hover'); }
      else if (label) { label.classList.remove('is-visible'); cursor.classList.remove('is-hover'); }
    };
    document.addEventListener('mouseover', onOver);
    const loop = () => { cx += (mx-cx)*0.15; cy += (my-cy)*0.15; cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; raf=requestAnimationFrame(loop); };
    document.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseover', onOver); cancelAnimationFrame(raf); };
  }, [reduceMotion]);

  // Scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setBackVisible(window.scrollY > 600);
      // navbar hide/show on scroll direction
      const y = window.scrollY;
      if (y > lastY.current && y > 120) setNavHidden(true);
      else setNavHidden(false);
      lastY.current = y;
      const photo = document.querySelector('.hero__photo');
      if (photo && !reduceMotion) { photo.style.transform = `translateY(${window.scrollY * 0.12}px)`; }
      const tl = document.getElementById('timeline');
      if (tl) {
        const rect = tl.getBoundingClientRect();
        const total = rect.height;
        const scrolledAmt = Math.min(Math.max(window.innerHeight - rect.top, 0), total);
        setTimelinePct((scrolledAmt/total)*100);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GitHub
  useEffect(() => {
    setGhLoading(true);
    setGhError('');
    fetch('https://api.github.com/users/Ved2151H/repos?per_page=100&sort=updated')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Bad response');
        setRepos(data.filter(r=>!r.fork && r.description).sort((a,b)=> new Date(b.updated_at)-new Date(a.updated_at)));
      })
      .catch((e) => { setGhError('Could not load repositories: ' + e.message); setRepos([]); })
      .finally(() => setGhLoading(false));
  }, []);

  // Local time
  useEffect(() => {
    const upd = () => {
      const now = new Date();
      setTimeStr('Local time ' + now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) + ' · ' + now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }));
    };
    upd();
    const t = setInterval(upd, 60000);
    return () => clearInterval(t);
  }, []);

  // Add js class for reveal
  useEffect(() => { document.documentElement.classList.add('js'); }, []);

  const magnetic = useCallback((e) => {
    if (reduceMotion) return;
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top - r.height/2;
    btn.style.transform = `translate(${x*0.2}px, ${y*0.2}px)`;
  }, [reduceMotion]);
  const magneticLeave = useCallback((e) => { e.currentTarget.style.transform = ''; }, []);

  const abilityTilt = useCallback((e) => {
    if (reduceMotion) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - 0.5;
    const y = (e.clientY - r.top)/r.height - 0.5;
    card.style.transform = `rotateY(${x*8}deg) rotateX(${-y*8}deg)`;
  }, [reduceMotion]);
  const abilityLeave = useCallback((e) => { e.currentTarget.style.transform = ''; }, []);
  const projectTilt = useCallback((e) => {
    if (reduceMotion) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - 0.5;
    const y = (e.clientY - r.top)/r.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-6px)`;
  }, [reduceMotion]);
  const projectLeave = useCallback((e) => { e.currentTarget.style.transform = ''; }, []);

  const copyTimer = useRef(null);
  const copyPhone = useCallback(async () => {
    const text = PHONE_DISPLAY;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      setPhoneCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setPhoneCopied(false), 2000);
    } catch {
      setPhoneCopied(false);
    }
  }, []);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Phone link: tap/click opens the dialer, press-and-hold copies the number.
  const holdStart = useRef(0);
  const suppressClickUntil = useRef(0);
  const startPhoneHold = useCallback(() => {
    holdStart.current = Date.now();
  }, []);
  const endPhoneHold = useCallback(() => {
    if (holdStart.current && Date.now() - holdStart.current >= 550) {
      suppressClickUntil.current = Date.now() + 900;
      copyPhone();
    }
    holdStart.current = 0;
  }, [copyPhone]);
  const cancelPhoneHold = useCallback(() => { holdStart.current = 0; }, []);

  const submit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) { setStatus('Please fill required fields.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('Enter a valid email.'); return; }
    if (message.trim().length < 10) { setStatus('Message too short.'); return; }
    const mailto = `mailto:dhanokarved@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio inquiry from ' + name)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;
    window.open(mailto, '_blank');
    setStatus('Email client opened.');
    setForm({ name:'', email:'', subject:'', message:'' });
  };

  // Debounced GitHub search
  useEffect(() => {
    const q = ghQuery.trim();
    if (q.length < 2) { setSearchResults(null); setSearchLoading(false); return; }
    setSearchLoading(true);
    const t = setTimeout(() => {
      fetch(`https://api.github.com/search/repositories?q=user:Ved2151H+${encodeURIComponent(q)}&per_page=30&sort=updated`)
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(data => setSearchResults(Array.isArray(data.items) ? data.items.filter(r=>r.description) : []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [ghQuery]);

  const localFiltered = repos.filter(r => r.description && (r.name + ' ' + r.description).toLowerCase().includes(ghQuery.toLowerCase()));
  const displayedRepos = (ghQuery.trim().length >= 2 && searchResults !== null) ? searchResults.filter(r=>r.description) : localFiltered;

  return (
    <>
      <SceneCanvas />
      {/* Intro */}
      {!introHidden && (
        <div className="intro" aria-hidden="true">
          <div className="intro__inner">
            <span className="intro__name">Ved Dhanokar</span>
            <span className="intro__role">Full-Stack Developer / AI/ML</span>
          </div>
        </div>
      )}

      {/* Cursor */}
      <div id="cursor" className="cursor" aria-hidden="true"></div>
      <div id="cursor-dot" className="cursor-dot" aria-hidden="true"></div>
      <div id="cursor-label" className="cursor-label" aria-hidden="true"></div>
      <a className="skip-link" href="#main">Skip to content</a>

      {/* Nav */}
      <motion.header className={`nav ${scrolled ? 'is-scrolled' : ''}`} id="nav" animate={{ y: navHidden ? -100 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
        <div className="container nav__inner">
          <a href="#hero" className="nav__brand">VD</a>
          <nav aria-label="Primary">
            <ul className="nav__links">
              <li><a href="#about" data-cursor="View">About</a></li>
              <li><a href="#work" data-cursor="View">Work</a></li>
              <li><a href="#experience" data-cursor="View">Experience</a></li>
              <li><a href="#contact" data-cursor="View">Contact</a></li>
            </ul>
          </nav>
          <button className="nav__menu" onClick={() => setMenuOpen(o=>!o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            <span></span><span></span>
          </button>
        </div>
      </motion.header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!menuOpen}>
        <nav aria-label="Mobile">
          <ul>
            <li><a href="#hero" onClick={() => setMenuOpen(false)}>Home</a></li>
            <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
            <li><a href="#work" onClick={() => setMenuOpen(false)}>Work</a></li>
            <li><a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
          </ul>
        </nav>
      </div>

      <main id="main" ref={rootRef}>
        {/* Hero */}
        <section id="hero" className="hero">
          <div className="container hero__grid">
            <div className="hero__left">
              <div className="hero__status"><span className="status-dot"></span>Available for work</div>
              <h1 className="hero__title">VED<br/>DHANOKAR</h1>
              <p className="hero__role">Full-Stack Developer / AI/ML Developer</p>
              <p className="hero__intro">I build real software, AI/ML systems and full-stack products.</p>
              <div className="hero__actions">
                <a href="#work" className="btn btn--primary magnetic" onMouseMove={magnetic} onMouseLeave={magneticLeave}>See projects</a>
                <a href="#contact" className="btn btn--ghost magnetic" onMouseMove={magnetic} onMouseLeave={magneticLeave}>Get in touch</a>
              </div>
              <div className="hero__socials">
                <a href="https://github.com/Ved2151H" target="_blank" rel="noopener">GitHub</a>
                <a href="https://www.linkedin.com/in/ved-dhanokar-b0351029b/" target="_blank" rel="noopener">LinkedIn</a>
                <a href="https://leetcode.com/u/Ved_Dhanokar/" target="_blank" rel="noopener">LeetCode</a>
              </div>
            </div>
            <div className="hero__right">
              <div className="hero__photo-wrap">
                <img src="/portrait.jpg" alt="Portrait of Ved Dhanokar" className="hero__photo" width="460" height="460" loading="eager" decoding="async" />
              </div>
            </div>
          </div>
          <div className="hero__scroll-hint">Scroll</div>
        </section>

        {/* About */}
        <section id="about" className="section">
          <div className="container">
            <div className="about__grid">
              <div className="about__left">
                <h2 className="section__title reveal">About</h2>
                <p className="about__lead reveal">Full-stack developer and AI/ML enthusiast pursuing a B.Tech in Information Technology at IICT, MGM University.</p>
                <p className="about__body reveal">I build AI/ML systems, computer vision applications, RAG-based assistants and database-driven full-stack products. From real-time accident detection to multi-tenant enterprise platforms, I ship end to end.</p>
                <div className="stats-row reveal">
                  <div className="stat"><span className="stat__num" style={{ whiteSpace: 'nowrap' }}>10+</span><div className="stat__label">Projects</div></div>
                  <div className="stat"><span className="stat__num">3</span><div className="stat__label">Hackathon Finalists</div></div>
                  <div className="stat"><span className="stat__num">8.45</span><div className="stat__label">CGPA</div></div>
                </div>
              </div>
              <div className="about__card ability-card reveal" onMouseMove={abilityTilt} onMouseLeave={abilityLeave}>
                <div className="ability-card__inner"><h3>Development</h3><p>React, Node, TypeScript, Python</p></div>
                <div className="ability-card__inner"><h3>AI / ML</h3><p>YOLOv8, TensorFlow, PyTorch, RAG</p></div>
                <div className="ability-card__inner"><h3>Backend & data</h3><p>PostgreSQL, MongoDB, Neon, Prisma</p></div>
                <div className="ability-card__inner"><h3>Problem solving</h3><p>DSA, system design, shipping</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="section">
          <div className="container">
            <h2 className="section__title reveal">Capabilities</h2>
            <SkillsConstellation />
            <div className="skills__grid">
              {SKILLS.map(g => (
                <article className="skill-card reveal" key={g.title}>
                  <h3>{g.title}</h3>
                  <p>{g.desc}</p>
                  <div className="skill-card__tags">{g.tags.map(t => <span className="skill-card__tag" key={t}>{t}</span>)}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Project Lab */}
        <ProjectLab />

        {/* GitHub */}
        <section id="github" className="section">
          <div className="container">
            <div className="github__head">
              <h2 className="section__title reveal">More on GitHub</h2>
              <a href="https://github.com/Ved2151H" target="_blank" rel="noopener" className="btn btn--ghost magnetic" onMouseMove={magnetic} onMouseLeave={magneticLeave}>View all</a>
            </div>
            <input type="search" className="gh-search" placeholder="Search repositories" aria-label="Search repositories" value={ghQuery} onChange={e => setGhQuery(e.target.value)} />
            <p className="form-status">{ghLoading ? 'Loading repositories…' : ghError ? ghError : (searchLoading ? 'Searching GitHub…' : `${displayedRepos.length} result${displayedRepos.length===1?'':'s'}`)}</p>
            <div className="gh-grid">
              {displayedRepos.slice(0,18).map(r => (
                <article className="gh-card" key={r.id}>
                  <h3>{r.name}</h3>
                  <p>{r.description || 'No description provided.'}</p>
                  <div className="gh-card__meta"><span>{r.language || '—'}</span><span>{r.stargazers_count || 0} stars</span><span>{new Date(r.updated_at).toLocaleDateString()}</span></div>
                  <a className="project-card__link" href={r.html_url} target="_blank" rel="noopener">Open</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="section">
          <div className="container">
            <h2 className="section__title reveal">Experience</h2>
            <div className="timeline" id="timeline">
              <div className="timeline__line"><div className="timeline__progress" style={{ transform: `scaleY(${timelinePct/100})` }}></div></div>
              <div className="timeline__item" data-year="2026">
                <div className="timeline__dot timeline__dot--current"></div>
                <div className="timeline__content">
                  <div className="timeline__meta">Jan 2026 to Present, Freelance</div>
                  <h3>Freelance Full-Stack / AI Developer</h3>
                  <div className="timeline__company">Independent</div>
                  <ul>
                    <li>Building full-stack web applications and AI-powered features for clients.</li>
                    <li>Designing and shipping end-to-end products across frontend, backend and data.</li>
                    <li>Integrating AI/ML capabilities into real-world client projects.</li>
                  </ul>
                </div>
              </div>
              <div className="timeline__item" data-year="2025">
                <div className="timeline__dot"></div>
                <div className="timeline__content">
                  <div className="timeline__meta">Nov 2025 to Jun 2026, Remote</div>
                  <h3>AI/ML Intern</h3>
                  <div className="timeline__company">SURE Trust</div>
                  <ul>
                    <li>Developed and trained AI/ML models using Python, Pandas, NumPy, Scikit-learn, TensorFlow, PyTorch and Seaborn.</li>
                    <li>Worked on data preprocessing, model evaluation and deep learning: ANN, CNN, RNN and RAG.</li>
                    <li>Collaborated via Git/GitHub for version control and experiment tracking.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        <section id="education" className="section">
          <div className="container">
            <h2 className="section__title reveal">Education</h2>
            <div className="edu-card reveal">
              <div className="edu-card__degree">B.Tech in Information Technology</div>
              <div className="edu-card__inst">Institute of Information and Communication Technology (IICT), MGM University</div>
              <div className="edu-card__meta">2023 to 2027, CGPA 8.45 / 10</div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section id="achievements" className="section">
          <div className="container">
            <h2 className="section__title reveal">Achievements</h2>
            <div className="ach-grid">
              <div className="ach-item reveal"><h3>Finalist, Zentrix'26 National-Level Smart City AI Hackathon</h3><p>National finalist for an automated real-time urban computer vision and AI traffic surveillance solution.</p></div>
              <div className="ach-item reveal"><h3>Finalist, Zero UI Challenge</h3><p>Cummins College of Engineering. Touch-free emergency detection via mobile sensor fusion.</p></div>
              <div className="ach-item reveal"><h3>3rd Rank, IEEE C’Quest Programming Competition</h3><p>Competitive programming and algorithmic problem solving under time constraints.</p></div>
              <div className="ach-item reveal"><h3>Google Solution Challenge Participant</h3><p>GDSC. Prototype addressing UN Sustainable Development Goals.</p></div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section id="certifications" className="section">
          <div className="container">
            <h2 className="section__title reveal">Certifications</h2>
            <div className="cert-grid">
              <div className="cert-card reveal"><div className="cert-card__title">Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate</div><div className="cert-card__meta">Oracle · 2025</div></div>
              <div className="cert-card reveal"><div className="cert-card__title">Artificial Intelligence Workshop</div><div className="cert-card__meta">Techfest, IIT Bombay × GUVI-HCL · 2024</div></div>
              <div className="cert-card reveal"><div className="cert-card__title">Prompt Engineering & Programming with OpenAI</div><div className="cert-card__meta">Deep Learning & LLM Programming · 2024</div></div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="section contact">
          <div className="container">
            <div className="contact__head">
              <h2 className="section__title reveal">Contact</h2>
              <p className="contact__lead reveal">Have an idea worth building? Let's talk.</p>
            </div>
            <div className="contact__grid">
              <div className="contact__info reveal">
                <a className="contact__row" href="mailto:dhanokarved@gmail.com"><span>Email</span><span>dhanokarved@gmail.com</span></a>
                <div className="contact__row contact__row--phone">
                  <span>Phone</span>
                  <span className="contact__phone-actions">
                    <a
                      className="contact__phone-link"
                      href={`tel:${PHONE_TEL}`}
                      aria-label={`Call ${PHONE_DISPLAY}. Press and hold to copy the number.`}
                      onPointerDown={startPhoneHold}
                      onPointerUp={endPhoneHold}
                      onPointerLeave={cancelPhoneHold}
                      onPointerCancel={cancelPhoneHold}
                      onClick={(e) => { if (Date.now() < suppressClickUntil.current) { e.preventDefault(); suppressClickUntil.current = 0; } }}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {PHONE_DISPLAY}
                    </a>
                    {phoneCopied ? (
                      <span className="contact__phone-status" role="status" aria-live="polite">Copied</span>
                    ) : null}
                  </span>
                </div>
                <a className="contact__row" href="https://github.com/Ved2151H" target="_blank" rel="noopener"><span>GitHub</span><span>Ved2151H</span></a>
                <a className="contact__row" href="https://www.linkedin.com/in/ved-dhanokar-b0351029b/" target="_blank" rel="noopener"><span>LinkedIn</span><span>Ved Dhanokar</span></a>
                <a className="contact__row" href="https://leetcode.com/u/Ved_Dhanokar/" target="_blank" rel="noopener"><span>LeetCode</span><span>Ved_Dhanokar</span></a>
              </div>
              <form className="contact__form reveal" onSubmit={submit} noValidate>
                <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" name="name" type="text" required autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="field"><label htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" required autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                <div className="field"><label htmlFor="c-subject">Subject</label><input id="c-subject" name="subject" type="text" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} /></div>
                <div className="field"><label htmlFor="c-message">Message</label><textarea id="c-message" name="message" rows="5" required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} /></div>
                <button type="submit" className="btn btn--primary magnetic" onMouseMove={magnetic} onMouseLeave={magneticLeave}>Send message</button>
                <p className="form-status" role="status" aria-live="polite">{status}</p>
              </form>
            </div>
            <div className="contact__time">{timeStr}</div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">Ved Dhanokar</div>
          <div className="footer__links">
            <a href="https://github.com/Ved2151H" target="_blank" rel="noopener">GitHub</a>
            <a href="https://www.linkedin.com/in/ved-dhanokar-b0351029b/" target="_blank" rel="noopener">LinkedIn</a>
            <a href={`tel:${PHONE_TEL}`}>Phone</a>
            <a href="mailto:dhanokarved@gmail.com">Email</a>
          </div>
          <div className="footer__meta">© 2026 Ved Dhanokar. Built by Ved.</div>
        </div>
      </footer>

      <button className={`back-to-top ${backVisible ? 'is-visible' : ''}`} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}>↑</button>
      <Terminal />
    </>
  );
}
