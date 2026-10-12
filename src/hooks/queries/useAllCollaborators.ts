import { useQuery } from "@tanstack/react-query";

import {
  ONE_DAY_IN_MS,
  FORTY_FIVE_MINUTES_IN_MS
} from "@common/constants/generic";

import type { UserEntity } from "@common/entities/user";
import { getAllCollaborators } from "@/store/services/user";
import type { DocumentData } from "@/common/entities/documentData";

export function getAllCollaboratorsQueryKey(cityid: string) {
  return ["collaborators", cityid];
}

export const getAllCollaboratorsQueryFn = (cityid: string) => {
  return () => getAllCollaborators(cityid);
};

const useAllCollaborators = <T = UserEntity[]>(
  cityid: string,
  select?: (data: DocumentData) => T
) => {
  return useQuery(
    getAllCollaboratorsQueryKey(cityid),
    getAllCollaboratorsQueryFn(cityid),
    {
      select,
      staleTime: FORTY_FIVE_MINUTES_IN_MS,
      cacheTime: ONE_DAY_IN_MS,
      enabled: !!cityid
    }
  );
};

export default useAllCollaborators;
