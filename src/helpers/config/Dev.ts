/* eslint-disable @typescript-eslint/no-explicit-any */
import $appdata from "@/helpers/config/AppData";
import $alert from "@/helpers/ui/Alert";

export default {
  write(...args: any[]) {
    if (this.debug()) {
      console.log(...args, " << ");
    }
  },
  debug(): boolean {
    const is_dev = $appdata.get("is_dev");
    return is_dev;
  },
  toogle() {
    const is_dev = $appdata.get("is_dev");
    $appdata.set("is_dev", !is_dev);
    $alert.info(
      `messages.${
        is_dev ? "developer_mode_disabled" : "developer_mode_enabled"
      }`,
    );
  },
};
