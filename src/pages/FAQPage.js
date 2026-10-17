// DONE — Dedicated FAQ & Knowledgebase Page (React 19 Component)
import { React, useState, html } from '../react-helpers.js';
import { PublicHeader, PublicFooter } from '../components/PublicNav.js';

export function FAQPage({ navigate }) {
  const [activeCategory, setActiveCategory] = useState('general');

  const handleNav = (url) => (e) => {
    e.preventDefault();
    navigate(url);
  };

  const faqs = [
    {
      category: 'general',
      q: 'Normal WhatsApp to free hai, koi DONE kyu istemal karega?',
      a: 'WhatsApp sirf ek messaging app hai, request resolution platform nahi. Normal WhatsApp par jab aap 3 alag cheezein maangte hain (jaise PAN card, quote approval, aur ₹15,000 advance), toh baatein 50 family chats ke neeche dab jaati hain. Recipient bhool jata hai, screenshot dhundne padte hain, aur hisaab rakhna mushkil ho jata hai. DONE un sabhi cheezon ko ek single trackable link me badal deta hai jismein 0/3 → 1/3 → 2/3 → DONE real-time progress dikhti hai.'
    },
    {
      category: 'general',
      q: 'Kya recipient ko koi app download ya login karna padega?',
      a: 'Bilkul nahi! DONE ka sabse bada breakthrough yehi hai ki Recipient ko na koi app download karni hai, na password banana hai, aur na hi koi account create karna hai. Woh link par click karte hi seedhe browser me secure screen kholkar document upload ya UPI payment complete kar sakta hai.'
    },
    {
      category: 'whatsapp',
      q: 'Agar WhatsApp API use karenge to paise kharch honge kya?',
      a: 'Nahi! DONE dono modes support karta hai: (1) Free Direct Share: Aap bina kisi cost ke normal WhatsApp se single-click link bhej sakte hain (free click-to-chat protocol). (2) Enterprise Automated Reminders: Agar aap chaotic followup se bachne ke liye system se automatic automated background alerts bhejna chahte hain, tab Meta WhatsApp Business API use hota hai jiska minimal standard utility charge lagta hai. Choice 100% aapki hai.'
    },
    {
      category: 'whatsapp',
      q: 'Template banane mein time waste kyu karein?',
      a: 'Aapko naye templates banane ki zaroorat hi nahi hai! DONE me India ke top professions ke pre-built industry templates pehle se loaded hain (CA Tax Filing, Freelance Advance, Vendor Onboarding, Quotation Sign-off). Aur agar aap chahein toh hamara AI composer sirf ek Hinglish line likhne par ("Rahul se GST aur ₹10,000 chahiye") 2 second me request structure taiyyar kar deta hai.'
    },
    {
      category: 'payments',
      q: 'Payment mere account me kaise aayegi? Kya DONE paise hold karta hai?',
      a: 'DONE kabhi bhi aapke paise hold nahi karta! Jab recipient "Pay Advance" par click karta hai, toh uske phone me direct official UPI intent (GPay, PhonePe, Paytm, BHIM) khulta hai aur paise seedhe aapke business bank account / UPI ID me transfer hote hain. Ya fir aapka verified Razorpay/Cashfree gateway account connect hota hai.'
    },
    {
      category: 'legal',
      q: 'Kya quote approval ya document upload legally valid hai?',
      a: 'Haan. Indian Information Technology Act, 2000 ke Section 10A ke tehat digital confirmations aur electronic contracts valid hain. DONE har ek action ka timestamped cryptographic audit log, IP address, aur browser hash record karta hai jo non-repudiation proof ke roop me valid rehta hai.'
    },
    {
      category: 'security',
      q: 'Kya DONE humari party ya recipient ka data dusro ko bechta hai?',
      a: 'Katai nahi! DONE Qsura India Pvt Ltd dwara operated hai aur hum India ke Digital Personal Data Protection (DPDP) Act 2023 ko strictly follow karte hain. Humara business model software subscriptions ka hai, na ki user data ya contacts monetize karne ka. Senders kisi bhi waqt apna poora data 1-click me export ya delete kar sakte hain.'
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory || activeCategory === 'general');

  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/faq" navigate=${navigate} />

      <main className="public-content-page">
        <section className="page-hero-section text-center">
          <div className="landing-container">
            <div className="eyebrow">HELP & CLARITY</div>
            <h1 className="page-hero-title">Frequently Asked Questions</h1>
            <p className="page-hero-lead">
              Everything you need to know about DONE — how it works, pricing, security, WhatsApp sharing, and recipient convenience.
            </p>

            <div className="faq-category-pills">
              <button 
                className=${`faq-pill ${activeCategory === 'general' ? 'active' : ''}`}
                onClick=${() => setActiveCategory('general')}
              >
                All Common Questions
              </button>
              <button 
                className=${`faq-pill ${activeCategory === 'whatsapp' ? 'active' : ''}`}
                onClick=${() => setActiveCategory('whatsapp')}
              >
                WhatsApp & Templates
              </button>
              <button 
                className=${`faq-pill ${activeCategory === 'payments' ? 'active' : ''}`}
                onClick=${() => setActiveCategory('payments')}
              >
                Payments & UPI
              </button>
              <button 
                className=${`faq-pill ${activeCategory === 'legal' ? 'active' : ''}`}
                onClick=${() => setActiveCategory('legal')}
              >
                Legal & Security
              </button>
            </div>
          </div>
        </section>

        <section className="section-block bg-white">
          <div className="landing-container content-narrow">
            <div className="faq-accordion-list">
              ${filteredFaqs.map((faq, idx) => html`
                <div key=${idx} className="faq-item card">
                  <h3 className="faq-question">
                    <span className="faq-q-badge">Q</span>
                    ${faq.q}
                  </h3>
                  <div className="faq-answer">
                    <p>${faq.a}</p>
                  </div>
                </div>
              `)}
            </div>

            <div className="faq-help-footer card text-center mt-24">
              <h3>Still have questions?</h3>
              <p className="text-muted mb-20">Our product and legal support team is happy to assist you directly.</p>
              <a href="/contact" className="btn btn-primary" onClick=${handleNav('/contact')}>
                Contact Support / Sales →
              </a>
            </div>
          </div>
        </section>
      </main>

      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}
