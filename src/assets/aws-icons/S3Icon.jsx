import React from 'react';

const S3Icon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* AWS S3 Official Style - Bucket */}
    <path
      d="M6 14c0-2.2 1.8-4 4-4h28c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H10c-2.2 0-4-1.8-4-4V14z"
      fill="#569A31"
      stroke="#232F3E"
      strokeWidth="1"
    />
    {/* Folder/Bucket lines */}
    <path
      d="M14 18h20v3H14v-3zm0 6h20v3H14v-3zm0 6h12v3H14v-3z"
      fill="#232F3E"
    />
    {/* S3 Logo accent */}
    <circle cx="11" cy="15" r="1" fill="#569A31"/>
    <path d="M36 19h4v2h-4z M36 25h4v2h-4z M36 31h4v2h-4z" fill="#87C540"/>
  </svg>
);

export default S3Icon;