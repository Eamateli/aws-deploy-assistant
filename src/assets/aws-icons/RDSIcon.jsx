import React from 'react';

const RDSIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* AWS RDS Official Style - Database cylinder */}
    <ellipse cx="24" cy="12" rx="16" ry="4" fill="#3F48CC" stroke="#232F3E" strokeWidth="1"/>
    <path
      d="M8 12v8c0 2.2 7.2 4 16 4s16-1.8 16-4v-8"
      fill="none"
      stroke="#3F48CC"
      strokeWidth="2"
    />
    <path
      d="M8 20v8c0 2.2 7.2 4 16 4s16-1.8 16-4v-8"
      fill="none"
      stroke="#3F48CC"
      strokeWidth="2"
    />
    <path
      d="M8 28v8c0 2.2 7.2 4 16 4s16-1.8 16-4v-8"
      fill="none"
      stroke="#3F48CC"
      strokeWidth="2"
    />
    {/* RDS accent */}
    <rect x="20" y="10" width="8" height="2" fill="#232F3E"/>
    <circle cx="38" cy="16" r="2" fill="#FF9900"/>
  </svg>
);

export default RDSIcon;