"use client";

import { useState } from 'react';

export function JoinForm() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [languages, setLanguages] = useState('');
  const [startingRate, setStartingRate] = useState('');
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
          whatsapp,
          email,
          city,
          languages,
          startingRate
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit application');
      }

      setStatus('success');
      setName('');
      setWhatsapp('');
      setEmail('');
      setCity('');
      setLanguages('');
      setStartingRate('');
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
            <label htmlFor="join-whatsapp">WhatsApp number</label>
            <input id="join-whatsapp" type="text" placeholder="07X XXX XXXX" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div className="join-field">
            <label htmlFor="join-email">Email Address</label>
            <input id="join-email" type="email" placeholder="you@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
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
            <label htmlFor="join-rate">Starting rate per event</label>
            <input id="join-rate" type="text" placeholder="e.g. LKR 50,000" required value={startingRate} onChange={(e) => setStartingRate(e.target.value)} />
          </div>

          {status === 'error' && <p className="join-error">Failed to submit. Please try again.</p>}

          <button type="submit" className="join-submit-btn" disabled={status === 'loading'}>
            {status === 'loading' ? 'Submitting...' : 'Submit'}
          </button>

          <p className="join-disclaimer">No payment now. We will confirm pricing and next steps via Ruvi@mentspire.com before anything is finalised. Please do not make any payment to any bank account sent via any other email except Ruvi@mentspire.com only and that too upon speaking with you. We will not take responsibility if you use any other modes.</p>
        </form>
      )}
    </div>
  );
}
