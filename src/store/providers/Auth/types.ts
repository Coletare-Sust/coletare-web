"use client";

import { Dispatch, SetStateAction } from "react";
import { UserEntity } from "@/common/entities/user";

export interface AuthContextType {
  logoutUser: () => void;
  setUserUid: Dispatch<SetStateAction<string>>;
  userUid: string;
  loading: Record<string, boolean>;
  loginWithInternalService: (
    email: string,
    password: string
  ) => Promise<{ error: null | string }>;
  waitForUserSync: () => Promise<void>;
  deleteUserAuth: (userUid: string) => Promise<{ error: string | null }>;
  redefinePassword: (email: string) => Promise<void>;
}
