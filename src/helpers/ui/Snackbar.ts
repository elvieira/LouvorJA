import $appdata from "@/helpers/config/AppData";

export interface SnackbarData {
  text: string;
  loading?: boolean;
  color?: string;
  timeout?: number;
}

export default {
  show(data: SnackbarData | string) {
    let formattedData: SnackbarData;
    if (typeof data === "string") {
      formattedData = { text: data, loading: false, color: "primary", timeout: 5000 };
    } else {
      formattedData = {
        text: data.text,
        loading: data.loading || false,
        color: data.color || "primary",
        timeout: data.timeout !== undefined ? data.timeout : 5000,
      };
    }

    $appdata.set("snackbar.text", formattedData.text);
    $appdata.set("snackbar.loading", formattedData.loading);
    $appdata.set("snackbar.color", formattedData.color);
    $appdata.set("snackbar.timeout", formattedData.timeout);
    $appdata.set("snackbar.show", true);
  },

  hide() {
    $appdata.set("snackbar.show", false);
  },
};
