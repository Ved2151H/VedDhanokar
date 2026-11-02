import React, { useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';
import ProjectVisual from './ProjectVisual.jsx';

const PROJECTS = [
  { id: 'multi-firm', number: '01', title: 'Multi-Firm Management System', desc: 'Multi-tenant operations platform for Patil Petroleum and Namrata Constructions.', tech: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL / Neon', 'REST APIs'], features: ['Multi-tenant architecture', 'Firm-level data isolation', 'Role-based access control', 'Staff management', 'Attendance tracking', 'CRUD operations', 'Reporting'], arch: ['USER', 'FRONTEND', 'REST API', 'PRISMA', 'POSTGRESQL / NEON', 'DATABASE'], github: 'https://github.com/Ved2151H/PetrolPumpAttendance', accent: '#d9a441' },
  { id: 'accident', number: '02', title: 'Accident Detection System', desc: 'Real-time accident detection and emergency dispatch via computer vision. Improved detection accuracy from 81% to 88%.', tech: ['YOLOv8', 'ByteTrack', 'Python', 'OpenCV'], features: ['Real-time video processing', 'YOLOv8 object detection', 'ByteTrack tracking', 'Geolocation', 'Prediction models', 'Live monitoring', 'Automated accident alerts'], arch: ['VIDEO', 'OPENCV', 'YOLOV8', 'BYTE TRACK', 'PREDICTION', 'ALERT'], github: 'https://github.com/Ved2151H/accident_detection_System', accent: '#ff5a5a' },
  { id: 'zero-ui', number: '03', title: 'Zero UI Emergency Detection System', desc: 'Sensor-based emergency detection using accelerometer and GPS.', tech: ['Flutter', 'FastAPI', 'SQLite'], features: ['Sensor-based emergency detection', 'Accelerometer data', 'GPS', 'Active emergency mode', 'Passive emergency mode', 'FastAPI backend', 'SQLite', 'Live monitoring dashboard', 'Automated alerts'], arch: ['SENSORS', 'DATA PROCESSING', 'FASTAPI', 'SQLITE', 'MONITORING', 'ALERT'], github: 'https://github.com/Ved2151H/ZeroUi_anomaly-detection_system', accent: '#5eead4' },
  { id: 'ecommerce', number: '04', title: 'E-Commerce Web', desc: 'Full-stack commerce platform with product management and cart.', tech: ['Node.js', 'REST APIs', 'Database integration'], features: ['Product catalog', 'Product management', 'Shopping cart', 'Admin functionality', 'REST API', 'Database integration', 'CRUD operations'], arch: ['CLIENT', 'REST API', 'SERVER', 'DATABASE'], github: 'https://github.com/Ved2151H/Karma_Web', accent: '#6ee7a0' },
  { id: 'documind', number: '05', title: 'DocuMind AI', desc: 'AI document assistant for context-aware PDF question answering.', tech: ['Ollama', 'RAG', 'Embeddings', 'Semantic Search'], features: ['Local LLM inference', 'Vector semantic search', 'PDF parsing', 'Hierarchical chunking', 'Source citation', 'Offline-first'], arch: ['PDF', 'CHUNKING', 'EMBEDDINGS', 'VECTOR SEARCH', 'LLM CORE', 'ANSWER'], github: 'https://github.com/Ved2151H/DocuMind_AI_using_-Ollama', accent: '#a78bfa' },
];

function ProjectRow({ p, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reverse = index % 2 === 1;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 22 });
  const sy = useSpring(my, { stiffness: 80, damping: 22 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.article
      ref={ref}
      className={`project-row ${reverse ? 'project-row--reverse' : ''}`}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="project-row__watermark">{p.number}</div>
      <div className="project-row__content">
        <div className="project-row__meta">
          <span className="project-row__num">{p.number} / 05</span>
          <h3 className="project-row__title">{p.title}</h3>
          <p className="project-row__desc">{p.desc}</p>
          <div className="project-row__tech">
            {p.tech.map(t => <span key={t} className="project-lab__tag">{t}</span>)}
          </div>
          <a href={p.github} target="_blank" rel="noopener" className="project-row__link">View on GitHub →</a>
        </div>
        <motion.div
          className="project-row__visual"
          style={{ rotateX, rotateY }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <ProjectVisual id={p.id} />
        </motion.div>
      </div>
    </motion.article>
  );
}

export default function ProjectLab() {
  return (
    <section id="project-lab" className="section project-lab">
      <div className="container">
        <div className="project-lab__head">
          <span className="project-lab__label">Selected Work</span>
          <span className="project-lab__counter-total">05 Projects</span>
        </div>
        <div className="project-lab__list">
          {PROJECTS.map((p, i) => (
            <ProjectRow key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
