import "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $appdata: unknown;
    $modules: unknown;
    $dev: unknown;
    $media: unknown;
    $alert: unknown;
    $path: unknown;
  }
}
