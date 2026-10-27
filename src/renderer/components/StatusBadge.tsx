import React from 'react';

interface StatusBadgeProps {
  type: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  children,
  icon,
  dot = false
}) => {
  const badgeClasses = {
    success: 'badge-green',
    warning: 'badge-amber',
    error: 'badge-red',
    info: 'badge-blue'
  }[type];

  return (
    <span className={`badge ${badgeClasses}`}>
      {dot && <span className="badge-dot" />}
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
