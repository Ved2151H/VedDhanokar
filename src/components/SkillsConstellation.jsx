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

export default function SkillsConstellation() {
  const [active, setActive] = useState(null);
  const activeGroup = GROUPS.find(g => g.id === active);

  const radius = 150;
  const cx = 200, cy = 200;

  return (
    <div className="skills-constellation">
      <div className="skills-constellation__circle">
        <svg viewBox="0 0 400 400" className="skills-constellation__svg">
        {/* connecting lines to center */}
        {GROUPS.map(g => {
          const rad = (g.angle * Math.PI) / 180;
          const x = cx + radius * Math.cos(rad);
          const y = cy + radius * Math.sin(rad);
          return (
            <motion.line
              key={g.id + '-line'}
              x1={cx} y1={cy} x2={x} y2={y}
              stroke={active === g.id ? '#d9a441' : 'rgba(255,255,255,0.08)'}
              strokeWidth={active === g.id ? 2 : 1}
              animate={{ opacity: active && active !== g.id ? 0.3 : 1 }}
            />
          );
        })}
        {/* center node */}
        <circle cx={cx} cy={cy} r="28" fill="rgba(217,164,65,0.15)" stroke="#d9a441" strokeWidth="1.5" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#f4f3f0" fontSize="13" fontFamily="Syne, sans-serif" fontWeight="700">VED</text>
        {/* group nodes */}
        {GROUPS.map(g => {
          const rad = (g.angle * Math.PI) / 180;
          const x = cx + radius * Math.cos(rad);
          const y = cy + radius * Math.sin(rad);
          const isActive = active === g.id;
          return (
            <g key={g.id} onMouseEnter={() => setActive(g.id)} onMouseLeave={() => setActive(null)} style={{ cursor: 'pointer' }}>
              <motion.circle
                cx={x} cy={y} r={isActive ? 22 : 18}
                fill={isActive ? '#d9a441' : 'rgba(255,255,255,0.06)'}
                stroke={isActive ? '#d9a441' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.5"
                animate={{ r: isActive ? 22 : 18 }}
              />
              <text x={x} y={y + 4} textAnchor="middle" fill={isActive ? '#0a0a0b' : '#f4f3f0'} fontSize="10" fontFamily="Manrope, sans-serif" fontWeight="600">
                {g.label.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
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
