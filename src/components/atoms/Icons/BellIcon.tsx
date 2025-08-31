import React from 'react';

// Este é um componente de ícone de sino em formato SVG.
// O 'color' é uma propriedade opcional para mudar a cor do ícone.
const BellIcon = ({ color = '#AD0000' }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export default BellIcon;
