import React from 'react';
import { cn } from '@/lib/utils';

export interface StudySpaceLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  badge?: string;
}

export const StudySpaceLogo: React.FC<StudySpaceLogoProps> = ({
  size = 'md',
  showText = false,
  showSubtitle = false,
  className,
  badge,
}) => {
  const getDimensions = () => {
    if (typeof size === 'number') return { width: size, height: size, iconClass: '' };
    switch (size) {
      case 'xs':
        return { width: 22, height: 22, iconClass: 'w-[22px] h-[22px]' };
      case 'sm':
        return { width: 30, height: 30, iconClass: 'w-[30px] h-[30px]' };
      case 'lg':
        return { width: 48, height: 48, iconClass: 'w-12 h-12' };
      case 'xl':
        return { width: 64, height: 64, iconClass: 'w-16 h-16' };
      case 'md':
      default:
        return { width: 36, height: 36, iconClass: 'w-9 h-9' };
    }
  };

  const { width, height, iconClass } = getDimensions();

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {/* Vector Icon Mark */}
      <div
        className={cn(
          'relative rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-0.5',
          iconClass
        )}
        style={{ width, height }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="ss-logo-lime-teal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D6FF62" />
              <stop offset="100%" stopColor="#63D6C5" />
            </linearGradient>
            <linearGradient id="ss-logo-teal-lime" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#63D6C5" />
              <stop offset="100%" stopColor="#D6FF62" />
            </linearGradient>
            <linearGradient id="ss-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A2029" />
              <stop offset="100%" stopColor="#0B0D10" />
            </linearGradient>
            <filter id="ss-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Squircle Surface */}
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="16"
            fill="url(#ss-logo-bg)"
            stroke="#272E38"
            strokeWidth="1.5"
          />

          {/* Orbital Focus Ring */}
          <ellipse
            cx="32"
            cy="32"
            rx="23"
            ry="10"
            stroke="#63D6C5"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.35"
            transform="rotate(-25 32 32)"
          />

          {/* Upper Geometric Ribbon (Lime to Teal) */}
          <path
            d="M 44 14
               C 33 13, 19 16, 17 25
               C 15 32, 26 33, 34 35
               C 39 36, 43 38, 42 43
               C 41 49, 32 50, 24 49
               L 23 44
               C 29 45, 36 45, 37 41
               C 38 37, 31 35, 23 33
               C 14 31, 10 24, 12 17
               C 15 8, 30 7, 44 9
               Z"
            fill="url(#ss-logo-lime-teal)"
            filter="url(#ss-logo-glow)"
          />

          {/* Bottom Accent / Counterpart Ribbon */}
          <path
            d="M 21 50
               C 31 51, 45 48, 47 39
               C 48 34, 42 32, 35 30
               L 36 26
               C 45 28, 53 31, 52 40
               C 50 51, 33 55, 20 54
               Z"
            fill="url(#ss-logo-teal-lime)"
            opacity="0.85"
          />

          {/* Central Star Nexus */}
          <path
            d="M 32 23
               Q 32 29 38 29
               Q 32 29 32 35
               Q 32 29 26 29
               Q 32 29 32 23
               Z"
            fill="#FFFFFF"
          />
          <circle cx="32" cy="29" r="1.5" fill="#D6FF62" />

          {/* Micro Satellites */}
          <circle cx="49" cy="23" r="2" fill="#D6FF62" />
          <circle cx="15" cy="41" r="1.5" fill="#63D6C5" />
        </svg>
      </div>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#F3F5F7] tracking-tight font-sans text-base">
              Study<span className="text-[#D6FF62]">Space</span>
            </span>
            {badge && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1A2029] text-[#D6FF62] border border-[#272E38] font-semibold">
                {badge}
              </span>
            )}
          </div>
          {showSubtitle && (
            <span className="text-[10px] font-mono tracking-wider text-[#929BA8] uppercase mt-0.5">
              Focus Workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
};
