import React from 'react';

const FargateIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" fill="#FF9900" stroke="#232F3E" strokeWidth="0.5"/>
    <rect x="5" y="7" width="4" height="3" rx="0.5" fill="#232F3E"/>
    <rect x="10" y="7" width="4" height="3" rx="0.5" fill="#232F3E"/>
    <rect x="15" y="7" width="4" height="3" rx="0.5" fill="#232F3E"/>
    <rect x="5" y="11" width="4" height="3" rx="0.5" fill="#232F3E"/>
    <rect x="10" y="11" width="4" height="3" rx="0.5" fill="#232F3E"/>
    <rect x="15" y="11" width="4" height="3" rx="0.5" fill="#232F3E"/>
    <rect x="5" y="15" width="4" height="2" rx="0.5" fill="#232F3E"/>
    <rect x="10" y="15" width="4" height="2" rx="0.5" fill="#232F3E"/>
    <rect x="15" y="15" width="4" height="2" rx="0.5" fill="#232F3E"/>
  </svg>
);

export default FargateIcon;