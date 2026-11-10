import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const GROUPS = [
  { id: 'prog', label: 'Programming', skills: ['Java', 'Python', 'JavaScript', 'SQL'], angle: 0 },
  { id: 'fe', label: 'Frontend & Backend', skills: ['React.js', 'Node.js', 'Express.js', 'REST APIs', 'Axios', 'Mongoose'], angle: 60 },
  { id: 'db', label: 'Databases', skills: ['MongoDB', 'MySQL', 'PostgreSQL', 'Neon', 'Prisma ORM'], angle: 120 },
  { id: 'aiml', label: 'AI / ML', skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenCV', 'CNN', 'ANN'], angle: 180 },
  { id: 'nlp', label: 'NLP / AI', skills: ['RAG', 'Ollama', 'Semantic Search', 'Tokenization'], angle: 240 },
  { id: 'tools', label: 'Developer Tools', skills: ['Git', 'Docker', 'Jenkins', 'CI/CD', 'Postman'], angle: 300 },
];

// Stage coordinate space (viewBox is 400x400 and scales to the stage width).
const STAGE = 400;
const CENTER = STAGE / 2;
const RADIUS = 150;

// Estimate node size based on label length and screen size.
function nodeSize(label, hover, compact) {
  const base = compact ? 44 : 52;
  if (!hover) return base;
  const size = Math.max(compact ? 76 : 100, label.length * (compact ? 7.5 : 9) + (compact ? 32 : 40));
  return Math.min(size, compact ? 140 : 240);
}

function useCompact() {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 600px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const onChange = (e) => setCompact(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);
  return compact;
}

export default function SkillsConstellation() {
  const [active, setActive] = useState(null);
  const compact = useCompact();
  const activeGroup = GROUPS.find(g => g.id === active);

  return (
    <div className="skills-constellation">
      <div className="skills-constellation__stage">
        <svg viewBox="0 0 400 400" className="skills-constellation__svg" aria-hidden="true">
          {GROUPS.map(g => {
            const rad = (g.angle * Math.PI) / 180;
            const x = CENTER + RADIUS * Math.cos(rad);
            const y = CENTER + RADIUS * Math.sin(rad);
            const isActive = active === g.id;
            return (
              <motion.line
                key={g.id + '-line'}
                x1={CENTER} y1={CENTER} x2={x} y2={y}
                stroke={isActive ? '#d9a441' : 'rgba(255,255,255,0.1)'}
                strokeWidth={isActive ? 2 : 1}
                animate={{ opacity: active && !isActive ? 0.35 : 1 }}
              />
            );
          })}
        </svg>
        {/* center node */}
        <div className="skills-node skills-node--center" style={{ left: '50%', top: '50%' }}>
          <span className="skills-node__label">VED</span>
        </div>
        {/* group nodes */}
        {GROUPS.map((g, i) => {
          const rad = (g.angle * Math.PI) / 180;
          const x = CENTER + RADIUS * Math.cos(rad);
          const y = CENTER + RADIUS * Math.sin(rad);
          const isActive = active === g.id;
          const isDimmed = active !== null && !isActive;
          const size = nodeSize(g.label, isActive, compact);
          return (
            <motion.div
              key={g.id}
              className={`skills-node ${isActive ? 'skills-node--active' : ''}`}
              style={{ left: `${(x / STAGE) * 100}%`, top: `${(y / STAGE) * 100}%`, zIndex: isActive ? 10 : 1, animation: isActive ? 'none' : `skillsFloat 3s ease-in-out ${i * 0.3}s infinite` }}
              onMouseEnter={() => setActive(g.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(g.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === g.id ? null : g.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(active === g.id ? null : g.id); }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isActive}
              aria-label={g.label}
              initial={false}
              animate={{ opacity: isDimmed ? 0.5 : 1 }}
            >
              <motion.div
                className="skills-node__bg"
                animate={{ width: size, height: size }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              />
              <span className="skills-node__label">{g.label}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="skills-constellation__panel">
        {activeGroup ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={activeGroup.id}>
            <div className="skills-constellation__panel-title">{activeGroup.label}</div>
            <div className="skills-constellation__panel-skills">
              {activeGroup.skills.map(s => <span key={s} className="skill-card__tag">{s}</span>)}
            </div>
          </motion.div>
        ) : (
          <div className="skills-constellation__hint">Hover or tap a node to explore skills</div>
        )}
      </div>
    </div>
  );
}
