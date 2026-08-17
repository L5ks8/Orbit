import React, { useEffect, useRef } from 'react';

export default function Hero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;
    const PARTICLE_COUNT = 45;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const logoImg = new Image();
    logoImg.src = '/logo.png';

    function resizeCanvas() {
      const wrapper = canvas.parentElement;
      canvas.width = wrapper.offsetWidth;
      canvas.height = wrapper.offsetHeight;
    }

    function createParticle(resetY = false) {
      const isLogo = Math.random() < 0.15; // 15% chance for a logo
      const startY = resetY ? -100 : Math.random() * canvas.height;
      return {
        x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
        y: startY,
        size: isLogo ? (Math.random() * 20 + 20) : (Math.random() * 2 + 1),
        speedY: Math.random() * 5 + 4,
        speedX: Math.random() * 2 + 1, // falling down and to the right
        length: Math.random() * 80 + 40,
        opacity: Math.random() * 0.5 + 0.2,
        isLogo: isLogo,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04
      };
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > canvas.height + 150 || p.x > canvas.width + 150) {
          Object.assign(p, createParticle(true));
        }

        ctx.globalAlpha = p.opacity;
        if (p.isLogo && logoImg.complete) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.drawImage(logoImg, -p.size/2, -p.size/2, p.size, p.size);
          ctx.restore();
        } else if (!p.isLogo) {
          const v = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
          const nx = p.speedX / v;
          const ny = p.speedY / v;
          const tailEndX = p.x - nx * p.length;
          const tailEndY = p.y - ny * p.length;
          
          const grad = ctx.createLinearGradient(p.x, p.y, tailEndX, tailEndY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
          grad.addColorStop(1, `rgba(255, 255, 255, 0)`);
          
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(tailEndX, tailEndY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = p.size;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(drawParticles);
    }

    if (!reducedMotion) {
      resizeCanvas();
      initParticles();
      drawParticles();
      window.addEventListener('resize', resizeCanvas);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section className="lp-hero fade-in-up delay-1">
      <div className="lp-hero-visual" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }}></canvas>
      </div>

      <div className="lp-hero-badge fade-in-scale delay-2">
        <span className="badge-dot"></span>
        Trusted by thousands of communities
      </div>

      <h1 className="lp-hero-title">The only Discord bot<br/><span className="lp-gradient-text">you'll ever need.</span></h1>
      <p className="lp-hero-sub">Orbit is a powerful, all-in-one community management bot. Moderation, tickets, welcome cards, auto-roles and more — all configurable from a beautiful dashboard.</p>

      <div className="lp-hero-actions">
        <a href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179831&scope=bot+applications.commands" className="lp-btn-primary btn-animated" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.62,67.62,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,0,.04-.06.05-.09A71.09,71.09,0,0,0,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z"/>
          </svg>
          Add to Discord
        </a>
        <a href="/dashboard" className="lp-btn-secondary btn-animated">
          Open Dashboard
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>

      <div className="lp-scroll-indicator">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  );
}
