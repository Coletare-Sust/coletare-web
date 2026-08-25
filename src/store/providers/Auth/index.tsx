"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignUpForm from "@/validations/signUp";
import { z } from "zod";

import { errorToast, successToast } from "@/hooks/useAppToast";
import {
  createUserWithEmailAndPasswordLocal,
  logout as logoutService,
  recoverPassword,
  signInWithEmailAndPasswordLocal,
  waitForUser
} from "@/store/services/auth";
import { createUserDoc, deleteUserDoc } from "@/store/services/user";
import { UserEntity as UserDoc, UserEntity } from "@/common/entities/user";

import AuthContext from "./context";

interface Props {
  children: React.ReactNode;
}

export type UserType = UserDoc | null;
type SignUpFormValidationData = z.infer<typeof SignUpForm>;

const AuthProvider = ({ children }: Props) => {
  const initialLoadingObject = {
    onAuthUserChanged: true,
    loginWithGoogle: false,
    loginWithInternalService: false,
    createUserWithInternalService: false,
    forgotPassword: false,
    updatePassword: false,
    deleteUser: false,
    logout: false
  };
  const [userUid, setUserUid] = useState<string>("");
  const [loading, setLoading] = useState(initialLoadingObject);
  const router = useRouter();

  // No initial effect watching "onAuthStateChanged" anymore, since HTTPOnly is stateless for frontend
  // And requires active polling or single fetch. "waitForUserSync" will be executed by components relying on Auth state.

  const createUserAuth = async (email: string, password: string) => {
    return await fetch("/api/createAuth", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }).then((data) => data.json());
  };

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

  const createUserWithInternalService = async (
    data: UserEntity & { password?: string; confirmPassword?: string }
  ) => {
    if (data.email && data.password) {
      setLoading((prev) => ({ ...prev, createUserWithInternalService: true }));
      const { uid, error } = await createUserAuth(data.email, data.password);
      if (error) {
        errorToast(error);
        setLoading((prev) => ({
          ...prev,
          createUserWithInternalService: false
        }));
        return;
      }
      delete data.password;
      delete data.confirmPassword;
      const { error: errorDoc } = await createUserDoc({
        ...data,
        id: uid
      });
      if (!errorDoc) {
        successToast("O cadastro foi realizado com sucesso!");
      } else {
        errorToast(
          "Não foi possível realizar o cadastro. Tente novamente mais tarde."
        );
      }
      setLoading((prev) => ({ ...prev, createUserWithInternalService: false }));
    } else {
      errorToast("Email and password are required");
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
    const { error: errorDoc } = await deleteUserDoc(userUid);
    if (!errorDoc) {
      return { error: null };
    }
    return await fetch("/api/deleteAuth", {
      method: "POST",
      body: JSON.stringify(userUid)
    }).then((data) => data.json());
  };

  const logoutUser = async () => {
    setLoading((prev) => ({ ...prev, logout: true }));
    await logoutService();
    setUserUid("");
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
        createUserWithInternalService,
        waitForUserSync,
        createUserAuth,
        deleteUserAuth,
        redefinePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
