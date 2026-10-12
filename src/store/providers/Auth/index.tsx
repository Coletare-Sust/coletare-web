"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { errorToast, successToast } from "@/hooks/useAppToast";
import {
  logout as logoutService,
  recoverPassword,
  signInWithEmailAndPasswordLocal,
  waitForUser
} from "@/store/services/auth";
import { deleteUserDoc } from "@/store/services/user";
import { UserEntity as UserDoc } from "@/common/entities/user";
import { AUTHORIZATION_EXPIRED_EVENT } from "@/utils/apiFetch";
import { clearQueryCache } from "@/store/providers/queryClient";

import AuthContext from "./context";

interface Props {
  children: React.ReactNode;
}

export type UserType = UserDoc | null;

const AuthProvider = ({ children }: Props) => {
  const initialLoadingObject = {
    onAuthUserChanged: true,
    loginWithGoogle: false,
    loginWithInternalService: false,
    forgotPassword: false,
    updatePassword: false,
    deleteUser: false,
    logout: false
  };
  const [userUid, setUserUid] = useState<string>("");
  const [loading, setLoading] = useState(initialLoadingObject);
  const router = useRouter();

  const clearClientSession = useCallback(() => {
    clearQueryCache();
    setUserUid("");
  }, []);

  useEffect(() => {
    const handleAuthorizationExpired = () => {
      clearClientSession();
      router.replace("/");
    };

    window.addEventListener(
      AUTHORIZATION_EXPIRED_EVENT,
      handleAuthorizationExpired
    );

    return () => {
      window.removeEventListener(
        AUTHORIZATION_EXPIRED_EVENT,
        handleAuthorizationExpired
      );
    };
  }, [clearClientSession, router]);

  // No initial effect watching "onAuthStateChanged" anymore, since HTTPOnly is stateless for frontend
  // And requires active polling or single fetch. "waitForUserSync" will be executed by components relying on Auth state.

  const loginWithInternalService = async (email: string, password: string) => {
    setLoading((prev) => ({ ...prev, loginWithInternalService: true }));
    const { user, error } = await signInWithEmailAndPasswordLocal(
      email,
      password
    );

    setLoading((prev) => ({ ...prev, loginWithInternalService: false }));
    if (user && !error) {
      successToast("Bem vindo!");
      setUserUid(user.uid);
      return { error: null };
    } else {
      setUserUid("");
      errorToast("Credenciais incorretas ou erro de comunicação.");
      return { error: "Credenciais erradas" };
    }
  };

  const waitForUserSync = async () => {
    return new Promise<void>((resolve) => {
      setLoading((prev) => ({ ...prev, onAuthUserChanged: true }));
      waitForUser(async (userCred) => {
        if (userCred) {
          setUserUid(userCred.uid);
        } else {
          setUserUid("");
        }
        setLoading((prev) => ({ ...prev, onAuthUserChanged: false }));
        resolve();
      });
    });
  };

  const deleteUserAuth = async (userUid: string) => {
    await deleteUserDoc(userUid);
  };

  const logoutUser = async () => {
    setLoading((prev) => ({ ...prev, logout: true }));
    await logoutService();
    clearClientSession();
    router.push("/");
    setLoading((prev) => ({ ...prev, logout: false }));
  };

  const redefinePassword = async (email: string) => {
    setLoading((prev) => ({ ...prev, redefinePassword: true }));
    try {
      const { error } = await recoverPassword(email);
      if (error) throw new Error(error);
      successToast("Email de redefinição de senha enviado.");
    } catch (err: any) {
      errorToast(
        "Não foi possível solicitar a redefinição de senha no momento."
      );
    }
    setLoading((prev) => ({ ...prev, redefinePassword: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        userUid,
        loading,
        loginWithInternalService,
        logoutUser,
        setUserUid,
        waitForUserSync,
        deleteUserAuth,
        redefinePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
