"use client";

import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import FetchAuthState from "../FetchAuth/fetchAuth";
import { errorToast } from "@/hooks/useAppToast";

interface Props {
  children: JSX.Element;
}

function BlockInactiveUser({ children }: Props): JSX.Element {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const [isBlocked, setIsBlocked] = useState(false);

  // aqui vai ver se o usuario que entrou esta inativo
  useEffect(() => {
    if (user?.status === "Inativo") {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isBlocked) {
        e.stopPropagation(); // nao deixa clique se propagar para outros elementos
        e.preventDefault(); // vai canelar comportamente do clique
        errorToast(
          "Plano inativo. Faça o pagamento para aproveitar as funcionalidades da aplicação."
        );
      }
    };

    if (isBlocked) {
      document.addEventListener("click", handleClick, true);
    }

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [isBlocked]);

  return (
    <>
      {children}
      {isBlocked && (
        <div className="fixed inset-0 z-50 pointer-events-none backdrop-blur-[2px]" />
      )}
    </>
  );
}

export default function BlockInactiveUserWrapper({
  children
}: Props): JSX.Element {
  return (
    <FetchAuthState>
      <BlockInactiveUser>{children}</BlockInactiveUser>
    </FetchAuthState>
  );
}
