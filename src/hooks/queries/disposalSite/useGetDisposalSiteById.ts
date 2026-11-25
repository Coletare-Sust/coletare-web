import { useQuery } from "@tanstack/react-query";
import { getDisposalSiteById } from "@/store/services/disposalSite";

export default function useGetDisposalSiteById(id: string, options?: any) {
  return useQuery(["disposal-site", id], () => getDisposalSiteById(id), {
    ...options
  });
}
