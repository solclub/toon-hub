import * as React from "react";

const Sol: React.FC<{ size?: number }> = ({ size }) => (
  <svg
    width={size || 20}
    height={size || 20}
    fill="none"
    viewBox="0 -2 32 30"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#a)">
      <path
        d="M5.198 19.142c.193-.193.458-.306.74-.306h25.539c.467 0 .7.564.37.893l-5.045 5.045a1.047 1.047 0 0 1-.74.306H.523a.523.523 0 0 1-.37-.893l5.045-5.045Z"
        fill="url(#b)"
      />
      <path
        d="M5.198.306C5.399.113 5.665 0 5.938 0h25.539c.467 0 .7.563.37.893l-5.045 5.045a1.047 1.047 0 0 1-.74.306H.523a.523.523 0 0 1-.37-.893L5.198.306Z"
        fill="url(#c)"
      />
      <path
        d="M26.802 9.664a1.047 1.047 0 0 0-.74-.306H.523c-.467 0-.7.563-.37.893l5.045 5.045c.193.193.458.306.74.306h25.539c.467 0 .7-.563.37-.893l-5.045-5.045Z"
        fill="url(#d)"
      />
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={29.037}
        y1={-3.014}
        x2={11.362}
        y2={30.841}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#00FFA3" />
        <stop offset={1} stopColor="#DC1FFF" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={21.309}
        y1={-7.049}
        x2={3.634}
        y2={26.806}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#00FFA3" />
        <stop offset={1} stopColor="#DC1FFF" />
      </linearGradient>
      <linearGradient
        id="d"
        x1={25.148}
        y1={-5.044}
        x2={7.474}
        y2={28.811}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#00FFA3" />
        <stop offset={1} stopColor="#DC1FFF" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h32v25.08H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default Sol;
