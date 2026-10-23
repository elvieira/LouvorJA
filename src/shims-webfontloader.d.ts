declare module "webfontloader" {
  export interface WebFontConfig {
    google?: {
      families: string[];
    };
    custom?: {
      families?: string[];
      urls?: string[];
    };
    active?: () => void;
    inactive?: () => void;
    loading?: () => void;
    [key: string]: unknown;
  }

  export function load(config: WebFontConfig): void;
}
