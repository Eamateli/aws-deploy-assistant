import React from 'react';

const APIGatewayIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="6" width="20" height="12" rx="2" fill="#FF9900" stroke="#232F3E" strokeWidth="0.5"/>
    <path d="M6 2v4M12 2v4M18 2v4" stroke="#FF9900" strokeWidth="2"/>
    <path d="M6 18v4M12 18v4M18 18v4" stroke="#FF9900" strokeWidth="2"/>
    <rect x="8" y="9" width="8" height="6" fill="#232F3E"/>
    <path d="M10 11h4M10 13h4" stroke="#FF9900" strokeWidth="1"/>
  </svg>
);

export default APIGatewayIcon;