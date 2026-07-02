import Modules from "@/helpers/Modules";
import Dev from "@/helpers/Dev";
import String from "@/helpers/String";
import UserData from "@/helpers/UserData";
import AppData from "@/helpers/AppData";
import DateTime from "@/helpers/DateTime";
import Theme from "@/helpers/Theme";
import Path from "@/helpers/Path";
import Media from "@/helpers/Media";
import Alert from "@/helpers/Alert";
import Popup from "@/helpers/Popup";
import Database from "@/helpers/Database";
import History from "@/helpers/History";
import Favorites from "@/helpers/Favorites";

export const HelpersSymbol = Symbol("helpers");

export default {
  install(app) {
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
      favorites: Favorites,
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
    app.config.globalProperties.$favorites = Favorites;
  },
};
