"use client";

import { useState } from 'react';

export function JoinForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [languages, setLanguages] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/vendor-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          phone, 
          city, 
          languages, 
          experience, 
          portfolio, 
          talentType: 'Emcees/ MC/ Compere' 
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit application');
      }

      setStatus('success');
      setName('');
      setPhone('');
      setCity('');
      setLanguages('');
      setExperience('');
      setPortfolio('');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="join-form-wrapper">
      {status === 'success' ? (
        <div className="join-success">
          <div className="success-icon">✓</div>
          <h3>Application Submitted!</h3>
          <p>Thank you for your interest. We have received your details and will be in touch soon.</p>
          <button className="join-submit-btn" onClick={() => setStatus('idle')}>Submit Another</button>
        </div>
      ) : (
        <form className="join-form" onSubmit={handleSubmit}>
          <div className="join-field">
            <label htmlFor="join-name">Full name</label>
            <input id="join-name" type="text" placeholder="Your full name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="join-field">
            <label htmlFor="join-phone">WhatsApp number</label>
            <input id="join-phone" type="text" placeholder="07X XXX XXXX" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="join-field">
            <label htmlFor="join-city">City / area</label>
            <input id="join-city" type="text" placeholder="e.g. Colombo, Kandy, Galle" required value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="join-field">
            <label htmlFor="join-lang">Languages you host in</label>
            <input id="join-lang" type="text" placeholder="e.g. Sinhala, English" required value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </div>
          <div className="join-field">
            <label htmlFor="join-exp">Years of experience</label>
            <input id="join-exp" type="text" placeholder="e.g. 5 years" required value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>
          <div className="join-field">
            <label htmlFor="join-port">Instagram / portfolio or sample video link</label>
            <input id="join-port" type="text" placeholder="Paste a link to your work" required value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
          </div>
          
          {status === 'error' && <p className="join-error">Failed to submit. Please try again.</p>}
          
          <button type="submit" className="join-submit-btn" disabled={status === 'loading'}>
            {status === 'loading' ? 'Submitting...' : 'Submit and get a call back'}
          </button>
          
          <p className="join-disclaimer">No payment now. We'll confirm pricing and next steps by phone before anything is finalised.</p>
        </form>
      )}
    </div>
  );
}
