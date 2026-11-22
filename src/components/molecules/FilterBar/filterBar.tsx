"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Dropdown from "@atoms/Dropdown/dropdown";
import Button from "@atoms/Button/button";
import DatePicker from "@molecules/DatePicker/datePicker";
import useAllRoutes from "@/hooks/queries/useAllRoutes";
import useAllCities from "@/hooks/queries/useAllCities";
import useAllCollectsByCity from "@/hooks/queries/useAllCollectsByCity";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { timestampToDate } from "@/utils/timestampToDate";
import { errorToast } from "@/hooks/useAppToast";

import { FilterBarProps } from "./types";
import { SearchDropdown } from "../SearchDropdown/searchDropdown";

const FilterBar = ({
  isAdmin,
  alwaysOpen = false,
  isInsertDataPage
}: FilterBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityToAnalyze = searchParams.get("city");
  const pathname = usePathname();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const { data: cities } = useAllCities();
  const [date, setDate] = useState<Date | undefined>();
  const [cityId, setCityId] = useState<string | undefined>(
    user && user?.cityId
      ? user?.cityId
      : cities && cities.length > 0
      ? cities[0].id
      : undefined
  );
  const { data: cityCollects } = useAllCollectsByCity(cityId as string);
  const cityName = cities?.find((item) => item.id === cityId)?.name as string;
  const { data: routes } = useAllRoutes(cityId as string);
  const routesSearchDropdownOptions = routes?.map((route) => ({
    value: route.name.toLowerCase(),
    label: route.name
  }));
  const [routeValue, setRouteValue] = useState<string>("");
  const routeLabel = routesSearchDropdownOptions?.find(
    (item) => item.value === routeValue
  )?.label;
  const routeId = routes?.find((item) => item.name === routeLabel)?.id;

  const collectsByRoute = cityCollects?.filter(
    (collect) => collect.routeId === routeId
  );

  const activeDays = collectsByRoute?.map((collect) => {
    return timestampToDate(collect.createdAt);
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pathname === "/rotas") {
      let finalQuery = pathname + "?";
      if (routeId) finalQuery += `value=${routeId}&`;
      if (cityId) finalQuery += `city=${cityId}&`;
      router.push(finalQuery);
      return;
    }

    if (!date) {
      errorToast("Selecione uma data para continuar");
      return;
    }

    const collect = cityCollects?.find((collect) => {
      return (
        collect.routeId === routeId &&
        timestampToDate(collect.createdAt).toLocaleDateString() ===
          new Date(date).toLocaleDateString()
      );
    });

    if (isInsertDataPage) {
      let finalQuery = isInsertDataPage
        ? "/dashboard/inserir-dados?"
        : "/rota?";
      if (routeId) finalQuery += `value=${routeId}&`;
      if (date) finalQuery += `date=${format(date, "P", { locale: ptBR })}&`;
      if (cityId) finalQuery += `city=${cityId}&`;
      router.push(finalQuery);
    } else {
      router.push(`rota/${collect?.id}`);
    }
  };

  const handleRemove = () => {
    if (!isInsertDataPage) {
      setCityId("");
      router.push(pathname);
    } else {
      router.push(pathname + `?city=${cityId}`);
    }
    setRouteValue("");
    setDate(undefined);
  };

  useEffect(() => {
    router.push(`${pathname}?city=${cityId}`);
  }, [cityId, cityToAnalyze, router, pathname]);

  useEffect(() => {
    if (user && cities && !cityId && cities.length > 0) {
      setCityId(user.cityId ? user.cityId : cities[0].id);
    }
  }, [cities, cityId, user]);

  useEffect(() => {
    setDate(undefined);
  }, [routeValue, cityId]);

  const numberCollectsWNoMassData =
    cityCollects?.filter(
      (collect) =>
        !collect.mass && routes?.map((r) => r.id).includes(collect.routeId)
    ).length ?? undefined;

  return (
    <form
      className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      onSubmit={(e) => handleSubmit(e)}
    >
      <SearchDropdown
        placeholder="Pesquisar rota ..."
        options={routesSearchDropdownOptions}
        value={routeValue}
        setValue={setRouteValue}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:gap-6 xl:gap-16">
        {pathname !== "/rotas" && (routeValue !== "" || alwaysOpen) && (
          <DatePicker date={date} setDate={setDate} activeDays={activeDays} />
        )}
        {isAdmin && cities && cityId && (
          <Dropdown
            options={cities.map((item) => ({
              label: item.name,
              onClick: () => setCityId(item.id)
            }))}
            value={cityName}
          />
        )}
        {(routeValue !== "" || alwaysOpen) && (
          <div className="flex items-center gap-5">
            <Button className="flex-1 sm:flex-none"> Pesquisar rota </Button>
            <Image
              src={"/icon-x.svg"}
              width={32}
              height={32}
              alt="Ícone de fechar "
              className="cursor-pointer opacity-80 transition-all hover:scale-[105%] hover:opacity-100"
              onClick={() => handleRemove()}
            />
          </div>
        )}
        {routeValue === "" && !alwaysOpen && (
          <div className="flex w-full gap-8 sm:w-auto">
            <Button
              alertNumber={
                numberCollectsWNoMassData && numberCollectsWNoMassData > 0
                  ? numberCollectsWNoMassData
                  : undefined
              }
              className="w-full sm:w-auto lg:mr-12"
              buttonType="button"
              onClick={() => {
                let finalQuery = "/dashboard/inserir-dados?";
                if (routeId) finalQuery += `value=${routeId}&`;
                if (date)
                  finalQuery += `date=${format(date, "P", { locale: ptBR })}&`;
                if (cityId) finalQuery += `city=${cityId}`;
                router.push(finalQuery);
              }}
            >
              {numberCollectsWNoMassData && numberCollectsWNoMassData > 0
                ? "Inserir "
                : "Editar "}
              massa coletada
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default FilterBar;
