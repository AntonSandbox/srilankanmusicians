export function Logo({ className = '', style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <div className={`site-brand-logo ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1, textDecoration: 'none', ...style }}>
      <div style={{ fontSize: '2em', fontWeight: 800, fontFamily: 'var(--font-body), sans-serif', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline' }}>
        <span style={{ color: '#7b273b' }}>Sri&nbsp;</span>
        <span style={{ color: '#2a3a2f' }}>Lank</span>
        <span style={{ color: '#d4862a' }}>an&nbsp;</span>
        <span style={{ color: '#9a6d20' }}>MC</span>
      </div>
      <div style={{ fontSize: '0.9em', fontStyle: 'italic', fontWeight: 500, color: '#d4862a', letterSpacing: '0.03em', textAlign: 'center', marginTop: '2px', fontFamily: 'var(--font-body), sans-serif' }}>
        find your emcee
      </div>
    </div>
  );
}
