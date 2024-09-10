"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import FetchAuthState from "@/components/templates/FetchAuth/fetchAuth";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import { errorToast } from "@/hooks/useAppToast";

interface Props {
  children: JSX.Element;
}

function AdministratorOnlyFeature({ children }: Props): JSX.Element {
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user, isLoading } = useProfile(userUid);

  useEffect(() => {
    if (!user) {
      router.push(`/`);
    } else {
      if (user.role !== "platformAdmin") {
        errorToast("Página restrita pra administrador");
        router.push("/");
      }
    }
  }, [router, user, isLoading]);

  if (!user || user.role !== "platformAdmin") {
    return (
      <main className="flex h-screen items-center justify-center">
        <h1>Verificando autenticação...</h1>
      </main>
    );
  }
  return children;
}

export default function AdministratorOnlyFeatureWrapper({
  children
}: Props): JSX.Element {
  return (
    <FetchAuthState>
      <AdministratorOnlyFeature>{children}</AdministratorOnlyFeature>
    </FetchAuthState>
  );
}
