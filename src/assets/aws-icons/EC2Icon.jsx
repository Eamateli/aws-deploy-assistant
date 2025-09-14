import React from 'react';

const EC2Icon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* AWS EC2 Official Style */}
    <rect x="4" y="8" width="40" height="32" rx="2" fill="#FF9900" stroke="#232F3E" strokeWidth="1"/>
    <rect x="8" y="12" width="32" height="4" fill="#232F3E"/>
    <rect x="8" y="18" width="32" height="4" fill="#232F3E"/>
    <rect x="8" y="24" width="32" height="4" fill="#232F3E"/>
    <rect x="8" y="30" width="32" height="4" fill="#232F3E"/>
    <circle cx="12" cy="14" r="1" fill="#FF9900"/>
    <circle cx="12" cy="20" r="1" fill="#FF9900"/>
    <circle cx="12" cy="26" r="1" fill="#FF9900"/>
    <circle cx="12" cy="32" r="1" fill="#FF9900"/>
    {/* AWS Logo accent */}
    <path d="M36 14h2v2h-2z M36 20h2v2h-2z M36 26h2v2h-2z M36 32h2v2h-2z" fill="#FF9900"/>
  </svg>
);

export default EC2Icon;