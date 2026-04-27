"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useRouter, useSearchParams } from "next/navigation";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import Title from "@atoms/Title/title";
import Dropdown from "@atoms/Dropdown/dropdown";
import InfoCard from "@molecules/InfoCard/infoCard";
import Button from "@atoms/Button/button";
import Subtitle from "@atoms/Subtitle/subtitle";
import BackgroundWrapper from "@atoms/BackgroudWrapper/backgroundWrapper";
import LoadingComponent from "@atoms/Loading/loading";
import { errorToast, successToast } from "@/hooks/useAppToast";
import useAllCities from "@/hooks/queries/useAllCities";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useAllWithdrawalsRequest from "@/hooks/queries/useAllWithdrawalsRequests";
import useOneUser from "@/hooks/queries/useOneUser";
import { sendEmail } from "@/store/services/email";
import { Divide } from "lucide-react";

const Solicitations = () => {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const isAdmin = user?.role === "platformAdmin";
  const searchParams = useSearchParams();
  const garbagePointId = searchParams.get("garbagePoint");
  const cityId = searchParams.get("city");
  const { data: cities } = useAllCities();
  const [dropdownValue, setDropdownValue] = useState(
    user?.cityId ? user?.cityId : cities ? cities[0].id : ""
  );
  const router = useRouter();
  const { data: solicitationsData, isLoading: isLoadingSolicitationsData } =
    useAllWithdrawalsRequest(cityId as string);
  const [loading, setLoading] = useState(false);
  const [isViewingImage, setIsViewingImage] = useState(false);

  const filteredData = solicitationsData
    ? garbagePointId
      ? solicitationsData.filter((item) => item.id === garbagePointId)[0]
      : solicitationsData[0]
    : undefined;

  const { data: requesterData } = useOneUser(
    filteredData?.createdById as string
  );
  const infoCardData =
    filteredData && requesterData
      ? [
          {
            label: "Origem",
            value: requesterData?.cpf ? "Motorista" : "Cidadão"
          },
          { label: "Solicitante", value: requesterData?.name },
          {
            label: requesterData?.cpf ? "CPF" : "Contato",
            value: (requesterData?.cpf
              ? requesterData?.cpf
              : requesterData?.email) as string
          },
          {
            label: "Situação ",
            value:
              filteredData?.type === "residence"
                ? "Residência"
                : "Local Inapropriado"
          },
          { label: "Local", value: filteredData?.fullAddress },
          {
            label: "Tipo de Residuo",
            value: filteredData?.residueType
          },
          {
            label: "Data",
            value: filteredData?.createdAt
              ? format(new Date(filteredData.createdAt), "dd/MM/yyyy", {
                  locale: ptBR
                })
              : "--/--/----"
          }
        ]
      : [];

  const [, setMap] = useState<google.maps.Map>();
  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const dropdownOptions = cities?.map((city) => ({
    label: city.name,
    onClick: () => setDropdownValue(city.id)
  }));

  const notifyCity = async () => {
    setLoading(true);
    const currentCity = cities?.find((city) => city.id === cityId);
    const { error } = await sendEmail({
      email: currentCity?.email as string,
      subject: `Crie uma rota pra esse ponto de coleta!`,
      html: `
        <p> Olá, ${currentCity?.name}! Foi solicatada uma nova retirada de lixo na plataforma Coletare. </p>
        <p> Ponto de lixo no endereço <strong>${filteredData?.fullAddress}</strong> foi registrado na plataforma. </p>
        <p> A retirada do lixo desse ponto é essencial para a sociedade. Acesse nossa plataforma e crie uma nova rota!  </p>
      `
    });
    if (error) {
      errorToast("Não foi possível notificar o município!");
      return;
    }
    successToast("Município notificado!");
    setLoading(false);
  };

  useEffect(() => {
    if (cities) {
      if (isAdmin) {
        setDropdownValue(cities[0].id);
      } else {
        setDropdownValue(cities.find((c) => c.id === user?.id)?.id as string);
      }
    }
  }, [cities, isAdmin, user?.id]);

  useEffect(() => {
    router.push(`/solicitacoes-retirada?city=${dropdownValue}`, {
      scroll: false
    });
  }, [dropdownValue]);

  useEffect(() => {
    setIsViewingImage(false);
  }, [filteredData]);

  return (
    <section className="space-y-[40px] pt-[76px]">
      <div className="flex items-center justify-between">
        <Title> Solicitações de retirada de lixo </Title>
        {isAdmin ? (
          dropdownOptions && (
            <Dropdown
              value={
                cities?.find((c) => c.id === dropdownValue)?.name as string
              }
              options={dropdownOptions}
            />
          )
        ) : (
          <Button onClick={() => router.push("/criar-rota?especial=true")}>
            <span className="flex items-center gap-2">
              <Image
                src={"/icon-plus-white.svg"}
                width={20}
                height={20}
                alt="Icon de mais"
              />{" "}
              Criar nova rota{" "}
            </span>
          </Button>
        )}
      </div>
      <BackgroundWrapper className="flex items-center justify-between bg-white-800 px-8 py-6">
        {isLoadingSolicitationsData && (
          <div className="flex h-[200px] w-full items-center">
            <LoadingComponent />
          </div>
        )}
        {!isLoadingSolicitationsData &&
          (filteredData ? (
            <>
              <div className="flex flex-col items-center justify-center">
                {filteredData.image ? (
                  <div className="mb-4 flex w-full flex-row justify-evenly">
                    <Subtitle
                      className="cursor-pointer hover:underline"
                      onClick={() => setIsViewingImage(false)}
                    >
                      Ver Localização
                    </Subtitle>
                    <Subtitle
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        setIsViewingImage(true);
                        console.log(isViewingImage);
                      }}
                    >
                      Ver Imagem
                    </Subtitle>
                  </div>
                ) : null}
                <div className="flex h-[518px] w-[752px] items-center justify-center">
                  {!isViewingImage ? (
                    <>
                      <GoogleMap
                        onLoad={onMapLoad}
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={{
                          lat: filteredData.latitude,
                          lng: filteredData.longitude
                        }}
                        zoom={15}
                      >
                        <Marker
                          position={{
                            lat: filteredData.latitude,
                            lng: filteredData.longitude
                          }}
                          label={{
                            text: String(1),
                            color: "white",
                            fontSize: "12px"
                          }}
                        />
                      </GoogleMap>
                    </>
                  ) : (
                    <Image
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      src={filteredData.image!}
                      alt={filteredData.fullAddress}
                      width={518}
                      height={752}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-8">
                <Subtitle className="text-center">
                  Ponto de lixo em aberto{" "}
                </Subtitle>
                <div className="space-y-4">
                  <InfoCard infos={infoCardData} />
                  {isAdmin ? (
                    <Button
                      className="m-auto block"
                      onClick={() => notifyCity()}
                      loading={loading}
                    >
                      Notificar município
                    </Button>
                  ) : (
                    <p className="text-center text-xs text-greenBlue-1000">
                      Resolva esse e outros pontos em aberto em “criar rota de
                      ponto de lixo.”
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="m-auto block w-full text-center"> Sem resultados! </p>
          ))}
      </BackgroundWrapper>
    </section>
  );
};

export default Solicitations;
