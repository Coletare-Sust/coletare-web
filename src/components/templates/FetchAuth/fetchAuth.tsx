"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import LoadingComponent from "@atoms/Loading/loading";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { logout } from "@/store/services/auth";

interface Props {
  children: JSX.Element;
}

export default function FetchAuthState({ children }: Props) {
  const { userUid, waitForUserSync } = useAuth();
  const { data: user, isLoading: isLoadingUser } = useProfile(userUid);
  const [mountComponent, setComponentMount] = useState(false);
  const router = useRouter();
  // evita chamar waitForUserSync mais de uma vez por montagem
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    const waitAuthUserSync = async () => {
      await waitForUserSync();
      setComponentMount(true);
    };
    waitAuthUserSync();

    return () => {
      setComponentMount(false);
      synced.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mountComponent && !isLoadingUser && !user) {
      logout().finally(() => router.push("/"));
    }
  }, [mountComponent, isLoadingUser, user, router]);

  if (!mountComponent || isLoadingUser || !user) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoadingComponent size={50} />
      </div>
    );
  }

  return children;
}
