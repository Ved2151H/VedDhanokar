import React, { useState } from 'react';
import { motion } from 'motion/react';

const GROUPS = [
  { id: 'prog', label: 'Programming', skills: ['Java', 'Python', 'JavaScript', 'SQL'], angle: 0 },
  { id: 'fe', label: 'Frontend & Backend', skills: ['React.js', 'Node.js', 'Express.js', 'REST APIs', 'Axios', 'Mongoose'], angle: 60 },
  { id: 'db', label: 'Databases', skills: ['MongoDB', 'MySQL', 'PostgreSQL', 'Neon', 'Prisma ORM'], angle: 120 },
  { id: 'aiml', label: 'AI / ML', skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenCV', 'CNN', 'ANN'], angle: 180 },
  { id: 'nlp', label: 'NLP / AI', skills: ['RAG', 'Ollama', 'Semantic Search', 'Tokenization'], angle: 240 },
  { id: 'tools', label: 'Developer Tools', skills: ['Git', 'Docker', 'Jenkins', 'CI/CD', 'Postman'], angle: 300 },
];

// Estimate hover node size based on label length
function nodeSize(label, hover) {
  if (!hover) return 52;
  return Math.max(100, label.length * 9 + 40);
}

export default function SkillsConstellation() {
  const [active, setActive] = useState(null);
  const activeGroup = GROUPS.find(g => g.id === active);
  const radius = 150;
  const cx = 200, cy = 200;

  return (
    <div className="skills-constellation">
      <div className="skills-constellation__stage">
        <svg viewBox="0 0 400 400" className="skills-constellation__svg">
          {GROUPS.map(g => {
            const rad = (g.angle * Math.PI) / 180;
            const x = cx + radius * Math.cos(rad);
            const y = cy + radius * Math.sin(rad);
            const isActive = active === g.id;
            return (
              <motion.line
                key={g.id + '-line'}
                x1={cx} y1={cy} x2={x} y2={y}
                stroke={isActive ? '#d9a441' : 'rgba(255,255,255,0.1)'}
                strokeWidth={isActive ? 2 : 1}
                animate={{ opacity: active && !isActive ? 0.35 : 1 }}
              />
            );
          })}
        </svg>
        {/* center node */}
        <div className="skills-node skills-node--center" style={{ left: cx, top: cy }}>
          <span>VED</span>
        </div>
        {/* group nodes */}
        {GROUPS.map((g, i) => {
          const rad = (g.angle * Math.PI) / 180;
          const x = cx + radius * Math.cos(rad);
          const y = cy + radius * Math.sin(rad);
          const isActive = active === g.id;
          const isDimmed = active !== null && !isActive;
          const size = nodeSize(g.label, isActive);
          return (
            <motion.div
              key={g.id}
              className={`skills-node ${isActive ? 'skills-node--active' : ''}`}
              style={{ left: x, top: y, zIndex: isActive ? 10 : 1, animation: isActive ? 'none' : `skillsFloat 3s ease-in-out ${i * 0.3}s infinite` }}
              onMouseEnter={() => setActive(g.id)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === g.id ? null : g.id)}
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
          <div className="skills-constellation__hint">Hover a node to explore skills</div>
        )}
      </div>
    </div>
  );
}
