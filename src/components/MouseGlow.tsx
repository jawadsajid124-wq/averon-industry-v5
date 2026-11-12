import React, { useEffect, useState, useRef } from 'react';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

interface TouchParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const MouseGlow: React.FC = () => {
  // Desktop state
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [isMouseVisible, setIsMouseVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Mobile touch points state
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<TouchParticle[]>([]);
  const ripplesRef = useRef<TouchRipple[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Respect user reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect touch capability
    const touchCapable =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchCapable);

    // Desktop Mouse Handlers
    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isMouseVisible) setIsMouseVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsMouseVisible(false);

    // Mobile Touch Handlers
    const handleTouchStart = (e: TouchEvent) => {
      const newPoints: TouchPoint[] = [];
      const now = Date.now();

      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        newPoints.push({
          id: t.identifier,
          x: t.clientX,
          y: t.clientY,
          opacity: 1
        });

        if (!prefersReducedMotion) {
          // Trigger subtle electric-red tap ripple
          ripplesRef.current.push({
            id: now + i,
            x: t.clientX,
            y: t.clientY,
            radius: 8,
            maxRadius: 46,
            alpha: 0.65
          });

          // Emit small initial touch burst of 3-4 particles
          for (let p = 0; p < 3; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.6 + Math.random() * 1.4;
            particlesRef.current.push({
              x: t.clientX,
              y: t.clientY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 2 + Math.random() * 2,
              alpha: 0.8,
              life: 0,
              maxLife: 24 + Math.random() * 12
            });
          }
        }
      }
      setTouchPoints(newPoints);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const activePoints: TouchPoint[] = [];

      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        activePoints.push({
          id: t.identifier,
          x: t.clientX,
          y: t.clientY,
          opacity: 1
        });

        // Spawn lightweight electric-red particle trail on finger drag
        if (!prefersReducedMotion && Math.random() < 0.6) {
          particlesRef.current.push({
            x: t.clientX + (Math.random() - 0.5) * 6,
            y: t.clientY + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8 - 0.3,
            size: 2 + Math.random() * 2,
            alpha: 0.75,
            life: 0,
            maxLife: 18 + Math.random() * 10
          });
        }
      }
      setTouchPoints(activePoints);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        setTouchPoints([]);
      } else {
        const remaining: TouchPoint[] = [];
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          remaining.push({
            id: t.identifier,
            x: t.clientX,
            y: t.clientY,
            opacity: 1
          });
        }
        setTouchPoints(remaining);
      }
    };

    // Unified Animation loop (runs desktop lerp + mobile particle/ripple canvas)
    const animate = () => {
      // 1. Desktop lerp
      const ease = 0.14;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      setMousePos({ x: currentX, y: currentY });

      // 2. Mobile canvas render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Update & draw ripples
          for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
            const r = ripplesRef.current[i];
            r.radius += (r.maxRadius - r.radius) * 0.18;
            r.alpha *= 0.88;

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${r.alpha.toFixed(3)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Inner fill
            ctx.fillStyle = `rgba(220, 38, 38, ${(r.alpha * 0.15).toFixed(3)})`;
            ctx.fill();

            if (r.alpha < 0.02 || r.radius >= r.maxRadius - 1) {
              ripplesRef.current.splice(i, 1);
            }
          }

          // Update & draw particle trail
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life += 1;
            const progress = p.life / p.maxLife;
            const currentAlpha = p.alpha * (1 - progress);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0, currentAlpha).toFixed(3)})`;
            ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.life >= p.maxLife) {
              particlesRef.current.splice(i, 1);
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    // Canvas resize sync
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Passive touch listeners to ensure zero scroll interference
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isMouseVisible]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 1. Mobile & Touch Screen: Canvas for Electric-Red Particle Trail and Tap Ripples */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
      />

      {/* 2. Mobile Touch Glowing Aura around active finger positions */}
      {touchPoints.map((tp) => (
        <div
          key={tp.id}
          className="absolute rounded-full pointer-events-none transition-transform duration-75 ease-out"
          style={{
            width: '140px',
            height: '140px',
            left: `${tp.x}px`,
            top: `${tp.y}px`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(220, 38, 38, 0.08) 45%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(16px)',
          }}
        />
      ))}

      {/* 3. Desktop Cursor Glow (Rendered only on mouse movement, never a fake cursor on mobile) */}
      {isMouseVisible && (
        <>
          {/* Outer Ethereal Electric Cyan Bloom */}
          <div
            className="absolute rounded-full transition-transform duration-100 ease-out"
            style={{
              width: isClicking ? '360px' : '420px',
              height: isClicking ? '360px' : '420px',
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.13) 0%, rgba(0, 102, 255, 0.05) 45%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Inner Precision Cyan Core Light */}
          <div
            className="absolute rounded-full transition-transform duration-75 ease-out"
            style={{
              width: isClicking ? '110px' : '150px',
              height: isClicking ? '110px' : '150px',
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.20) 0%, rgba(56, 189, 248, 0.08) 40%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(14px)',
            }}
          />
        </>
      )}
    </div>
  );
};
