// Particle background using tsParticles
import { tsParticles } from 'tsparticles-engine';

export function initParticles() {
  tsParticles.load('particle-background', {
    background: { color: 'transparent' },
    particles: {
      number: { value: 60 },
      color: { value: '#90CAF9' },
      shape: { type: 'circle' },
      opacity: { value: 0.3 },
      size: { value: 4 },
      move: { enable: true, speed: 1 }
    },
    interactivity: { events: { onhover: { enable: true, mode: 'repulse' } } }
  });
}
