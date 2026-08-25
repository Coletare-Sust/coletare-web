"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Search, ShieldCheck } from "lucide-react";

import LoadingComponent from "@/components/atoms/Loading/loading";
import Title from "@/components/atoms/Title/title";
import Button from "@/components/atoms/Button/button";
import { wrapper } from "@/common/constants/wrapper";
import { normalizePermission } from "@/common/accessControl/permissions";
import { UserEntity } from "@/common/entities/user";
import useAllCities from "@/hooks/queries/useAllCities";
import usePermissions from "@/hooks/queries/usePermissions";
import useUserPermissions, {
  getUserPermissionsQueryKey
} from "@/hooks/queries/useUserPermissions";
import { errorToast, successToast } from "@/hooks/useAppToast";
import { queryClient } from "@/store/providers/queryClient";
import { updateUserPermissions } from "@/store/services/access";

const PermissionManagementPage = () => {
  const { data: cities = [], isLoading: isLoadingCities } = useAllCities();
  const { data: permissions = [], isLoading: isLoadingPermissions } =
    usePermissions();

  const [search, setSearch] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [extraPermissions, setExtraPermissions] = useState<Set<string>>(
    new Set()
  );
  const [revokedPermissions, setRevokedPermissions] = useState<Set<string>>(
    new Set()
  );

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId) ?? null,
    [cities, selectedCityId]
  );

  const { data: userPermissions, isLoading: isLoadingUserPermissions } =
    useUserPermissions(selectedCityId);

  useEffect(() => {
    if (!selectedCityId && cities.length > 0) {
      setSelectedCityId(cities[0].id);
    }
  }, [cities, selectedCityId]);

  useEffect(() => {
    setExtraPermissions(
      new Set(
        (userPermissions?.extraPermissions ?? []).map(normalizePermission)
      )
    );
    setRevokedPermissions(
      new Set(
        (userPermissions?.revokedPermissions ?? []).map(normalizePermission)
      )
    );
  }, [userPermissions]);

  const baseProfilePermissions = useMemo(() => {
    const effective = new Set(
      (userPermissions?.effectivePermissions ?? []).map(normalizePermission)
    );
    const originalExtraPermissions = new Set(
      (userPermissions?.extraPermissions ?? []).map(normalizePermission)
    );
    const originalRevokedPermissions = new Set(
      (userPermissions?.revokedPermissions ?? []).map(normalizePermission)
    );

    originalExtraPermissions.forEach((permission) =>
      effective.delete(permission)
    );
    originalRevokedPermissions.forEach((permission) =>
      effective.add(permission)
    );
    return effective;
  }, [userPermissions]);

  const filteredCities = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return cities;

    return cities.filter((city) => {
      return (
        city.name.toLowerCase().includes(normalizedSearch) ||
        city.email?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [cities, search]);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, typeof permissions>>(
      (groups, permission) => {
        const moduleName = permission.module || "Outras";
        groups[moduleName] = [...(groups[moduleName] ?? []), permission];
        return groups;
      },
      {}
    );
  }, [permissions]);

  const mutation = useMutation(
    async () => {
      if (!selectedCityId) return null;
      return updateUserPermissions(selectedCityId, {
        extraPermissions: Array.from(extraPermissions),
        revokedPermissions: Array.from(revokedPermissions)
      });
    },
    {
      onSuccess: () => {
        successToast("Permissoes do municipio atualizadas.");
        queryClient.invalidateQueries(
          getUserPermissionsQueryKey(selectedCityId)
        );
      },
      onError: () => {
        errorToast("Nao foi possivel atualizar as permissoes.");
      }
    }
  );

  const hasPermission = (permissionKey: string) => {
    const normalizedPermission = normalizePermission(permissionKey);

    if (revokedPermissions.has(normalizedPermission)) return false;
    if (extraPermissions.has(normalizedPermission)) return true;
    return baseProfilePermissions.has(normalizedPermission);
  };

  const togglePermission = (permissionKey: string) => {
    const normalizedPermission = normalizePermission(permissionKey);
    const isEnabled = hasPermission(normalizedPermission);
    const inherited = baseProfilePermissions.has(normalizedPermission);

    setExtraPermissions((current) => {
      const next = new Set(current);
      if (isEnabled) {
        next.delete(normalizedPermission);
      } else if (!inherited) {
        next.add(normalizedPermission);
      }
      return next;
    });

    setRevokedPermissions((current) => {
      const next = new Set(current);
      if (isEnabled && inherited) {
        next.add(normalizedPermission);
      } else {
        next.delete(normalizedPermission);
      }
      return next;
    });
  };

  const enabledCount = permissions.filter((permission) =>
    hasPermission(permission.key)
  ).length;

  const isLoading =
    isLoadingCities || isLoadingPermissions || isLoadingUserPermissions;

  return (
    <section style={wrapper} className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title>Permissoes dos municipios</Title>
          <p className="mt-3 max-w-3xl text-sm text-greenDark-800">
            Defina quais acoes cada municipio pode executar no Coletapp. As
            permissoes marcadas podem vir do perfil padrao do municipio ou de
            ajustes feitos diretamente para ele.
          </p>
        </div>

        <Button
          disabled={!selectedCityId || mutation.isLoading}
          onClick={() => mutation.mutate()}
        >
          <div className="flex items-center gap-2">
            <Check size={18} />
            <span>
              {mutation.isLoading ? "Salvando..." : "Salvar permissoes"}
            </span>
          </div>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="bg-white h-fit rounded-lg border border-greenBlue-600 p-4">
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={18} className="text-greenDark-700" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar municipio"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
            {filteredCities.map((city: UserEntity) => {
              const isSelected = city.id === selectedCityId;

              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setSelectedCityId(city.id)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    isSelected
                      ? "bg-greenBlue-50 border-greenBlue-800"
                      : "bg-white border-gray-200 hover:border-greenBlue-600"
                  }`}
                >
                  <strong className="block text-sm text-greenBlue-1000">
                    {city.name}
                  </strong>
                  <span className="text-greenDark-700 mt-1 block truncate text-xs">
                    {city.email}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="bg-white min-h-[520px] rounded-lg border border-greenBlue-600 p-6">
          {isLoading ? (
            <div className="flex h-[420px] items-center justify-center">
              <LoadingComponent color="#004A55" />
            </div>
          ) : !selectedCity ? (
            <div className="flex h-[420px] items-center justify-center text-sm text-greenDark-800">
              Nenhum municipio encontrado.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <p className="text-greenDark-700 text-sm">Municipio</p>
                  <h2 className="text-2xl font-semibold text-greenBlue-1000">
                    {selectedCity.name}
                  </h2>
                  <p className="text-greenDark-700 mt-1 text-sm">
                    Perfil base: {userPermissions?.profile ?? "ADMIN"}
                  </p>
                </div>

                <div className="bg-greenBlue-50 flex items-center gap-3 rounded-lg px-4 py-3 text-greenBlue-1000">
                  <ShieldCheck size={22} />
                  <div>
                    <strong className="block text-sm">
                      {enabledCount} permissoes ativas
                    </strong>
                    <span className="text-greenDark-700 text-xs">
                      {extraPermissions.size} adicionadas,{" "}
                      {revokedPermissions.size} revogadas
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(
                  ([module, modulePermissions]) => (
                    <section key={module} className="space-y-3">
                      <h3 className="text-base font-semibold text-greenBlue-1000">
                        {module}
                      </h3>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {modulePermissions.map((permission) => {
                          const checked = hasPermission(permission.key);

                          return (
                            <label
                              key={permission.key}
                              className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                                checked
                                  ? "border-greenBlue-700 bg-greenBlue-50"
                                  : "bg-white hover:border-greenBlue-500 border-gray-200"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  togglePermission(permission.key)
                                }
                                className="mt-1 h-4 w-4 accent-greenBlue-800"
                              />
                              <span>
                                <span className="block text-sm font-semibold text-greenBlue-1000">
                                  {permission.label}
                                </span>
                                <span className="text-greenDark-700 mt-1 block text-xs leading-relaxed">
                                  {permission.description}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  )
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

export default PermissionManagementPage;
