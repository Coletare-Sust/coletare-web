"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignUpForm from "@/validations/signUp";
import { z } from "zod";

import { errorToast, successToast } from "@/hooks/useAppToast";
import {
  createUserWithEmailAndPasswordLocal,
  logout,
  signInWithEmailAndPasswordLocal
} from "@/store/services/auth";
import {
  createUserDoc,
  deleteUserDoc,
  waitForUser
} from "@/store/services/user";
import firebaseApp from "@/config/firebase";
import {
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";
import { UserEntity as UserDoc, UserEntity } from "@/common/entities/user";

import AuthContext from "./context";
import router from "next/router";

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
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
      } else {
        setUserUid("");
      }
      setLoading((prev) => ({ ...prev, onAuthUserChanged: true }));
    });

    return () => unsubscribe();
  }, []);

  const createUserAuth = async (email: string, password: string) => {
    return await fetch("/api/createAuth", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }).then((data) => data.json());
  };

  const loginWithInternalService = async (email: string, password: string) => {
    setLoading((prev) => ({ ...prev, loginWithInternalService: true }));
    const { user } = await signInWithEmailAndPasswordLocal(email, password);
    if (user && !user?.emailVerified) {
      errorToast("Por favor, verifique seu email.");
      sendEmailVerification(user);
      setLoading((prev) => ({ ...prev, loginWithInternalService: false }));
      logout();
      return { error: "Verifique seu email" };
    }

    setLoading((prev) => ({ ...prev, loginWithInternalService: false }));
    if (user) {
      successToast("Bem vindo!");
      setUserUid(user.uid);
      return { error: null };
    } else {
      setUserUid("");
      errorToast("Credenciais erradas");
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
      const { errorDoc } = await createUserDoc({
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
    setLoading((prev) => ({ ...prev, onAuthUserChanged: true }));
    waitForUser(async (userCred) => {
      if (userCred && !userCred?.emailVerified) {
        logout();
        setLoading((prev) => ({ ...prev, onAuthUserChanged: false }));
      }
    });
    setLoading((prev) => ({ ...prev, onAuthUserChanged: false }));
  };

  const deleteUserAuth = async (userUid: string) => {
    const { errorDoc } = await deleteUserDoc(userUid);
    if (errorDoc) {
      return { error: null };
    }
    return await fetch("/api/deleteAuth", {
      method: "POST",
      body: JSON.stringify(userUid)
    }).then((data) => data.json());
  };

  const logoutUser = async () => {
    setLoading((prev) => ({ ...prev, logout: true }));
    logout();
    router.push("/");
    setLoading((prev) => ({ ...prev, logout: false }));
  };

  const redefinePassword = async (email: string) => {
    setLoading((prev) => ({ ...prev, redefinePassword: true }));
    try {
      await sendPasswordResetEmail(auth, email);
      successToast("Email de redefinição de senha enviado.");
    } catch (err: any) {
      if (err.message === "Firebase: Error (auth/user-not-found).") {
        errorToast("Não existe usuário com esse email.");
      } else {
        errorToast("Não foi possível mandar o email de redefinição de senha.");
      }
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
