import React from "react";

const RecycleIcon = ({ color = "#004A55" }: { color?: string }) => {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21.82 10.5L19.73 6.89L18.31 7.71L20 10.7H15.82L18.65 5.8L17.23 5L14.4 9.9L13.32 8L10.36 9.64L12.5 13.35H17.45L15.45 17.35H12.26L13.67 14.79L12.24 14L9.41 19H14.73L17.94 12.81L19.82 16.26L21.24 15.46L18.76 11.09L21.82 10.5Z" />
    </svg>
  );
};

export default RecycleIcon;
