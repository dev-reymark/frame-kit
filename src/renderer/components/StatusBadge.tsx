import React from 'react';

interface StatusBadgeProps {
  type: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, children, icon }) => {
  const badgeClasses = {
    success: 'badge-green',
    warning: 'badge-amber',
    error: 'badge-red',
    info: 'badge-blue'
  }[type];

  return (
    <span className={`badge ${badgeClasses}`}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};