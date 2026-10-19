'use client';

import React, { useRef, useEffect, useState } from 'react';

interface Segment {
  id: string;
  label: string;
  value: number;
  percentage: number;
  colorClass: string;
  colorHex: string;
  dashArray: string;
  dashOffset: string;
}

export function StockDonut() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [mouseParallax, setMouseParallax] = useState({ rx: -27, ry: 40, cx: 0, cy: 0 });

  const segments: Segment[] = [
    {
      id: 'green',
      label: 'Disponível',
      value: 986,
      percentage: 64.2,
      colorClass: 'green-stock',
      colorHex: '#00f59b',
      dashArray: '455.8 710',
      dashOffset: '0',
    },
    {
      id: 'yellow',
      label: 'Reservado',
      value: 120,
      percentage: 15.2,
      colorClass: 'yellow-stock',
      colorHex: '#ffd21c',
      dashArray: '107.9 710',
      dashOffset: '-458',
    },
    {
      id: 'blue',
      label: 'Em trânsito',
      value: 85,
      percentage: 12.1,
      colorClass: 'blue-stock',
      colorHex: '#2583ff',
      dashArray: '85.9 710',
      dashOffset: '-568',
    },
    {
      id: 'red',
      label: 'Bloqueado',
      value: 57,
      percentage: 8.5,
      colorClass: 'red-stock',
      colorHex: '#ff3939',
      dashArray: '60.4 710',
      dashOffset: '-656',
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 240;
    let height = 240;
    let particles: Array<{ x: number; y: number; size: number; sx: number; sy: number; alpha: number }> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 240;
      height = rect.height || 240;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = [];
      for (let i = 0; i < 28; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.6 + 0.6,
          sx: (Math.random() - 0.5) * 0.2,
          sy: (Math.random() - 0.5) * 0.2,
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.sx;
        p.y += p.sy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 210, 255, ${p.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#00e5ff';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    setMouseParallax({
      rx: -27 - ny * 35,
      ry: 40 + nx * 45,
      cx: nx * 10,
      cy: ny * 10,
    });
  };

  const handleMouseLeave = () => {
    setMouseParallax({ rx: -27, ry: 40, cx: 0, cy: 0 });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-2">
      {/* Chart Area with Particles & SVG Ring & 3D Holographic Cube */}
      <div
        className="sm:col-span-6 relative flex items-center justify-center min-h-[220px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        <div className="chart-stock relative w-48 h-48 z-10 flex items-center justify-center">
          <svg viewBox="0 0 300 300" className="w-full h-full" aria-label="Distribuição do estoque">
            <defs>
              <filter id="glowStock" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base */}
            <circle className="ring-base" cx="150" cy="150" r="113"></circle>

            {/* Glow copies */}
            <g transform="rotate(-90 150 150)">
              {segments.map((seg) => (
                <circle
                  key={`glow-${seg.id}`}
                  className={`ring-glow ${seg.colorClass} ${activeSegment === seg.id ? 'active' : ''} ${
                    activeSegment && activeSegment !== seg.id ? 'dimmed' : ''
                  }`}
                  cx="150"
                  cy="150"
                  r="113"
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                />
              ))}

              {/* Actual segmented ring */}
              {segments.map((seg) => (
                <circle
                  key={`seg-${seg.id}`}
                  className={`ring-segment ${seg.colorClass} ${activeSegment === seg.id ? 'active' : ''} ${
                    activeSegment && activeSegment !== seg.id ? 'dimmed' : ''
                  }`}
                  cx="150"
                  cy="150"
                  r="113"
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  onMouseEnter={() => setActiveSegment(seg.id)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              ))}
            </g>

            {/* Thin futuristic inner structure */}
            <circle className="inner-ring" cx="150" cy="150" r="91"></circle>
            <circle className="inner-ring" cx="150" cy="150" r="92"></circle>
          </svg>

          {/* Halo Central */}
          <div className="center-glow-stock"></div>

          {/* Circulatória Tecnológica (Anéis Giratórios) */}
          <div
            className="tech-circle-stock"
            style={{
              transform: `translate(calc(-50% + ${mouseParallax.cx * 0.4}px), calc(-50% + ${mouseParallax.cy * 0.4}px))`,
            }}
          ></div>

          {/* Pontos Orbitais */}
          <div className="dot-stock d1"></div>
          <div className="dot-stock d2"></div>
          <div className="dot-stock d3"></div>
          <div className="dot-stock d4"></div>

          {/* Cubo 3D Holográfico com Flutuação e Perspectiva */}
          <div className="cube-container-stock">
            <div
              className="cube-stock"
              style={{
                transform: `rotateX(${mouseParallax.rx}deg) rotateY(${mouseParallax.ry}deg)`,
              }}
            >
              <div className="face-stock front"></div>
              <div className="face-stock back"></div>
              <div className="face-stock right"></div>
              <div className="face-stock left"></div>
              <div className="face-stock top"></div>
              <div className="face-stock bottom"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Items with Target Dots */}
      <div className="sm:col-span-6 legend-stock" id="legendStock">
        {segments.map((seg) => {
          const isDimmed = activeSegment && activeSegment !== seg.id;
          const isSelected = activeSegment === seg.id;

          return (
            <div
              key={seg.id}
              className={`legend-row-stock ${isSelected ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
              onMouseEnter={() => setActiveSegment(seg.id)}
              onMouseLeave={() => setActiveSegment(null)}
            >
              <span className="status-indicator-dot" style={{ color: seg.colorHex }}></span>
              <span className="legend-label-stock">{seg.label}</span>
              <span
                className="legend-value-stock"
                style={{
                  color: seg.colorHex,
                  filter: `drop-shadow(0 0 8px ${seg.colorHex}66)`,
                }}
              >
                {seg.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
