import { useEffect, useRef } from "react";

export const usePortal = () => {
  const portal = useRef(document.createElement("div"));

  useEffect(() => {
    const current = portal.current;
    const container = document.getElementById("modal-portal");
    container?.appendChild(portal.current);
    return () => void container?.removeChild(current);
  }, []);

  return portal;
};
