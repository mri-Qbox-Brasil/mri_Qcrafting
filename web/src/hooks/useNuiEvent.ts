import { useEffect, useRef } from "react";

interface NuiMessageData<T = any> {
  action: string;
  data: T;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * A hook that manages event listeners for receiving data from the Lua scripts.
 * @param action The specific `action` that should invoke this handler.
 * @param handler The callback function that will run when the event is received.
 */
export const useNuiEvent = <T = any>(
  action: string,
  handler: NuiHandlerSignature<T>,
) => {
  const savedHandler = useRef<NuiHandlerSignature<T> | undefined>(undefined);

  // Make sure we handle for the latest handler
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: MessageEvent<NuiMessageData<T>>) => {
      const { action: eventAction, data } = event.data;

      if (savedHandler.current && eventAction === action) {
        savedHandler.current(data);
      }
    };

    window.addEventListener("message", eventListener);
    // Remove Event Listener on component unmount
    return () => window.removeEventListener("message", eventListener);
  }, [action]);
};
