import React from 'react';

const LambdaIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 20h4l6-12h4l-2-4h-4L5 16H3v4z"
      fill="#FF9900"
      stroke="#232F3E"
      strokeWidth="0.5"
    />
    <path
      d="M15 4h4l2 4h-4l-2-4z"
      fill="#FF9900"
      stroke="#232F3E"
      strokeWidth="0.5"
    />
  </svg>
);

export default LambdaIcon;