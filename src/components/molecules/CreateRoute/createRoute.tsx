import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";

import Title from "@atoms/Title/title";
import DayCheckbox from "@atoms/DayCheckbox/dayCheckbox";
import Radio from "@atoms/Radio/Radio";
import AdressInput from "@atoms/AdressInput/AdressInput";
import Button from "@atoms/Button/button";
import Dropdown from "@atoms/Dropdown/dropdown";
import FormErrorLabel from "@atoms/FormError/formError";
import { RouteEntity } from "@/common/entities/route";
import { createRoute, updateRouteDoc } from "@/store/services/route";
import { errorToast, successToast } from "@/hooks/useAppToast";
import useRoute from "@/hooks/queries/useRoute";
import useAllWithdrawalsRequest from "@/hooks/queries/useAllWithdrawalsRequests";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import RadioDropdown from "@atoms/RadioDropdown/radioDropdown";
import {
  DEFAULT_RESIDUE_TYPE,
  RESIDUE_TYPE_LABELS,
  getResidueTypeLabel,
  toResidueTypeKey
} from "@/common/mappers/backendEnums";

import { CreateRouteProps } from "./types";
import { initialDays, weekDays } from "./constants";
import InputField from "../InputField/inputField";

const residueTypeLabels = Object.values(RESIDUE_TYPE_LABELS);

