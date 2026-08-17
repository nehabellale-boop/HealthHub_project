import React from 'react';

interface ShieldHeartbeatIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const ShieldHeartbeatIcon: React.FC<ShieldHeartbeatIconProps> = ({
  className = 'w-6 h-6',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Shield Outer Outline */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {/* Centered Medical Heartbeat / Pulse Waveform */}
      <path d="M6 12h3l1.5-3.5 2.5 7 2-5 1.5 2.5 1.5-1h2" />
    </svg>
  );
};

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  tagline?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  tagline,
  className = '',
}) => {
  const containerClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    lg: 'w-11 h-11 rounded-xl',
  }[size];

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-6 h-6',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <div
        className={`${containerClasses} bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-900/20`}
      >
        <ShieldHeartbeatIcon className={iconClasses} />
      </div>
      {showWordmark && (
        <div className="flex flex-col">
          <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">
            HealthHub
          </span>
          {tagline && (
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
