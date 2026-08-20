import React, { useState } from 'react';

const faqs = [
  {
    question: "Is Orbit really free?",
    answer: "Yes! Orbit is completely free to use with all features included. No hidden fees, no premium tiers, no paywalls. Every feature you see is available to everyone."
  },
  {
    question: "How do I configure Orbit?",
    answer: "Just click \"Open Dashboard\" above, login with Discord, and select your server. Every feature can be configured visually — no commands or coding required."
  },
  {
    question: "What permissions does Orbit need?",
    answer: "Orbit requests standard moderation permissions (manage messages, manage roles, kick/ban members). You can customize which permissions to grant during the invite process."
  },
  {
    question: "Can I use Orbit on multiple servers?",
    answer: "Absolutely! You can add Orbit to as many servers as you want. Each server has its own independent configuration via the dashboard."
  },
  {
    question: "Where can I get help?",
    answer: "Join our Support Server! Our team and community are always happy to help with setup, troubleshooting, or feature requests."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="lp-faq-section">
      <div className="lp-section-label reveal">FAQ</div>
      <h2 className="lp-section-title reveal">Frequently asked<br/>questions.</h2>
      <div className="reveal">
        {faqs.map((faq, index) => (
          <div className={`faq-item ${openIndex === index ? 'active' : ''}`} key={index}>
            <button className="faq-question" onClick={() => toggleFaq(index)}>
              {faq.question}
              <svg className="faq-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <div className="faq-answer">
              <div className="faq-answer-inner">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
