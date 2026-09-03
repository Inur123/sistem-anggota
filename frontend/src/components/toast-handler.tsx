"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ToastHandler() {
  const searchParams = useSearchParams();
  const processedParams = useRef("");

  useEffect(() => {
    const currentParams = searchParams.toString();
    if (!currentParams || processedParams.current === currentParams) return;
    
    processedParams.current = currentParams;

    const msg = searchParams.get("msg");
    const error = searchParams.get("error");

    if (msg) {
      if (msg === "login_success") {
        toast.success("Berhasil login!");
      } else if (msg === "logout_success") {
        toast.success("Berhasil logout!");
      } else {
        toast.success(msg);
      }
    }

    if (error) {
      toast.error(error);
    }

    // Clean up the URL without triggering Next.js router re-renders
    if (msg || error) {
      const remaining = new URLSearchParams(searchParams.toString());
      remaining.delete("msg");
      remaining.delete("error");
      const query = remaining.toString();
      const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [searchParams]);

  return null;
}
