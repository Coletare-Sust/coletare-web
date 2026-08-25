import { useState, useEffect, useRef } from "react";
import { getDashboardData } from "@/store/services/collects";
import { DashboardEntity } from "@/common/entities/dashboard";

const useAllDashboard = <T = DashboardEntity | null>(
  cityId: string | null,
  select?: (data: DashboardEntity | null) => T
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

    if (!cityId || cityId === "null") {
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
        const responseData = await getDashboardData(cityId);
        if (isMounted) {
          if (selectRef.current) {
            setData(selectRef.current(responseData));
          } else {
            setData(responseData as unknown as T);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch dashboard data");
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
  }, [cityId]);

  return { data, isLoading, error };
};

export default useAllDashboard;
