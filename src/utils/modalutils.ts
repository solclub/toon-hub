import { MutableRefObject, useEffect, useRef } from "react";

export const usePortal = () => {
  const portal = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      portal.current = document.createElement("div");
      const current = portal.current;
      const container = document.getElementById("modal-portal");
      container?.appendChild(portal.current);
      return () => void container?.removeChild(current);
    }
  }, []);

  return portal;
};
