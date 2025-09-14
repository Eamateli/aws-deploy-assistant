import React from 'react';

const ECSIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#FF9900" stroke="#232F3E" strokeWidth="0.5"/>
    <rect x="4" y="6" width="6" height="4" rx="1" fill="#232F3E"/>
    <rect x="14" y="6" width="6" height="4" rx="1" fill="#232F3E"/>
    <rect x="4" y="14" width="6" height="4" rx="1" fill="#232F3E"/>
    <rect x="14" y="14" width="6" height="4" rx="1" fill="#232F3E"/>
    <circle cx="12" cy="12" r="1" fill="#FF9900"/>
  </svg>
);

export default ECSIcon;