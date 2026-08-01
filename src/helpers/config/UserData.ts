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

  get(param?: string, ifnull: any = null): any {
    //$dev.write("get userdata", { param, ifnull });
    if (!param) {
      return $appdata.get("user_data", ifnull);
    }
    return $appdata.get(`user_data.${param}`, ifnull);
  },
};
