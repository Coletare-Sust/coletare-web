import { useQuery } from "@tanstack/react-query";
import { getEcopontoById } from "@/store/services/ecopoint";

export default function useGetEcopontoById(id: string, options?: any) {
  return useQuery(["ecoponto", id], () => getEcopontoById(id), {
    ...options
  });
}
