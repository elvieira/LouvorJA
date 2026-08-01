/* eslint-disable @typescript-eslint/no-explicit-any */
import Modules from "@/helpers/core/Modules";
import Dev from "@/helpers/config/Dev";
import UserData from "@/helpers/config/UserData";

import AppData from "@/helpers/config/AppData";
import String from "@/helpers/utils/String";
import DateTime from "@/helpers/utils/DateTime";
import Theme from "@/helpers/config/Theme";
import Path from "@/helpers/utils/Path";
import Media from "@/helpers/services/Media";
import Alert from "@/helpers/ui/Alert";
import Popup from "@/helpers/ui/Popup";
import Database from "@/helpers/services/Database";
import History from "@/helpers/services/History";

export const HelpersSymbol = Symbol("helpers");

export default {
  install(app: any) {
    const helpers = {
      userdata: UserData,
      appdata: AppData,
      modules: Modules,
      dev: Dev,
      string: String,
      datetime: DateTime,
      theme: Theme,
      path: Path,
      media: Media,
      alert: Alert,
      popup: Popup,
      database: Database,
      history: History,
    };

    app.provide(HelpersSymbol, helpers);
    
    app.config.globalProperties.$helpers = helpers;
    app.config.globalProperties.$userdata = UserData;
    app.config.globalProperties.$appdata = AppData;
    app.config.globalProperties.$modules = Modules;
    app.config.globalProperties.$dev = Dev;
    app.config.globalProperties.$string = String;
    app.config.globalProperties.$datetime = DateTime;
    app.config.globalProperties.$theme = Theme;
    app.config.globalProperties.$path = Path;
    app.config.globalProperties.$media = Media;
    app.config.globalProperties.$alert = Alert;
    app.config.globalProperties.$popup = Popup;
    app.config.globalProperties.$database = Database;
    app.config.globalProperties.$history = History;
  },
};
