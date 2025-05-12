"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import FetchAuthState from "@templates/FetchAuth/fetchAuth";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { errorToast } from "@/hooks/useAppToast";

interface Props {
  children: JSX.Element;
}

function AuthenticatedOnlyFeature({ children }: Props): JSX.Element {
  const { userUid } = useAuth();
  const router = useRouter();
  const { data: user } = useProfile(userUid);

  useEffect(() => {
    if (userUid === "") {
      router.push(`/`);
    }
    if (user) {
      if (user.role !== "admin" && user.role !== "platformAdmin") {
        errorToast("Página restrita pra administrador ou município");
        router.push("/");
      }
      /* if (user.status === "Inativo") {
        errorToast("Pague o plano para poder acessar o serviço.");
        router.push("/");
      }*/
    }
  }, [userUid, user, router]);

  return children;
}

export default function AuthenticatedOnlyFeatureWrapper({
  children
}: Props): JSX.Element {
  return (
    <FetchAuthState>
      <AuthenticatedOnlyFeature>{children}</AuthenticatedOnlyFeature>
    </FetchAuthState>
  );
}
