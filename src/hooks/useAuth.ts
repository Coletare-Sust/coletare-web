import { useContext } from "react";

import AuthContext from "@providers/Auth/context";
import { AuthContextType } from "@/store/providers/Auth/types";

export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
