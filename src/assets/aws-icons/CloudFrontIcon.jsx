import React from 'react';

const CloudFrontIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4c4.4 0 8 3.6 8 8 0 1.1-.2 2.2-.6 3.2-.4 1-.9 1.9-1.6 2.6-.7.7-1.6 1.2-2.6 1.6-1 .4-2.1.6-3.2.6s-2.2-.2-3.2-.6c-1-.4-1.9-.9-2.6-1.6-.7-.7-1.2-1.6-1.6-2.6C4.2 14.2 4 13.1 4 12c0-4.4 3.6-8 8-8z"
      fill="#FF9900"
      stroke="#232F3E"
      strokeWidth="0.5"
    />
    <circle cx="8" cy="10" r="1" fill="#232F3E"/>
    <circle cx="16" cy="10" r="1" fill="#232F3E"/>
    <circle cx="12" cy="14" r="1" fill="#232F3E"/>
    <path d="M8 10L12 14L16 10" stroke="#232F3E" strokeWidth="1" fill="none"/>
  </svg>
);

export default CloudFrontIcon;