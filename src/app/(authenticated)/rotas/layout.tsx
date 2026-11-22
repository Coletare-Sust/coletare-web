"use client";

import FilterBar from "@molecules/FilterBar/filterBar";
import { wrapper } from "@/common/constants/wrapper";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import { useParams } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const { id } = useParams();
  const isNotInOneRoutePage = !id;
  return (
    <section>
      {isNotInOneRoutePage && (
        <div className="bg-white-800 pb-6 pt-2">
          <div style={wrapper}>
            <FilterBar
              isAdmin={user?.role === "platformAdmin"}
              isInsertDataPage={false}
              alwaysOpen={true}
            />
          </div>
        </div>
      )}
      {children}
    </section>
  );
}
