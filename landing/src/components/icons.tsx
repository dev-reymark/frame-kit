import React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const svgProps = (size: number, className?: string, style?: React.CSSProperties) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  style
});

export const SunIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 14, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <rect width="14" height="14" x="8" y="8" rx="0" ry="0" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const MonitorIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <rect x="2" y="3" width="20" height="14" rx="0" ry="0" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const MaximizeIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <polyline points="21 14 21 21 14 21" />
    <polyline points="3 10 3 3 10 3" />
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <rect x="3" y="11" width="18" height="11" rx="0" ry="0" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const ArrowUpRightIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const ActivityIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const SmartphoneIcon: React.FC<IconProps> = ({ size = 18, className, style }) => (
  <svg {...svgProps(size, className, style)}>
    <rect width="14" height="20" x="5" y="2" rx="0" ry="0" />
    <path d="M12 18h.01" />
  </svg>
);
