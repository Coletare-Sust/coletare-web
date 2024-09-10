"use client";

import { useEffect, useState } from "react";

import LoadingComponent from "@atoms/Loading/loading";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";

interface Props {
  children: JSX.Element;
}

export default function FetchAuthState({ children }: Props) {
  const { userUid, waitForUserSync } = useAuth();
  const { data: user } = useProfile(userUid);
  const [mountComponent, setComponentMount] = useState(false);

  useEffect(() => {
    const waitAuthUserSync = async () => {
      await waitForUserSync();
      setComponentMount(true);
    };
    if (!mountComponent) {
      waitAuthUserSync();
    }

    return () => {
      setComponentMount(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mountComponent || !user) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoadingComponent size={50} />
      </div>
    );
  }

  return children;
}
