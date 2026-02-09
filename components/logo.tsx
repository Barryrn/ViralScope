import { cn } from '@/lib/utils'
import { SVGProps } from 'react';

// ViralScope Logo - Analytics icon with play button motif
export function ViralScopeLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn("w-7 h-7", className)}
      fill="none"
      {...props}
    >
      {/* Outer circle - scope */}
      <circle cx="16" cy="16" r="14" stroke="url(#viralscope-gradient)" strokeWidth="2.5" fill="none" />

      {/* Play button triangle */}
      <path
        d="M13 10.5v11l9-5.5-9-5.5z"
        fill="url(#viralscope-gradient)"
      />

      {/* Trend line */}
      <path
        d="M6 22l5-4 4 2 6-8 5-2"
        stroke="url(#viralscope-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />

      <defs>
        <linearGradient id="viralscope-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF0000" />
          <stop offset="1" stopColor="#CC0000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Text logo for header
export function ViralScopeLogoFull({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ViralScopeLogo />
      <span className="text-xl font-bold tracking-tight">ViralScope</span>
    </div>
  );
}

// Keep these for backwards compatibility during migration, but they now use ViralScope branding
export const Logo = ViralScopeLogoFull;
export const LogoIcon = ViralScopeLogo;
export const ChatMaxingIconColoured = ViralScopeLogo;
