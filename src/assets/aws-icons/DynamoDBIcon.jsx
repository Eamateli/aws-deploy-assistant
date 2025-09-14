import React from 'react';

const DynamoDBIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6z"
      fill="#3F48CC"
      stroke="#232F3E"
      strokeWidth="0.5"
    />
    <path d="M8 8h8v2H8V8zm0 3h8v2H8v-2zm0 3h6v2H8v-2z" fill="#232F3E"/>
    <circle cx="6.5" cy="9" r="0.5" fill="#3F48CC"/>
    <circle cx="6.5" cy="12" r="0.5" fill="#3F48CC"/>
    <circle cx="6.5" cy="15" r="0.5" fill="#3F48CC"/>
  </svg>
);

export default DynamoDBIcon;