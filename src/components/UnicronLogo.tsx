import React from 'react';

interface UnicronLogoProps {
  variant?: 'emblem' | 'horizontal' | 'full';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UnicronLogo: React.FC<UnicronLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
}) => {
  // SVG Emblem path definitions matching the official Unicron Holdings logo
  const renderEmblem = (emblemClass: string) => (
    <svg
      viewBox="0 0 200 220"
      className={emblemClass}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red Hexagon Outer Frame */}
      <polygon
        points="100,10 185,59 185,161 100,210 15,161 15,59"
        fill="none"
        stroke="#E31B23"
        strokeWidth="18"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />

      {/* Inner Stylized U Chevron / Shield */}
      <path
        d="M 40 68
           L 59 57
           L 59 141
           L 100 165
           L 141 141
           L 141 57
           L 160 68
           L 160 152
           L 100 188
           L 40 152
           Z"
        fill="#111827"
      />

      {/* Central Pillar Element */}
      <polygon
        points="100,45 122,58 122,130 100,143 78,130 78,58"
        fill="#111827"
      />
    </svg>
  );

  if (variant === 'emblem') {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-9 h-9',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    }[size];

    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
        {renderEmblem('w-full h-full drop-shadow-xs')}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`inline-flex flex-col items-center justify-center text-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs ${className}`}>
        {renderEmblem('w-20 h-20 drop-shadow-xs')}
        <div className="mt-2 text-center">
          <span className="block font-black text-xl tracking-wider text-[#005A36] leading-tight font-sans">
            UNICRON
          </span>
          <span className="block font-bold text-[10px] tracking-[0.35em] text-[#8C5828] uppercase pl-1 mt-0.5 font-sans">
            HOLDINGS
          </span>
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  const sizeConfig = {
    sm: {
      emblem: 'w-6 h-6',
      title: 'text-sm font-black',
      subtitle: 'text-[8px] tracking-[0.25em]',
    },
    md: {
      emblem: 'w-9 h-9',
      title: 'text-base font-black',
      subtitle: 'text-[9px] tracking-[0.3em]',
    },
    lg: {
      emblem: 'w-12 h-12',
      title: 'text-lg font-black',
      subtitle: 'text-[10px] tracking-[0.35em]',
    },
    xl: {
      emblem: 'w-16 h-16',
      title: 'text-2xl font-black',
      subtitle: 'text-xs tracking-[0.4em]',
    },
  }[size];

  return (
    <div className={`inline-flex items-center space-x-2.5 ${className}`}>
      <div className={`${sizeConfig.emblem} shrink-0`}>
        {renderEmblem('w-full h-full drop-shadow-xs')}
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${sizeConfig.title} text-[#005A36] font-sans tracking-wide`}>
          UNICRON
        </span>
        <span className={`${sizeConfig.subtitle} text-[#8C5828] font-bold font-sans uppercase mt-0.5 pl-0.5`}>
          HOLDINGS
        </span>
      </div>
    </div>
  );
};
