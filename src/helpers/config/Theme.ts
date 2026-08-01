import $appdata from "@/helpers/config/AppData";

export default {
  primary(): string | undefined {
    return !$appdata.get("is_dark") ? "primary" : undefined;
  },
};
