import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  customLogoUrl?: string;
  textSize?: 'normal' | 'large' | 'extra-large';
  instituteName?: string;
  subName?: string;
  founderName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  customLogoUrl,
  textSize = 'normal',
  instituteName,
  subName,
  founderName
}) => {
  const sizeMap = {
    sm: { box: 'w-9 h-9', text: 'text-sm' },
    md: { box: 'w-12 h-12', text: 'text-base' },
    lg: { box: 'w-16 h-16', text: 'text-xl' },
    xl: { box: 'w-24 h-24', text: 'text-2xl' },
  };

  const dim = sizeMap[size];

  const titleScaleClass =
    textSize === 'large'
      ? 'text-lg sm:text-2xl'
      : textSize === 'extra-large'
      ? 'text-xl sm:text-3xl font-black'
      : 'brand-title';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      {/* Logo container: displays custom uploaded logo or default gold/navy seal */}
      <div className={`relative ${dim.box} rounded-full shrink-0 shadow-md ring-2 ring-amber-400/80 p-0.5 bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-600 overflow-hidden`}>
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt="BS Zone Logo"
            className="w-full h-full rounded-full object-cover bg-white"
            onError={(e) => {
              // fallback if broken
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] flex items-center justify-center p-1 text-center shadow-inner overflow-hidden relative">
            <div className="absolute inset-1 rounded-full border border-dashed border-amber-300/40 pointer-events-none" />
            <div className="flex flex-col items-center justify-center">
              <span className="text-amber-400 font-extrabold text-[10px] sm:text-xs tracking-wider leading-none">BS</span>
              <span className="text-[7px] sm:text-[8px] font-semibold text-white tracking-tight leading-none mt-0.5">ZONE</span>
            </div>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <h1 className={`${titleScaleClass} font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap`}>
            {instituteName ? (
              <span className="text-blue-900">{instituteName}</span>
            ) : (
              <>
                <span className="text-blue-900">BS</span> <span className="text-amber-600">E-Learning</span> &amp; <span className="text-slate-900">IT Zone</span>
              </>
            )}
          </h1>
          <p className="brand-sub font-medium text-slate-600 tracking-normal whitespace-nowrap hidden sm:block">
            {subName || (
              <>
                প্রতিষ্ঠাতা ও প্রধান শিক্ষক: <span className="text-blue-900 font-semibold">{founderName || 'বোরহানউদ্দিন মহিম'}</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
