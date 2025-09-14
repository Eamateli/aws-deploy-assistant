import React from 'react';

const ALBIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* AWS ALB Official Style - Load Balancer */}
    <rect x="4" y="16" width="40" height="16" rx="4" fill="#FF9900" stroke="#232F3E" strokeWidth="1"/>
    {/* Input connections */}
    <path d="M12 8L24 16L36 8" stroke="#FF9900" strokeWidth="3" fill="none"/>
    {/* Output connections */}
    <path d="M12 40L24 32L36 40" stroke="#FF9900" strokeWidth="3" fill="none"/>
    {/* Connection points */}
    <circle cx="12" cy="8" r="3" fill="#FF9900" stroke="#232F3E" strokeWidth="1"/>
    <circle cx="36" cy="8" r="3" fill="#FF9900" stroke="#232F3E" strokeWidth="1"/>
    <circle cx="12" cy="40" r="3" fill="#FF9900" stroke="#232F3E" strokeWidth="1"/>
    <circle cx="36" cy="40" r="3" fill="#FF9900" stroke="#232F3E" strokeWidth="1"/>
    {/* Load balancer core */}
    <rect x="20" y="20" width="8" height="8" fill="#232F3E"/>
    <path d="M22 22h4v4h-4z" fill="#FF9900"/>
  </svg>
);

export default ALBIcon;