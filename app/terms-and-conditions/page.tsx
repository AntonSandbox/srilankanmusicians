import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: 'Terms and Conditions | Sri Lankan Event Portal',
  description: 'Terms and conditions, payment information and usage policies for the Sri Lankan Event Portal.',
};

export default function TermsAndConditionsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--cream, #F8F6F1)',
      color: 'var(--dark, #1A1A1A)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      padding: '60px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'var(--brown, #8c6b4a)',
            fontWeight: 500,
            fontSize: '14px',
            transition: 'opacity 0.2s'
          }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '40px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '20px'
        }}>
          Terms and Conditions
        </h1>

        <div style={{ lineHeight: 1.6, fontSize: '15px' }}>
          
          <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px', color: '#666', marginTop: '40px', marginBottom: '20px', textTransform: 'uppercase' }}>
            SECTION 1 — FOR GUESTS & COUPLES
          </h2>
          
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '20px', marginBottom: '15px' }}>
            PAYMENTS — IMPORTANT NOTICE
          </h3>
          
          <p style={{ marginBottom: '15px' }}>
            Sri Lankan MC and MentSpire do not accept any payments from guests or event organisers at any stage of the booking process.
          </p>
          
          <p style={{ marginBottom: '15px' }}>
            Once your emcee has confirmed their availability and agreed a rate directly with you, all payments are to be made directly to your chosen emcee. Sri Lankan MC and MentSpire do not collect, process or hold any funds on behalf of guests, couples or event organisers — and will not do so under any circumstances.
          </p>

          <p style={{ marginBottom: '15px', fontWeight: 500 }}>Please ensure you:</p>
          
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Speak directly with your chosen emcee to confirm their availability, rate and all event requirements before making any payment.</li>
            <li>Have a clear record of all payments made. We strongly recommend confirming all financial arrangements in writing via email to your vendor prior to making any payment.</li>
            <li>Retain all receipts, bank transfer records and written confirmations for your own reference.</li>
          </ul>

          <p style={{ marginBottom: '15px' }}>
            Sri Lankan MC and MentSpire are a connection platform. Our role is to help you find the right professional, check their availability and make initial contact — nothing more. We do not act as agents, do not take commission from bookings, and do not collect funds from guests or couples at any point.
          </p>

          <p style={{ marginBottom: '40px' }}>
            We will not be held responsible for any payments made incorrectly, to the wrong party, or without prior written confirmation from the vendor. Please ensure you are communicating with the correct verified professional before transferring any funds.
          </p>

          <hr style={{ border: '0', borderTop: '1px solid #eaeaea', margin: '40px 0' }} />

          <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px', color: '#666', marginTop: '40px', marginBottom: '20px', textTransform: 'uppercase' }}>
            SECTION 2 — FOR VENDORS & PROFESSIONALS
          </h2>

          <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '20px', marginBottom: '15px' }}>
            MEMBERSHIP PAYMENTS — IMPORTANT NOTICE
          </h3>

          <p style={{ marginBottom: '15px' }}>
            Please do not make any membership or subscription payments through the website or to any account other than the one officially communicated to you by MentSpire.
          </p>

          <p style={{ marginBottom: '15px' }}>
            Upon successful review and approval of your vendor account, you will receive a confirmation email directly from <strong>ruvindya@mentspire.com</strong>. This email will contain the official MentSpire bank account details to which your membership payment should be made.
          </p>

          <p style={{ marginBottom: '15px' }}>
            Payments should only be made to the bank account specified in that official confirmation email. MentSpire will not be responsible for any payments made to any other account, through any other channel, or prior to receiving official confirmation from ruvindya@mentspire.com.
          </p>

          <p style={{ marginBottom: '15px', fontWeight: 500 }}>Please ensure you:</p>

          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Wait for your official account confirmation email from <strong>ruvindya@mentspire.com</strong> before making any payment.</li>
            <li>Make payment only to the bank account details provided in that confirmation email.</li>
            <li>Retain your payment receipt and email it to <strong>ruvindya@mentspire.com</strong> as confirmation of your payment.</li>
            <li>Do not make any payment in response to any email, message or request from any other address or individual claiming to represent MentSpire or Sri Lankan MC.</li>
          </ul>

          <p style={{ marginBottom: '40px' }}>
            If you have any doubts about the authenticity of a communication you have received, please contact us directly at <strong>ruvindya@mentspire.com</strong> before making any payment.
          </p>

          <hr style={{ border: '0', borderTop: '1px solid #eaeaea', margin: '40px 0' }} />

          <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px', color: '#666', marginTop: '40px', marginBottom: '20px', textTransform: 'uppercase' }}>
            GENERAL
          </h2>

          <p style={{ marginBottom: '15px' }}>
            Sri Lankan MC is operated under MentSpire. By using this platform — whether as a guest, couple, event organiser or vendor — you agree to these terms.
          </p>

          <p style={{ marginBottom: '15px' }}>
            For any questions regarding payments, account confirmation or vendor registration, please contact <strong>ruvindya@mentspire.com</strong>.
          </p>

        </div>
      </div>
    </div>
  );
}
