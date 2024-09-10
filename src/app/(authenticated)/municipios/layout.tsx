"use client";

import useProfile from "@/hooks/queries/useProfile";
import { errorToast } from "@/hooks/useAppToast";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userUid, logoutUser } = useAuth();
  const { data: user } = useProfile(userUid);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "platformAdmin") {
      logoutUser();
      router.push("/");
      errorToast("Você não tem permissão para acessar essa página.");
    }
  }, [user, logoutUser, router]);

  return <main className="pt-[83px]">{children}</main>;
}
