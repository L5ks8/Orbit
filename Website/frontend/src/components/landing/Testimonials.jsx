import React from 'react';

export default function Testimonials() {
  return (
    <section className="lp-testimonials-section">
      <div className="lp-section-label reveal">Community Love</div>
      <h2 className="lp-section-title reveal">Loved by server owners<br/>around the world.</h2>
      <div className="testimonial-grid reveal-stagger">
        <div className="testimonial-card reveal" style={{ '--i': 0 }}>
          <p className="testimonial-text">Orbit replaced 3 bots on my server. The dashboard is incredibly clean and the automod catches everything.</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">M</div>
            <div className="testimonial-info">
              <h4>MaxCraft</h4>
              <span>Gaming Community · 5.2K members</span>
            </div>
          </div>
        </div>
        <div className="testimonial-card reveal" style={{ '--i': 1 }}>
          <p className="testimonial-text">The welcome cards and level system are gorgeous. Setup took literally 2 minutes via the web dashboard.</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">S</div>
            <div className="testimonial-info">
              <h4>SkylineRP</h4>
              <span>Roleplay Server · 12K members</span>
            </div>
          </div>
        </div>
        <div className="testimonial-card reveal" style={{ '--i': 2 }}>
          <p className="testimonial-text">Best free bot I've ever used. The verification gate alone has stopped hundreds of raid bots from joining.</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">L</div>
            <div className="testimonial-info">
              <h4>Luna Community</h4>
              <span>Social Server · 8.7K members</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
