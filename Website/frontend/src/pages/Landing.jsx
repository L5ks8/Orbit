import React from 'react';
import Hero from '../components/landing/Hero';
import Stats from '../components/landing/Stats';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import Faq from '../components/landing/Faq';
import Footer from '../components/landing/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Landing() {
  useScrollReveal();

  return (
    <div className="container" id="main-container">
      <div id="view-landing" className="view">
        <div className="landing-wrapper">
          <canvas id="hero-particles" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}></canvas>
          <Hero />
          <Stats />
          <Features />
          <HowItWorks />
          <Testimonials />
          <Faq />
          <Footer />
        </div>
      </div>
    </div>
  );
}
