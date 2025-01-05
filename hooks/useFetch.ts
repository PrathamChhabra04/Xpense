/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "sonner";

// Define types for the response and error
type FetchFunction<T> = (...args: any[]) => Promise<T>;

interface UseFetchResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  fn: (...args: any[]) => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}

const useFetch = <T>(cb: FetchFunction<T>): UseFetchResult<T> => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: any[]): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
