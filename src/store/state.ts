/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AppState {
  is_dev: boolean;
  is_dark: boolean;
  is_popup: boolean;
  is_mobile: boolean;
  is_desktop: boolean;
  is_online: boolean;
  popup: Window | null;
  popup_module: any;
  import_modules: boolean;
  loading: boolean;
  modules: Record<string, any>;
  module_group: Record<string, any>;
  menu: {
    show: boolean;
    modules: string[];
  };
  tray_area: {
    modules: string[];
  };
  languages: Record<string, { name: string; flag: string }>;
  alert: {
    show: boolean;
    title: string;
    text: string;
    error: string;
    color: string;
    buttons: any[];
    value: string;
    translate: boolean;
  };
  user_data: {
    theme: string;
    language: string;
    modules: {
      musics: {
        search: {
          name: boolean;
          lyric: boolean;
          album: boolean;
        };
        filter: {
          instrumental_music: boolean;
        };
      };
      media: {
        lazy_load: boolean;
        fade_audio: boolean;
      };
      [key: string]: any;
    };
  };
  popups?: Window[];
  [key: string]: any;
}

const state: AppState = {
  is_dev: false,
  is_dark: false,
  is_popup: false,
  is_mobile: false,
  is_desktop: false,
  is_online: false,
  popup: null,
  popup_module: null,
  import_modules: false,
  loading: false,
  modules: {},
  module_group: {
    musics: {
      title: "module_group.musics.title",
      modules: ["musics", "hymnal", "hymnal_1996"],
    },
    bible: {
      title: "module_group.bible.title",
      modules: [],
    },
    utilities: {
      title: "module_group.utilities.title",
      modules: [],
    },
  },
  menu: {
    show: false,
    modules: [],
  },
  tray_area: {
    modules: [],
  },
  languages: {
    pt: { name: "Português", flag: "br" },
    es: { name: "Español", flag: "es" },
  },
  alert: {
    show: false,
    title: "",
    text: "",
    error: "",
    color: "",
    buttons: [],
    value: "",
    translate: false,
  },
  user_data: {
    theme: "",
    language: "",
    modules: {
      musics: {
        search: {
          name: true,
          lyric: false,
          album: false,
        },
        filter: {
          instrumental_music: false,
        },
      },
      media: {
        lazy_load: true,
        fade_audio: true,
      },
    },
  },
};

export default state;
