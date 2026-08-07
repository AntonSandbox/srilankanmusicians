"use client";

import '../home-new.css';
import { useState } from 'react';
import { SERVICES } from '@/lib/constants';

export default function BecomeVendorPage() {
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
        body: JSON.stringify({ name, whatsapp, email, city, languages, startingRate }),
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
    <div className="new-home">
      <header id="siteHeader">
        <div className="wrap">
          <nav>
            <a href="/" className="logo"><img src="/Cake Artistsrilankan_cake_artist.png" alt="Sri Lankan Event Portal" style={{ height: '40px', width: 'auto' }} /></a>
            <div className='flex gap-5'>
              <a href="/become-vendor" className="nav-cta">Become a Cake Artist</a>
            </div>
          </nav>
        </div>
      </header>

      <section className="hero" style={{ minHeight: 'calc(100vh - 80px)', paddingBottom: '80px' }}>
        <div className="wrap">
          <div className="eyebrow">Join Our Platform</div>
          <h1>Become a Cake Artist</h1>

          <div className="mt-12 max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-left" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--espresso)' }}>Application Submitted!</h3>
                <p className="text-gray-600 mb-6">Thank you for your interest. We have received your details and will be in touch soon.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="w-full py-3 px-4 rounded-full font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--saffron)', color: 'var(--espresso)' }}
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--espresso)' }}>Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E8960C] focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium mb-2" style={{ color: 'var(--espresso)' }}>WhatsApp Number</label>
                  <input
                    type="tel"
                    id="whatsapp"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    placeholder="07X XXX XXXX"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--espresso)' }}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    placeholder="you@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2" style={{ color: 'var(--espresso)' }}>City / Area</label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    placeholder="e.g. Colombo 03"
                  />
                </div>

                <div>
                  <label htmlFor="languages" className="block text-sm font-medium mb-2" style={{ color: 'var(--espresso)' }}>Languages you host in</label>
                  <input
                    type="text"
                    id="languages"
                    required
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    placeholder="e.g. English, Sinhala"
                  />
                </div>

                <div>
                  <label htmlFor="startingRate" className="block text-sm font-medium mb-2" style={{ color: 'var(--espresso)' }}>Starting Rate per Event</label>
                  <input
                    type="text"
                    id="startingRate"
                    required
                    value={startingRate}
                    onChange={(e) => setStartingRate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    placeholder="e.g. LKR 50,000"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">Failed to submit. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 px-4 rounded-full font-medium transition-all hover:opacity-90 mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--saffron)', color: 'var(--espresso)' }}
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Submitting...
                    </>
                  ) : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Powered by <img src="/MentSpire_logo.svg" alt="MentSpire" style={{ height: '20px', width: 'auto' }} /></span>
            {/* <span style={{ borderLeft: '1px solid rgba(248,246,241,0.25)', paddingLeft: '20px' }}>Also part of <a href="https://lankanweddingportal.com">Sri Lankan Wedding Portal</a></span> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
