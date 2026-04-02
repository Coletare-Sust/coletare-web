"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useState } from "react";

import Button from "@atoms/Button/button";
import { deleteRoute } from "@/store/services/route";
import ConfirmationModal from "@molecules/ConfirmationModal/confirmationModal";

import { RouteProps } from "./types";
import RouteInfoCard from "../RouteInfoCard/routeInfoCard";

const RouteComponent = ({
  closeItem,
  route,
  routeDays,
  isAdmin
}: RouteProps) => {
  const [, setMap] = useState<google.maps.Map>();
  const [path, setPath] = useState<google.maps.LatLng[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const mutationDelete = useMutation(
    async () => {
      return await deleteRoute(route.id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["routes"]);
        closeItem();
      }
    }
  );

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
    const polyline = route.polyline;
    const decodedPath = google.maps.geometry.encoding.decodePath(polyline);
    setPath(decodedPath);
  };

  const handleDelete = async () => {
    await mutationDelete.mutateAsync();
  };

  return (
    <div className="grid grid-cols-4 gap-10">
      <div className="col-span-1 flex flex-col gap-16">
        <RouteInfoCard
          days={route.days}
          period={route.period}
          residueType={route.residueType}
          routeName={route.name}
          routeDays={routeDays}
        />
        {isAdmin ? (
          <Button onClick={() => router.push(`/rotas/${route.id}`)}>
            Detalhes da rota
          </Button>
        ) : (
          <div className="flex items-center justify-between">
            <Button
              className="border border-greenDark-1000 bg-greenBebe-400 px-6 py-2"
              classNameText="text-greenDark-1000"
              onClick={() =>
                router.push(`/criar-rota?isEdit=true&routeId=${route.id}`)
              }
            >
              Editar rota
            </Button>
            <Button
              className="border border-greenDark-1000 px-6 py-2"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Excluir rota
            </Button>
          </div>
        )}
      </div>
      <div className="col-span-3 flex h-[518px] w-full items-start justify-between">
        <div className="relative flex h-full w-[95%]">
          <>
            <GoogleMap
              onLoad={onMapLoad}
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={path[0]}
              zoom={15}
            >
              <Polyline
                path={path}
                options={{
                  strokeColor: "#00ADB4",
                  strokeOpacity: 1,
                  strokeWeight: 4
                }}
              />
              {route.waypoints.map((waypoint, index) => (
                <Marker
                  key={index}
                  position={waypoint}
                  label={{
                    text: String(index + 1),
                    color: "white",
                    fontSize: "12px"
                  }}
                  // icon={{
                  //   url: "/map-marker.svg",
                  //   scaledSize: new google.maps.Size(30, 30)
                  // }}
                />
              ))}
            </GoogleMap>
          </>
        </div>
        <Image
          width={20}
          height={13}
          src="/icon-chevron-up.svg"
          alt="Seta"
          className="cursor-pointer"
          onClick={closeItem}
        />
      </div>
      <ConfirmationModal
        title="Tem certeza que deseja deletar essa rota?"
        description="Essa ação não poderá ser desfeita."
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default RouteComponent;
