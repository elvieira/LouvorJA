/* eslint-disable @typescript-eslint/no-explicit-any */
import $dev from "@/helpers/config/Dev";
import $storage from "@/helpers/services/Storage";
import $appdata from "@/helpers/config/AppData";

export default {
  save() {
    $dev.write("salvando dados");
    /*if (store.state.desktop) {
          // SE FOR APLICAÇÃO DESKTOP, SALVA AS CONFIGURAÇÕES NA MAQUINA DO USUARIO
          IPC.send('save_data', JSON.stringify(store.state.data));
      }*/

    //Salvar no Storage
    $storage.set("user_data", $appdata.get("user_data"));
  },
  load() {
    $dev.write("carregando dados");
    const data = $appdata.flatten($storage.get("user_data") as Record<string, any>);

    Object.keys(data).map((item) => {
      $appdata.set(`user_data.${item}`, data[item]);
    });
  },

  set(param: string, value: any) {
    $dev.write("set userdata", { param, value });
    $appdata.set(`user_data.${param}`, value);

    //Salvar os Dados
    this.save();
  },

  getDefault(param: string): any {
    // Para configurações de monitor estendido dinâmicas
    if (param === "modules.config.slide_monitor" || param === "modules.config.media_slide_monitor") {
      const displays = $appdata.get("system_displays") || [];
      if (displays.length > 1) {
        const primaryId = displays.find((d: any) => d.isPrimary)?.id;
        const unselected = $appdata.get("user_data.modules.config.unselected_slide_monitors") || [];
        return displays
          .filter((d: any) => d.id !== primaryId && !unselected.includes(d.id))
          .map((d: any) => d.id);
      }
      return [];
    }

    // Padrões Globais Estáticos
    const staticDefaults: Record<string, any> = {
      "modules.config.slide_fullscreen": true,
      "modules.config.slide_disable_main_if_extended": true,
      "modules.config.slide_minimize_player": false,
      "modules.config.slide_show_title": true,
      "modules.config.slide_align": "Centro",
      "modules.config.slide_custom_text_format": false,
      "modules.config.slide_font_size": 100,
      "modules.config.slide_font_color": "#FFFFFF",
      "modules.config.slide_font_weight": "700",
      "modules.config.slide_custom_bg": false,
      "modules.config.slide_bg_color": "#000000",
      "modules.config.slide_bg_opacity": 100,

      "modules.config.media_use_internal_player": false,
      "modules.config.media_sync_projection_settings": true,
      "modules.config.media_auto_project_video": true,
      "modules.config.media_pause_on_minimize": false,
      "modules.config.media_slide_fullscreen": true,
      "modules.config.media_slide_disable_main_if_extended": true,
      "modules.config.media_slide_minimize_player": false,
    };

    return staticDefaults[param];
  },

  get(param?: string, ifnull: any = null): any {
    //$dev.write("get userdata", { param, ifnull });
    if (!param) {
      return $appdata.get("user_data", ifnull);
    }
    
    const val = $appdata.get(`user_data.${param}`);
    if (val !== undefined && val !== null) {
      return val;
    }

    const defaultVal = this.getDefault(param);
    if (defaultVal !== undefined) {
      return defaultVal;
    }

    return ifnull;
  },
};
