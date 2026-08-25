"use client";

import AdministratorOnlyFeatureWrapper from "@/components/templates/Administrator/administrator";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdministratorOnlyFeatureWrapper>
      <main className="pt-[83px]">{children}</main>
    </AdministratorOnlyFeatureWrapper>
  );
}
