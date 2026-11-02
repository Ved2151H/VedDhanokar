import React, { useRef, useEffect } from 'react';
import { ThreeScene } from '../three/ThreeScene.js';

export default function SceneCanvas() {
  const ref = useRef(null);
  const sceneRef = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const s = new ThreeScene(canvas);
    sceneRef.current = s;
    return () => { s.destroy(); sceneRef.current = null; };
  }, []);
  return <canvas ref={ref} className="scene-canvas" aria-hidden="true" />;
}
