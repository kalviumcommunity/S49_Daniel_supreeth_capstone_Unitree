import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "./api";

// Fetches a GET endpoint and re-fetches whenever the url or params change.
// Pass url = null to skip fetching.
export default function useApi(url, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState("");
  const paramsKey = JSON.stringify(params || {});

  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(url, { params: JSON.parse(paramsKey) });
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [url, paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}
