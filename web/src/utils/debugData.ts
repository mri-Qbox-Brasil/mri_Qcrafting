import { isEnvBrowser } from "./fetchNui";

interface DebugEvent {
  action: string;
  data: any;
}

/**
 * Emulates data sent from the Lua client to the NUI window.
 * This function only executes if the environment is strictly a browser.
 *
 * @param events - Timer-based delay events to emulate user/game actions
 * @param timer - (Optional) Delay time in milliseconds
 */
export const debugData = (events: DebugEvent[], timer = 1000) => {
  if (import.meta.env.MODE === "development" && isEnvBrowser()) {
    for (const event of events) {
      setTimeout(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: {
              action: event.action,
              data: event.data,
            },
          }),
        );
      }, timer);
    }
  }
};
