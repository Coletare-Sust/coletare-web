"use client";

import BlockInactiveUserWrapper from "@/components/templates/BlockInactiveUser/blockInactiveUser";
import AuthenticatedOnlyFeatureWrapper from "@/components/templates/Authenticated/authenticated";
import MainHeader from "@molecules/MainHeader/mainHeader";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places", "geometry", "drawing", "visualization"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  return (
    <AuthenticatedOnlyFeatureWrapper>
      <BlockInactiveUserWrapper>
        <div>
          <MainHeader />
          <main className="mt-[76px]">
            {isLoaded ? (
              children
            ) : (
              <div className="flex h-[calc(100vh-76px)] w-full items-center justify-center">
                {loadError ? (
                  <p>Erro ao carregar mapa</p>
                ) : (
                  <div className="text-greenBlue-1000 font-medium">
                    Carregando recursos locacionais...
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </BlockInactiveUserWrapper>
    </AuthenticatedOnlyFeatureWrapper>
  );
}
