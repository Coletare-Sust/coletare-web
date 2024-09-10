"use client";

import AuthenticatedOnlyFeatureWrapper from "@/components/templates/Authenticated/authenticated";
import MainHeader from "@molecules/MainHeader/mainHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedOnlyFeatureWrapper>
      <div>
        <MainHeader />
        <main className="mt-[76px]">{children}</main>
      </div>
    </AuthenticatedOnlyFeatureWrapper>
  );
}
