import React, { useState, useEffect, useRef } from 'react';

const COMMANDS = {
  help: 'Commands: about, skills, projects, contact, clear',
  about: 'Ved Dhanokar — Full-Stack & AI/ML Developer. B.Tech IT, IICT, MGM University.',
  skills: 'Java, Python, JavaScript, SQL, React, Node, Express, MongoDB, PostgreSQL, Neon, TensorFlow, PyTorch, OpenCV, RAG, Ollama, Docker, CI/CD',
  projects: '01 Multi-Firm Management System\n02 Accident Detection System\n03 Zero UI Emergency Detection\n04 E-Commerce Web\n05 DocuMind AI',
  contact: 'Email: dhanokarved@gmail.com | GitHub: github.com/Ved2151H | LinkedIn: linkedin.com/in/ved-dhanokar-b0351029b',
};

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState(['Type "help" for commands.']);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '`') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const run = (cmd) => {
    const c = cmd.trim().toLowerCase();
    if (c === 'clear') { setLines([]); return; }
    const out = COMMANDS[c] || `Command not found: ${c}. Type "help".`;
    setLines(l => [...l, `ved@portfolio:~$ ${cmd}`, out]);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    run(input);
    setInput('');
  };

  if (!open) return null;
  return (
    <div className="terminal-overlay" role="dialog" aria-label="Terminal">
      <div className="terminal">
        <div className="terminal__bar">
          <span>ved@portfolio</span>
          <button onClick={() => setOpen(false)} aria-label="Close terminal">✕</button>
        </div>
        <div className="terminal__body">
          {lines.map((l, i) => <pre key={i} className="terminal__line">{l}</pre>)}
          <form onSubmit={submit} className="terminal__form">
            <span className="terminal__prompt">ved@portfolio:~$</span>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} className="terminal__input" autoFocus />
          </form>
        </div>
      </div>
    </div>
  );
}
