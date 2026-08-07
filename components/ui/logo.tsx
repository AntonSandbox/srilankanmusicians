import Image from 'next/image';

export function Logo({ className = '', style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <div className={`site-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      <Image 
        src="/srilankan_cake_artist.png" 
        alt="Sri Lankan Cake Artist Logo" 
        width={350} 
        height={50} 
        className="w-auto h-10 sm:h-12 object-contain" 
        priority 
      />
    </div>
  );
}
