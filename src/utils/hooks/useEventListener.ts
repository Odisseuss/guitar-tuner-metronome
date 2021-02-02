import { useEffect, useRef } from "react";
//@ts-ignore
import window from "global";

const useEventListener = (eventName: any, handler: null) => {
  const savedHandler = useRef(null);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Create event listener that calls handler function stored in ref
      //@ts-ignore
      const eventListener = (event: any) => savedHandler.current(event);

      window.addEventListener(eventName, eventListener, { passive: false });
      return () => {
        window.removeEventListener(eventName, eventListener);
      };
    }
  }, [eventName]);
};

export default useEventListener;
