import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LegalLayout({ title, lastUpdated, sections, children }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-120px 0px -40% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      if (window.innerWidth >= 900) {
        const container = document.querySelector('.legal-content');
        if (container) {
          const topPos = element.getBoundingClientRect().top + container.scrollTop - container.getBoundingClientRect().top - 40;
          container.scrollTo({ top: topPos, behavior: 'smooth' });
        }
      } else {
        const top = element.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="container" id="main-container">
      <div className="view legal-view">
        <div className="legal-layout">
          <aside className="legal-sidebar">
            <div className="legal-header">
              <Link to="/" className="legal-back-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Home
              </Link>
              <h1 className="legal-title">{title}</h1>
              <p className="legal-updated">Last updated: {lastUpdated}</p>
            </div>

            <div className="legal-sidebar-sticky">
              <h3 className="legal-sidebar-title">On this page</h3>
              <ul className="legal-sidebar-nav">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button 
                      onClick={() => scrollToSection(section.id)} 
                      className={`legal-sidebar-link ${activeSection === section.id ? 'active' : ''}`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="legal-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