const CreateRoute = ({
  className,
  waypoints,
  setWaypoints,
  map,
  setInitialCenter,
  count,
  setCount,
  adresses,
  handleDeleteWaypoint,
  polylineEncoded,
  polylinePoints,
  isCalculatingPolyline,
  polylineError,
  onCalculatePolyline,
  isEdit,
  routeId,
  setAdresses,
  isSpecial,
  activeSuggestions,
  setActiveSuggestions
}: CreateRouteProps) => {
  const { data: route, isLoading: isLoadingRoute } = useRoute(
    routeId as string
  );
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const { data: solicitations } = useAllWithdrawalsRequest(user?.id as string);
  const [activeResidue, setActiveResidue] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [routeNameSecondary, setRouteNameSecondary] = useState("");
  const [days, setDays] = useState(initialDays);
  const [period, setPeriod] = useState<"morning" | "afternoon" | "night">(
    "morning"
  );
  // Guarda a chave do enum do backend (ex.: "NORMAL"); a label é só para exibição.
  const [residueType, setResidueType] = useState(DEFAULT_RESIDUE_TYPE);
  const [hasSecondaryCollection, setHasSecondaryCollection] = useState(false);
  const [daysSecondary, setDaysSecondary] = useState(initialDays);
  const [periodSecondary, setPeriodSecondary] = useState<
    "morning" | "afternoon" | "night"
  >("morning");
  const [residueTypeSecondary, setResidueTypeSecondary] =
    useState(DEFAULT_RESIDUE_TYPE);

  const [routeNameError, setRouteNameError] = useState("");
  const [daysError, setDaysError] = useState("");
  const [routeNameErrorSecondary, setRouteNameErrorSecondary] = useState("");
  const [daysErrorSecondary, setDaysErrorSecondary] = useState("");
  const [routeError, setRouteError] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const openSolicitations = solicitations?.filter((solicitation) => {
    if (!activeResidue) {
      return (
        !solicitation.isResolved &&
        !activeSuggestions
          .map((suggestion) => suggestion.id)
          .includes(solicitation.id)
      );
    } else {
      return (
        !solicitation.isResolved &&
        !activeSuggestions
          .map((suggestion) => suggestion.id)
          .includes(solicitation.id) &&
        solicitation.residueType.toLowerCase() === activeResidue.toLowerCase()
      );
    }
  });
  useEffect(() => {
    if (isEdit && route && !isLoadingRoute) {
      setRouteName(route.name);
      setDays(route.days);
      setPeriod(route.period);
      setResidueType(
        toResidueTypeKey(route.residueType) ?? DEFAULT_RESIDUE_TYPE
      );
      setCount(route.waypoints.length);
      setWaypoints(route.waypoints);

      if (route.waypoints.length > 1) {
        setInitialCenter(route.waypoints[0]);
      }

      const geocoder = new google.maps.Geocoder();

      const geocodePromises = route.waypoints.map(
        (waypoint, index) =>
          new Promise((resolve, reject) => {
            geocoder.geocode({ location: waypoint }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK) {
                if (results) {
                  resolve({
                    adress: results[0].formatted_address,
                    index
                  });
                } else {
                  console.warn("No results found");
                  resolve(null);
                }
              } else {
                console.error("Geocoder failed due to: " + status);
                reject(new Error("Geocoder failed due to: " + status));
              }
            });
          })
      );

      Promise.all(geocodePromises).then((adressesArray) => {
        setAdresses(adressesArray as { adress: string; index: number }[]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, isLoadingRoute, isEdit]);

  const dropdownOptions = Object.entries(RESIDUE_TYPE_LABELS).map(
    ([key, label]) => ({
      id: key,
      label,
      onClick: () => setResidueType(key)
    })
  );

  const dropdownOptionsSecondary = Object.entries(RESIDUE_TYPE_LABELS).map(
    ([key, label]) => ({
      id: key,
      label,
      onClick: () => setResidueTypeSecondary(key)
    })
  );

  const mutation = useMutation(
    async ({ route }: { route: RouteEntity }) => {
      await createRoute(route);
    },
    {
      onSuccess: () => {
        successToast("Rota criada com sucesso");
        queryClient.invalidateQueries(["routes"]);
        router.replace("/rotas");
      },
      onError: (err: Error) => {
        errorToast(err?.message || "Erro ao criar rota");
      }
    }
  );

  const mutationUpdate = useMutation(
    async ({ route }: { route: RouteEntity }) => {
      await updateRouteDoc(routeId as string, route);
    },
    {
      onSuccess: () => {
        successToast("Rota atualizada com sucesso");
        queryClient.invalidateQueries(["routes"]);
        queryClient.invalidateQueries(["route", routeId]);
        router.replace("/rotas");
      },
      onError: (err: Error) => {
        errorToast(err?.message || "Erro ao atualizar rota");
      }
    }
  );

  const handleSuggestionClick =
    (solicitation: WithdrawalsRequestEntity) => () => {
      setActiveSuggestions((prev) => [...prev, solicitation]);

      const location = {
        lat: solicitation.latitude,
        lng: solicitation.longitude
      };

      const newWaypoints = [...waypoints];
      newWaypoints.push(location);
      setWaypoints(newWaypoints);

      const newArray = [...adresses];

      if (waypoints.length === 0) {
        setInitialCenter(location);
        map?.panTo(location);

        newArray[count - 1] = {
          adress: solicitation.fullAddress,
          index: count - 1
        };
        setAdresses(newArray);
      } else {
        setCount((prev) => prev + 1);
        newArray[count] = {
          adress: solicitation.fullAddress,
          index: count
        };
        setAdresses(newArray);
      }
    };

  const handleCreate = () => {
    if (routeName === "") {
      errorToast("Revise os campos");
      setRouteNameError("Nome da rota é obrigatório");
      return;
    }

    if (!days.includes(true)) {
      errorToast("Revise os campos");
      setDaysError("Selecione ao menos um dia");
      return;
    }

    if (hasSecondaryCollection) {
      if (routeNameSecondary === "") {
        errorToast("Revise os campos");
        setRouteNameErrorSecondary("Nome da rota é obrigatório");
        return;
      }

      if (!daysSecondary.includes(true)) {
        errorToast("Revise os campos");
        setDaysErrorSecondary("Selecione ao menos um dia");
        return;
      }
    }

    if (waypoints.length <= 1) {
      errorToast("Revise os campos");
      setRouteError("Adicione ao menos 2 endereços");
      return;
    }

    if (isCalculatingPolyline) {
      errorToast("Aguarde o calculo da rota terminar.");
      setRouteError("Aguarde o calculo da rota terminar.");
      return;
    }

    if (!polylineEncoded || polylinePoints.length <= 1 || polylineError) {
      errorToast("Nao foi possivel calcular o caminho da rota.");
      setRouteError("Nao foi possivel calcular o caminho da rota.");
      return;
    }

    const route: RouteEntity = {
      id: isEdit ? (routeId as string) : uuidv4(),
      waypoints: waypoints.map((waypoint) => {
        return {
          lat: waypoint.lat,
          lng: waypoint.lng,
          wasChecked: false
        };
      }),
      days,
      period,
      residueType,
      name: routeName,
      polyline: polylineEncoded ?? "",
      polylinePoints: polylinePoints.length > 0 ? polylinePoints : null,
      wasChecked: false,
      cityId: user?.id as string,
      isSpecial,
      withdrawalRequestsIds: activeSuggestions.map((item) => item.id) ?? []
    };

    if (isEdit && routeId) {
      mutationUpdate.mutate({ route });
    } else {
      mutation.mutate({ route });
    }

    if (hasSecondaryCollection) {
      const secondaryRoute = {
        id: uuidv4(),
        waypoints: waypoints.map((waypoint) => {
          return {
            lat: waypoint.lat,
            lng: waypoint.lng,
            wasChecked: false
          };
        }),
        days: daysSecondary,
        period: periodSecondary,
        residueType: residueTypeSecondary,
        name: routeNameSecondary,
        polyline: polylineEncoded ?? "",
        polylinePoints: polylinePoints.length > 0 ? polylinePoints : null,
        wasChecked: false,
        cityId: user?.id as string,
        isSpecial,
        withdrawalRequestsIds: activeSuggestions.map((item) => item.id) ?? []
      };

      mutation.mutate({ route: secondaryRoute });
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [count]);

  return (
    <div
      className={twMerge(
        "h-[85%] w-full max-w-[480px] overflow-y-auto rounded-lg bg-white-1000 p-8 font-medium",
        className
      )}
      ref={scrollContainerRef}
    >
      <Title className="mb-10 flex items-center gap-2 text-2xl">
        <Image
          src="/icon-left-arrow.svg"
          height={20}
          width={13}
          alt="Seta para esquerda"
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        {isEdit ? "Editar rota" : "Criar nova rota"}
      </Title>
      <form className="flex flex-col gap-8">
        <div>
          <InputField
            label="Nome para nova rota"
            placeholder="Digite o nome para a rota"
            name="route"
            value={routeName}
            onChange={(e) => {
              setRouteNameError("");
              setRouteName(e.target.value);
            }}
          />
          <FormErrorLabel>{routeNameError}</FormErrorLabel>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-greenDark-800">Dias de coleta</label>
          <div className="flex flex-wrap items-center gap-3">
            {weekDays.map((day, index) => (
              <DayCheckbox
                key={day.name}
                name={day.name}
                label={day.label}
                days={days}
                position={index}
                setDays={setDays}
                setError={setDaysError}
              />
            ))}
          </div>
          <FormErrorLabel>{daysError}</FormErrorLabel>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-greenDark-800">Período da coleta</label>
          <Radio
            orientation="horizontal"
            value={period}
            onValueChange={setPeriod as (value: string) => void}
            options={[
              { id: "1", text: "Manhã", value: "morning" },
              { id: "2", text: "Tarde", value: "afternoon" },
              { id: "3", text: "Noite", value: "night" }
            ]}
          />
        </div>
        <Dropdown
          options={dropdownOptions}
          className="w-fit"
          value={getResidueTypeLabel(residueType)}
        />
        {!isEdit && !isSpecial && (
          <div>
            {!hasSecondaryCollection ? (
              <p
                className="cursor-pointer text-sm font-medium italic text-greenAqua-1000 underline"
                onClick={() => setHasSecondaryCollection(true)}
              >
                Criar coleta secundária{" "}
              </p>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="h-[1px] w-full bg-greenDark-200"></div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-greenDark-1000">
                    Coleta secundária
                  </p>
                  <Image
                    src="/icon-x.svg"
                    width={26}
                    height={26}
                    alt="Lixeira"
                    className="cursor-pointer transition-all hover:scale-[103%]"
                    onClick={() => setHasSecondaryCollection(false)}
                  />
                </div>
                <div>
                  <InputField
                    label="Nome para nova rota"
                    placeholder="Digite o nome para a rota"
                    name="route"
                    value={routeNameSecondary}
                    onChange={(e) => {
                      setRouteNameErrorSecondary("");
                      setRouteNameSecondary(e.target.value);
                    }}
                  />
                  <FormErrorLabel>{routeNameErrorSecondary}</FormErrorLabel>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-greenDark-800">Dias de coleta</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {weekDays.map((day, index) => (
                      <DayCheckbox
                        key={day.name}
                        name={`${day.name}-sencondary`}
                        label={day.label}
                        days={daysSecondary}
                        position={index}
                        setDays={setDaysSecondary}
                        setError={setDaysError}
                      />
                    ))}
                  </div>
                  <FormErrorLabel>{daysErrorSecondary}</FormErrorLabel>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-greenDark-800">
                    Período da coleta
                  </label>
                  <Radio
                    orientation="horizontal"
                    value={periodSecondary}
                    onValueChange={
                      setPeriodSecondary as (value: string) => void
                    }
                    options={[
                      { id: "1", text: "Manhã", value: "morning" },
                      { id: "2", text: "Tarde", value: "afternoon" },
                      { id: "3", text: "Noite", value: "night" }
                    ]}
                  />
                </div>
                <Dropdown
                  options={dropdownOptionsSecondary}
                  className="w-fit"
                  value={getResidueTypeLabel(residueTypeSecondary)}
                />
              </div>
            )}
          </div>
        )}
        <div className="mb-4">
          <p className="mb-4 text-[20px] font-medium text-greenBlue-1000">
            Adicionar endereços dessa rota
          </p>
          <div className="flex flex-col gap-6">
            {Array.from({ length: count }).map((_, index) => {
              let inputValue;

              if (adresses[index]) {
                inputValue =
                  adresses[index].index === index ? adresses[index] : undefined;
              }

              return (
                <AdressInput
                  key={index}
                  index={index}
                  setWaypoints={setWaypoints}
                  waypoints={waypoints}
                  map={map}
                  setInitialCenter={setInitialCenter}
                  value={inputValue?.adress}
                  handleDeleteWaypoint={handleDeleteWaypoint}
                />
              );
            })}
            <div
              onClick={() => setCount((prev) => prev + 1)}
              className="flex cursor-pointer items-center gap-2"
            >
              <Image
                src="/icon-plus.svg"
                width={26}
                height={26}
                alt="Ícone de adicionar"
              />
              <p className="font-light italic text-greenDark-400">
                Adicionar mais um endereço{" "}
              </p>
            </div>
          </div>
          <FormErrorLabel className="mt-2">{routeError}</FormErrorLabel>
          <FormErrorLabel className="mt-2">{polylineError}</FormErrorLabel>
          <Button
            className="mt-4 w-full"
            buttonType="button"
            loading={isCalculatingPolyline}
            disabled={waypoints.length <= 1}
            onClick={() => {
              setRouteError("");
              onCalculatePolyline();
            }}
          >
            Calcular rota
          </Button>
        </div>
        {isSpecial && (
          <div>
            <div className="mb-6 flex items-center justify-between ">
              <p className="font-medium text-greenDark-1000">
                Sugestão de pontos de retirada
              </p>
              <RadioDropdown
                options={residueTypeLabels}
                active={activeResidue}
                setActive={setActiveResidue}
                open={isFilterDropdownOpen}
                onOpenChange={() => setIsFilterDropdownOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-3">
                  Filtrar por <br /> resíduo
                  <ListFilter size={24} />
                </span>
              </RadioDropdown>
            </div>
            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto p-2">
              {openSolicitations?.map((solicitation) => {
                return (
                  <div
                    key={solicitation.id}
                    onClick={handleSuggestionClick(solicitation)}
                    className="grid cursor-pointer grid-cols-[1fr_1fr_auto] gap-4  rounded-lg border border-greenDark-400 bg-white-1000 p-4 transition-all hover:scale-[102%]"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-greenDark-1000">
                        Tipo de resíduo
                      </p>
                      <p className="text-xs text-greenDark-800">
                        {solicitation.residueType}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-greenDark-1000">
                        Local
                      </p>
                      <p className="text-xs text-greenDark-800">
                        {solicitation.fullAddress}
                      </p>
                    </div>
                    <Image
                      src="/icon-plus.svg"
                      width={26}
                      height={26}
                      alt="Ícone de adicionar"
                      className="my-auto"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <Button
          className="self-center px-12"
          buttonType="button"
          onClick={handleCreate}
        >
          Finalizar
        </Button>
      </form>
    </div>
  );
};

export default CreateRoute;
