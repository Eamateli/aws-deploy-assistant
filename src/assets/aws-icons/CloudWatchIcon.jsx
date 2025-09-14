import React from 'react';

const CloudWatchIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#FF9900" stroke="#232F3E" strokeWidth="0.5"/>
    <path
      d="M6 16L8 12L10 14L12 8L14 12L16 10L18 14"
      stroke="#232F3E"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="6" cy="16" r="1" fill="#232F3E"/>
    <circle cx="8" cy="12" r="1" fill="#232F3E"/>
    <circle cx="10" cy="14" r="1" fill="#232F3E"/>
    <circle cx="12" cy="8" r="1" fill="#232F3E"/>
    <circle cx="14" cy="12" r="1" fill="#232F3E"/>
    <circle cx="16" cy="10" r="1" fill="#232F3E"/>
    <circle cx="18" cy="14" r="1" fill="#232F3E"/>
  </svg>
);

export default CloudWatchIcon;