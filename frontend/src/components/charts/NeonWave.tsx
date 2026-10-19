'use client';

import React, { useRef, useEffect } from 'react';

interface NeonWaveProps {
  color?: 'cyan' | 'rose' | 'amber' | 'emerald';
  timeOffset?: number;
}

export function NeonWave({
  color = 'cyan',
  timeOffset = 0,
}: NeonWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId: number;
    let waveTime = 0;

    const configs = {
      cyan: {
        rawPts: [[-1.0, -0.4], [-0.75, 0.1], [-0.5, -0.3], [-0.25, 0.35], [0.05, -0.15], [0.35, 0.15], [0.65, 0.5], [0.85, 0.2], [1.0, 0.45]],
        beams: [
          { normX: -0.75, height: 16, strength: 0.35 },
          { normX: -0.25, height: 22, strength: 0.45 },
          { normX: 0.35, height: 16, strength: 0.30 },
          { normX: 0.65, height: 24, strength: 0.48 },
          { normX: 1.0, height: 20, strength: 0.35 },
        ],
        theme: { glow: 'rgba(0, 229, 255, ', aura: 'rgba(0, 110, 240, ', dot: '#00e5ff' },
        defaultOffset: 0.0,
      },
      rose: {
        rawPts: [[-1.0, 0.45], [-0.75, -0.3], [-0.5, -0.45], [-0.2, 0.5], [0.1, -0.4], [0.4, 0.25], [0.7, -0.45], [0.9, -0.2], [1.0, -0.35]],
        beams: [
          { normX: -1.0, height: 22, strength: 0.45 },
          { normX: -0.2, height: 25, strength: 0.50 },
          { normX: 0.4, height: 18, strength: 0.35 },
          { normX: 0.9, height: 14, strength: 0.25 },
        ],
        theme: { glow: 'rgba(244, 63, 94, ', aura: 'rgba(180, 20, 60, ', dot: '#f43f5e' },
        defaultOffset: 0.8,
      },
      amber: {
        rawPts: [[-1.0, -0.35], [-0.75, -0.15], [-0.45, -0.35], [-0.15, -0.15], [0.08, 0.58], [0.3, -0.4], [0.55, -0.2], [0.8, 0.15], [1.0, -0.1]],
        beams: [
          { normX: -0.75, height: 14, strength: 0.25 },
          { normX: 0.08, height: 28, strength: 0.55 },
          { normX: 0.8, height: 16, strength: 0.30 },
        ],
        theme: { glow: 'rgba(245, 158, 11, ', aura: 'rgba(190, 110, 10, ', dot: '#f59e0b' },
        defaultOffset: 1.6,
      },
      emerald: {
        rawPts: [[-1.0, -0.45], [-0.7, -0.25], [-0.4, 0.1], [-0.15, -0.2], [0.15, 0.15], [0.45, -0.05], [0.65, 0.45], [0.85, 0.25], [1.0, 0.55]],
        beams: [
          { normX: -0.4, height: 15, strength: 0.30 },
          { normX: 0.15, height: 18, strength: 0.35 },
          { normX: 0.65, height: 24, strength: 0.48 },
          { normX: 1.0, height: 26, strength: 0.50 },
        ],
        theme: { glow: 'rgba(0, 245, 155, ', aura: 'rgba(10, 150, 90, ', dot: '#00f59b' },
        defaultOffset: 2.4,
      },
    }[color];

    const actualOffset = timeOffset || configs.defaultOffset;
    let width = 160;
    let height = 48;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 160;
      height = rect.height || 48;
      const dpr = Math.max(window.devicePixelRatio || 1, 2) * 1.5;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function drawSpline(pts: { x: number; y: number }[], targetCtx: CanvasRenderingContext2D) {
      if (pts.length < 2) return;
      targetCtx.moveTo(pts[0].x, pts[0].y);
      const tension = 0.32;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i > 0 ? pts[i - 1] : pts[0];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        targetCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    }

    const render = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      const padX = 2;
      const plotW = width - padX * 2;
      const plotBase = height - 5;
      const plotH = height * 0.72;

      const currentPts = configs.rawPts.map(([nx, ny], idx) => {
        const u = idx / (configs.rawPts.length - 1);
        const px = padX + ((nx + 1.0) / 2.0) * plotW;
        const pyBase = plotBase - ((ny + 0.5) / 1.15) * plotH;

        const wave =
          Math.sin((t + actualOffset) * 1.8 + u * 10.0) * 0.65 +
          Math.cos((t + actualOffset) * 2.5 - u * 6.0) * 0.35;

        return { x: px, y: pyBase + wave };
      });

      const pulse = 0.88 + Math.sin((t + actualOffset) * 2.0) * 0.12;

      // 1. Degradê Inferior Aberto
      ctx.save();
      ctx.beginPath();
      drawSpline(currentPts, ctx);
      ctx.lineTo(currentPts[currentPts.length - 1].x, height + 10);
      ctx.lineTo(currentPts[0].x, height + 10);
      ctx.closePath();

      const trailG = ctx.createLinearGradient(0, plotBase - plotH, 0, height);
      trailG.addColorStop(0, `${configs.theme.aura}${0.24 * pulse})`);
      trailG.addColorStop(0.55, `${configs.theme.aura}${0.06 * pulse})`);
      trailG.addColorStop(1.0, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = trailG;
      ctx.fill();
      ctx.restore();

      // 2. Feixes / Raios Verticais Luminosos sob os Picos
      if (configs.beams && configs.beams.length > 0) {
        ctx.save();
        ctx.lineCap = 'round';
        configs.beams.forEach((b, idx) => {
          const targetX = padX + ((b.normX + 1.0) / 2.0) * plotW;
          let closest = currentPts[0];
          let minDist = 9999;
          for (const p of currentPts) {
            const d = Math.abs(p.x - targetX);
            if (d < minDist) {
              minDist = d;
              closest = p;
            }
          }

          const beamPulse = 0.85 + 0.15 * Math.sin((t + actualOffset) * 1.6 + idx * 0.8);
          const beamHeight = (b.height || 18) * (height / 48);
          const beamGrad = ctx.createLinearGradient(0, closest.y, 0, closest.y + beamHeight);
          beamGrad.addColorStop(0, `${configs.theme.glow}${(b.strength || 0.35) * 0.9 * beamPulse})`);
          beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.moveTo(closest.x, closest.y);
          ctx.lineTo(closest.x, closest.y + beamHeight);
          ctx.strokeStyle = beamGrad;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        });
        ctx.restore();
      }

      // 3. Glow Layers Multi-pass
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Pass 1: Aura profunda
      ctx.beginPath();
      drawSpline(currentPts, ctx);
      ctx.lineWidth = 9.0;
      ctx.strokeStyle = `${configs.theme.aura}${0.28 * pulse})`;
      ctx.shadowBlur = 14;
      ctx.shadowColor = `${configs.theme.glow}${0.55 * pulse})`;
      ctx.stroke();

      // Pass 2: Glow médio neon
      ctx.beginPath();
      drawSpline(currentPts, ctx);
      ctx.lineWidth = 3.8;
      ctx.strokeStyle = `${configs.theme.glow}${0.85 * pulse})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `${configs.theme.glow}${0.95 * pulse})`;
      ctx.stroke();

      // Pass 3: Lâmina central pura
      ctx.beginPath();
      drawSpline(currentPts, ctx);
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowBlur = 2;
      ctx.shadowColor = '#FFFFFF';
      ctx.stroke();

      ctx.restore();

      // 4. Pontinho de Luz Neon no final da linha
      const lastPt = currentPts[currentPts.length - 1];
      ctx.save();
      ctx.beginPath();
      ctx.arc(lastPt.x, lastPt.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 6;
      ctx.shadowColor = configs.theme.dot || '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(lastPt.x, lastPt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `${configs.theme.glow}${0.5 * pulse})`;
      ctx.fill();
      ctx.restore();
    };

    const loop = () => {
      waveTime += 0.022;
      render(waveTime);
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [color, timeOffset]);

  return (
    <div className="mini-wave-canvas-wrap">
      <canvas ref={canvasRef} />
    </div>
  );
}
