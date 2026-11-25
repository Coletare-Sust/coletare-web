"use client";

import { usePathname } from "next/navigation";
import FilterBar from "@molecules/FilterBar/filterBar";
import { wrapper } from "@/common/constants/wrapper";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  return (
    <section>
      <div className="bg-white-800 pb-6 pt-2">
        <div style={wrapper}>
          <FilterBar
            isAdmin={user?.role === "platformAdmin"}
            alwaysOpen={pathname.startsWith("/dashboard/inserir-dados")}
            isInsertDataPage={pathname.startsWith("/dashboard/inserir-dados")}
          />
        </div>
      </div>
      {children}
    </section>
  );
}
