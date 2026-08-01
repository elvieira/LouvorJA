import $dev from "@/helpers/config/Dev";
import $appdata from "@/helpers/config/AppData";

export interface AlertData {
  title?: string | null;
  text?: string | null;
  error?: string | null;
  color?: string;
  center?: boolean;
  translate?: boolean;
  buttons?: Array<{ text: string; color?: string; value: string }>;
}

export type AlertInput = string | [string, string] | AlertData;

export default {
  show(data: AlertInput, callback: (resp: unknown) => void = function () {}) {
    const formattedData = this.getData(data);

    $dev.write("dialog", formattedData, typeof formattedData, Array.isArray(formattedData));

    $appdata.set("alert.value", "");
    $appdata.set("alert.show", true);
    $appdata.set("alert.title", formattedData.title || null);
    $appdata.set("alert.text", formattedData.text || null);
    $appdata.set("alert.error", formattedData.error || null);
    $appdata.set("alert.color", formattedData.color || "");
    $appdata.set("alert.center", formattedData.center || false);
    $appdata.set(
      "alert.translate",
      formattedData.translate === null || formattedData.translate === undefined
        ? true
        : formattedData.translate,
    );
    $appdata.set(
      "alert.buttons",
      formattedData.buttons || [{ text: "alert.close", color: "error", value: "close" }],
    );

    const tmr = setInterval(() => {
      if (!$appdata.get("alert.show")) {
        clearInterval(tmr);
        callback($appdata.get("alert.value"));
      }
    }, 100);
  },

  yesno(data: AlertInput, callback: (resp: unknown, ret?: unknown) => void = function () {}) {
    const formattedData = this.getData(data);

    this.show(
      {
        ...formattedData,
        buttons: [
          { text: "alert.no", color: "error", value: "no" },
          { text: "alert.yes", color: "info", value: "yes" },
        ],
      },
      (resp: unknown) => {
        callback(resp);
      },
    );
  },

  info(data: AlertInput, callback: (resp: unknown, ret?: unknown) => void = function () {}) {
    const formattedData = this.getData(data);

    this.show(
      {
        ...formattedData,
        buttons: [{ text: "alert.close", color: "error", value: "close" }],
      },
      (resp: unknown) => {
        callback(resp);
      },
    );
  },

  error(data: AlertInput, callback: (resp: unknown, ret?: unknown) => void = function () {}) {
    const formattedData = this.getData(data);

    this.show(
      {
        ...formattedData,
        buttons: [{ text: "alert.close", color: "error", value: "close" }],
      },
      (resp: unknown) => {
        callback(resp);
      },
    );
  },

  getData(data: AlertInput): AlertData {
    if (typeof data === "string") {
      return { text: data };
    } else if (Array.isArray(data)) {
      return {
        title: data[0] ?? undefined,
        text: data[1] ?? undefined,
      };
    }

    return data as AlertData;
  },
};
