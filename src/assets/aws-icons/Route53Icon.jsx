import React from 'react';

const Route53Icon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8" fill="#FF9900" stroke="#232F3E" strokeWidth="0.5"/>
    <path
      d="M8 8l8 8M16 8l-8 8"
      stroke="#232F3E"
      strokeWidth="2"
    />
    <circle cx="8" cy="8" r="1.5" fill="#232F3E"/>
    <circle cx="16" cy="8" r="1.5" fill="#232F3E"/>
    <circle cx="8" cy="16" r="1.5" fill="#232F3E"/>
    <circle cx="16" cy="16" r="1.5" fill="#232F3E"/>
  </svg>
);

export default Route53Icon;