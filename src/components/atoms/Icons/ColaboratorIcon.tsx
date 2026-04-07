import React from "react";

// Aceita a prop 'color', com o padrão definido para a cor principal da sua aplicação
const ColaboratorIcon = ({ color = "#004A55" }: { color?: string }) => {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24" // viewBox padrão para ícones de sistema
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="ColaboradoresGroup">
        {/* Pessoa Central (Principal) */}
        <path
          id="PessoaCentral_Corpo"
          d="M12 11C14.2091 11 16 12.7909 16 15V18H8V15C8 12.7909 9.79086 11 12 11Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="PessoaCentral_Cabeca"
          d="M12 10C13.6569 10 15 8.65685 15 7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pessoa da Esquerda (Fundo) */}
        <path
          id="PessoaEsquerda_Corpo"
          d="M5 13C6.65685 13 8 14.3431 8 16V18H2V16C2 14.3431 3.34315 13 5 13Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6" // Leve transparência para dar profundidade
        />
        <path
          id="PessoaEsquerda_Cabeca"
          d="M5 12C6.10457 12 7 11.1046 7 10C7 8.89543 6.10457 8 5 8C3.89543 8 3 8.89543 3 10C3 11.1046 3.89543 12 5 12Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />

        {/* Pessoa da Direita (Fundo) */}
        <path
          id="PessoaDireita_Corpo"
          d="M19 13C20.6569 13 22 14.3431 22 16V18H16V16C16 14.3431 17.3431 13 19 13Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6" // Leve transparência para dar profundidade
        />
        <path
          id="PessoaDireita_Cabeca"
          d="M19 12C20.1046 12 21 11.1046 21 10C21 8.89543 20.1046 8 19 8C17.8954 8 17 8.89543 17 10C17 11.1046 17.8954 12 19 12Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
};

export default ColaboratorIcon;
