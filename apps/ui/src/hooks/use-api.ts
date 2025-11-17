import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

type HttpMethod = "get" | "post" | "put" | "delete";

interface IResponse {
  msg: string;
}

interface UseApiReturn<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  callApi: (
    url: string,
    method?: HttpMethod,
    payload?: any,
    showToast?: boolean
  ) => Promise<T | undefined>;
}

const logoutCodes = [401, 403];

export const useApi = <T = any>(): UseApiReturn<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const callApi = async (
    url: string,
    method: HttpMethod = "get",
    payload?: any,
    showToast = true
  ): Promise<T | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api[method]<T & IResponse>(url, payload);

      setData(response.data);
      if (showToast) {
        if (response.data?.msg) toast.success(response.data?.msg);
      }
      return response.data;
    } catch (err: any) {
      console.log(err?.response.status, "status");
      if (logoutCodes.includes(err?.response.status)) {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
      const message = err.response?.data?.msg || err.message || "Error";
      setError(message);
      if (showToast) toast.error(message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, callApi };
};
