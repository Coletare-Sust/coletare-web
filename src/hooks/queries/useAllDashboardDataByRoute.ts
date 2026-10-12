import { useState, useEffect, useRef } from "react";
import type { DocumentData } from "@/common/entities/documentData";
import { getDashboardData } from "@/store/services/collects";
import { DashboardEntity } from "@/common/entities/dashboard";

const useAllDashboardByRoutes = <T = DashboardEntity>(
  cityId: string,
  routeId: string,
  select?: (data: DocumentData) => T
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectRef = useRef(select);

  useEffect(() => {
    selectRef.current = select;
  }, [select]);

  useEffect(() => {
    let isMounted = true;

    if (!cityId || !routeId) {
      if (isMounted) {
        setData(null);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const responseData = await getDashboardData(cityId, routeId);
        if (isMounted) {
          if (selectRef.current) {
            setData(selectRef.current(responseData as unknown as DocumentData));
          } else {
            setData(responseData as unknown as T);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch dashboard data by route");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [cityId, routeId]);

  return { data, isLoading, error };
};

export default useAllDashboardByRoutes;
