/* eslint-disable @typescript-eslint/no-explicit-any */
import packageJson from "../../../package.json";
import $userdata from "@/helpers/config/UserData";

export interface TelemetryEvent {
  installation_id: string;
  session_id: string;
  event_name: string;
  app_version: string;
  platform: string;
  os_name: string;
  event_data: Record<string, any>;
  created_at: string;
}

export interface TelemetryInstallation {
  installation_id: string;
  app_version: string;
  platform: string;
  os_name: string;
  arch: string;
  screen_resolution: string;
  displays_count: number;
  locale: string;
  total_sessions: number;
  metadata?: Record<string, any>;
}

export interface TelemetrySongPlay {
  installation_id: string;
  session_id: string;
  song_play_id: string;
  id_music: string | null;
  song_title: string;
  subtitle: string;
  album_name: string;
  audio_mode: string;
  is_external: boolean;
  total_slides: number;
  slides_shown: number;
  completion_pct: number;
  duration_seconds: number;
  stop_reason: "completed" | "closed" | "next_song" | "interrupted" | "app_closed";
  started_at: string;
  ended_at: string;
  app_version: string;
}

export interface StartSongPlayOptions {
  id_music?: string | null;
  song_title: string;
  subtitle?: string;
  album_name?: string;
  audio_mode?: string;
  is_external?: boolean;
  total_slides?: number;
}

export const CLOUD_ENDPOINT = (import.meta.env.VITE_CLOUD_ENDPOINT as string) || "";
export const CLOUD_TOKEN = (import.meta.env.VITE_CLOUD_TOKEN as string) || "";
export const APP_SIGNATURE = (import.meta.env.VITE_APP_SIGNATURE as string) || "lja_app_sig_9f7a2c1e8b4d";

const STORAGE_INSTALLATION_ID = "louvorja_telemetry_installation_id";
const STORAGE_QUEUE = "louvorja_telemetry_queue";
const STORAGE_SONG_PLAYS_QUEUE = "louvorja_telemetry_song_plays_queue";
const STORAGE_TOTAL_SESSIONS = "louvorja_telemetry_total_sessions";
const STORAGE_DISPLAYS_COUNT = "louvorja_telemetry_displays_count";
const MAX_QUEUE_SIZE = 1000;

class TelemetryService {
  private sessionId: string;
  private isFlushing = false;
  private isFlushingSongPlays = false;
  private isInitialized = false;
  private flushTimeout: any = null;
  private activeSongPlay: {
    song_play_id: string;
    id_music: string | null;
    song_title: string;
    subtitle: string;
    album_name: string;
    audio_mode: string;
    is_external: boolean;
    total_slides: number;
    visitedSlides: Set<number>;
    started_at: Date;
  } | null = null;

  constructor() {
    this.sessionId = this.generateUuid();
  }

  private generateUuid(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      try {
        return crypto.randomUUID();
      } catch {
        // fallback
      }
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public isEnabled(): boolean {
    return $userdata.get("telemetry_enabled") !== false;
  }

  public getInstallationId(): string {
    try {
      let id = localStorage.getItem(STORAGE_INSTALLATION_ID);
      if (!id) {
        id = this.generateUuid();
        localStorage.setItem(STORAGE_INSTALLATION_ID, id);
      }
      return id;
    } catch {
      return this.sessionId;
    }
  }

  public getAppVersion(): string {
    return packageJson.version || "1.9.3";
  }

  public getPlatform(): string {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      if ((window as any).electronAPI.isWindows) return "Windows";
      if ((window as any).electronAPI.isMac) return "macOS";
      return "Linux";
    }
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("win")) return "Windows";
      if (ua.includes("mac")) return "macOS";
      if (ua.includes("linux")) return "Linux";
    }
    return "Web";
  }

  public getOsName(): string {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      if ((window as any).electronAPI.isWindows) return "Windows (Desktop)";
      if ((window as any).electronAPI.isMac) return "macOS (Desktop)";
      return "Linux (Desktop)";
    }
    if (typeof navigator !== "undefined") {
      return navigator.platform || "Web";
    }
    return "Web";
  }

  public getArch(): string {
    if (typeof window !== "undefined" && (window as any).electronAPI?.arch) {
      return (window as any).electronAPI.arch;
    }
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      if (ua.includes("ARM64") || ua.includes("aarch64")) return "arm64";
      if (ua.includes("x86_64") || ua.includes("Win64") || ua.includes("WOW64") || ua.includes("x64")) return "x64";
    }
    return "x64";
  }

  public getTotalSessions(): number {
    try {
      return parseInt(localStorage.getItem(STORAGE_TOTAL_SESSIONS) || "1", 10);
    } catch {
      return 1;
    }
  }

  public getDisplaysCount(): number {
    try {
      const stored = localStorage.getItem(STORAGE_DISPLAYS_COUNT);
      return stored ? parseInt(stored, 10) : 1;
    } catch {
      return 1;
    }
  }

  private getQueue(): TelemetryEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: TelemetryEvent[]): void {
    try {
      const trimmed = queue.slice(-MAX_QUEUE_SIZE);
      localStorage.setItem(STORAGE_QUEUE, JSON.stringify(trimmed));
    } catch {
      // ignore
    }
  }

  /**
   * Inicializa o serviço ao abrir o app:
   * Incrementa contador de sessões, detecta monitores e registra evento app_started.
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!this.isEnabled()) return;

    // Incrementa contagem de sessões desta instalação
    try {
      const sessions = parseInt(localStorage.getItem(STORAGE_TOTAL_SESSIONS) || "0", 10) + 1;
      localStorage.setItem(STORAGE_TOTAL_SESSIONS, String(sessions));
    } catch {
      // ignore
    }

    // Detecta quantidade de monitores reais no Desktop
    if (typeof window !== "undefined" && (window as any).electronAPI?.getDisplays) {
      try {
        const displays = await (window as any).electronAPI.getDisplays();
        if (displays && Array.isArray(displays) && displays.length > 0) {
          localStorage.setItem(STORAGE_DISPLAYS_COUNT, String(displays.length));
        }
      } catch {
        // ignore
      }
    }

    // Registra o evento de inicialização do app (enviado imediatamente na hora)
    this.track("app_started", {
      start_time: new Date().toISOString(),
      app_version: this.getAppVersion(),
      platform: this.getPlatform(),
    });

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        if (this.activeSongPlay) {
          this.endSongPlay("app_closed");
        }
      });
    }

    this.flushSongPlaysQueue().catch(() => {});
  }

  /**
   * Agenda ou dispara o envio imediato da fila
   */
  public scheduleFlush(delayMs = 0): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    if (delayMs <= 0) {
      this.flushQueue().catch(() => {});
    } else {
      this.flushTimeout = setTimeout(() => {
        this.flushQueue().catch(() => {});
      }, delayMs);
    }
  }

  /**
   * Sanitiza id_music para nunca trafegar caminhos de pastas locais na telemetria,
   * preservando apenas o ID do catálogo interno ou o nome base do arquivo externo.
   */
  public sanitizeMusicId(idMusic: any): string | null {
    if (!idMusic) return null;
    const str = String(idMusic).trim();
    if (!str) return null;

    if (/^\d+$/.test(str)) {
      return str;
    }

    let clean = str;
    if (clean.startsWith("slja:")) {
      clean = clean.slice(5);
    }
    const parts = clean.split(/[/\\]/);
    const fileName = parts[parts.length - 1] || clean;

    return fileName.trim() || null;
  }

  /**
   * Registra um evento de telemetria.
   * Por padrão, envia na hora ao invés de aguardar o final do dia!
   */
  public track(eventName: string, eventData: Record<string, any> = {}): void {
    if (!this.isEnabled()) return;

    if (eventData && eventData.id_music) {
      eventData.id_music = this.sanitizeMusicId(eventData.id_music);
    }

    const event: TelemetryEvent = {
      installation_id: this.getInstallationId(),
      session_id: this.sessionId,
      event_name: eventName,
      app_version: this.getAppVersion(),
      platform: this.getPlatform(),
      os_name: this.getOsName(),
      event_data: eventData,
      created_at: new Date().toISOString(),
    };

    const queue = this.getQueue();
    queue.push(event);
    this.saveQueue(queue);

    // Envio na hora: se for slide_projected, pequeno debounce de 400ms para agrupar avanços rápidos de slides
    if (eventName === "slide_projected") {
      this.scheduleFlush(400);
    } else {
      // Para músicas, módulos, início de sessão e erros: envia na hora!
      this.scheduleFlush(0);
    }
  }

  /**
   * Helper para envio de erro imediato
   */
  public trackError(message: string, details?: any, moduleName?: string): void {
    this.track("error_occurred", {
      message,
      details: typeof details === "object" ? JSON.stringify(details) : details,
      module: moduleName,
    });
  }

  /**
   * Despacha a fila de eventos armazenada para a nuvem via RPC
   */
  public async flushQueue(): Promise<boolean> {
    if (this.isFlushing || !this.isEnabled()) return false;
    this.isFlushing = true;

    try {
      const queue = this.getQueue();
      if (queue.length === 0) {
        this.isFlushing = false;
        return true;
      }

      // Snapshot dos eventos que vamos tentar enviar nesta requisição
      const eventsToSend = [...queue];
      const installation = this.getInstallationPayload();

      const response = await fetch(`${CLOUD_ENDPOINT}/rest/v1/rpc/ingest_telemetry_batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: CLOUD_TOKEN,
          Authorization: `Bearer ${CLOUD_TOKEN}`,
          "x-app-signature": APP_SIGNATURE,
        },
        body: JSON.stringify({
          p_installation: installation,
          p_events: eventsToSend,
        }),
      });

      if (response.ok) {
        // Envio concluído com sucesso: remove da fila APENAS os eventos que foram enviados
        const currentQueue = this.getQueue();
        const sentKeys = new Set(eventsToSend.map((e) => `${e.created_at}_${e.event_name}`));
        const remaining = currentQueue.filter((e) => !sentKeys.has(`${e.created_at}_${e.event_name}`));
        this.saveQueue(remaining);

        this.isFlushing = false;

        // Se novos eventos entraram enquanto a requisição estava em trânsito, agenda novo flush
        if (remaining.length > 0) {
          this.scheduleFlush(200);
        }
        return true;
      }
    } catch {
      // Falha silenciosa de rede (mantém a fila local para enviar na próxima oportunidade)
    } finally {
      this.isFlushing = false;
    }

    return false;
  }

  public getInstallationPayload(): TelemetryInstallation {
    return {
      installation_id: this.getInstallationId(),
      app_version: this.getAppVersion(),
      platform: this.getPlatform(),
      os_name: this.getOsName(),
      arch: this.getArch(),
      screen_resolution:
        typeof window !== "undefined" && window.screen
          ? `${window.screen.width}x${window.screen.height}`
          : "unknown",
      displays_count: this.getDisplaysCount(),
      locale: typeof navigator !== "undefined" ? navigator.language : "pt-BR",
      total_sessions: this.getTotalSessions(),
    };
  }

  private getSongPlaysQueue(): TelemetrySongPlay[] {
    try {
      const raw = localStorage.getItem(STORAGE_SONG_PLAYS_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveSongPlaysQueue(queue: TelemetrySongPlay[]): void {
    try {
      const trimmed = queue.slice(-100);
      localStorage.setItem(STORAGE_SONG_PLAYS_QUEUE, JSON.stringify(trimmed));
    } catch {
      // ignore
    }
  }

  public hasActiveSongPlay(): boolean {
    return this.activeSongPlay !== null;
  }

  /**
   * Inicia o rastreamento em memória da reprodução de uma música.
   * Se já existia uma música em andamento, finaliza-a como 'next_song'.
   */
  public startSongPlay(options: StartSongPlayOptions): void {
    if (!this.isEnabled()) return;

    if (this.activeSongPlay) {
      this.endSongPlay("next_song");
    }

    // Normaliza modo de áudio (LouvorJA usa 'audio' para cantado e 'instrumental' para playback)
    let audioMode = options.audio_mode || "no_audio";
    if (audioMode === "audio") audioMode = "cantado";
    else if (audioMode === "instrumental") audioMode = "playback";

    // Normaliza título (remove quebras de linha e múltiplos espaços)
    const cleanTitle = (options.song_title || "")
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const cleanIdMusic = this.sanitizeMusicId(options.id_music);
    const isExternal = Boolean(
      options.is_external ||
      (options.id_music && typeof options.id_music === "string" && (
        options.id_music.startsWith("slja:") ||
        options.id_music.includes("/") ||
        options.id_music.includes("\\")
      )),
    );

    this.activeSongPlay = {
      song_play_id: this.generateUuid(),
      id_music: cleanIdMusic,
      song_title: cleanTitle,
      subtitle: (options.subtitle || "").trim(),
      album_name: (options.album_name || "").trim(),
      audio_mode: audioMode,
      is_external: isExternal,
      total_slides: options.total_slides || 0,
      visitedSlides: new Set<number>([0]),
      started_at: new Date(),
    };
  }

  /**
   * Registra a transição de slide apenas em memória (zero requisições de rede).
   */
  public recordSlide(slideIndex: number): void {
    if (!this.isEnabled() || !this.activeSongPlay) return;
    this.activeSongPlay.visitedSlides.add(slideIndex);
    if (slideIndex + 1 > this.activeSongPlay.total_slides) {
      this.activeSongPlay.total_slides = slideIndex + 1;
    }
  }

  /**
   * Finaliza a reprodução da música e envia um único registro consolidado à nuvem.
   */
  public endSongPlay(
    stopReason: "completed" | "closed" | "next_song" | "interrupted" | "app_closed" = "closed",
  ): void {
    if (!this.activeSongPlay) return;
    const play = this.activeSongPlay;
    this.activeSongPlay = null;

    if (!this.isEnabled()) return;

    const endedAt = new Date();
    const durationSeconds = Math.max(
      0,
      Math.round((endedAt.getTime() - play.started_at.getTime()) / 1000),
    );
    let slidesShown = play.visitedSlides.size;
    const totalSlides = play.total_slides > 0 ? play.total_slides : (slidesShown || 1);

    let completionPct = 0;
    if (stopReason === "completed") {
      completionPct = 100;
      slidesShown = totalSlides;
    } else {
      completionPct = Math.min(100, Math.round((slidesShown / totalSlides) * 100));
    }

    const payload: TelemetrySongPlay = {
      installation_id: this.getInstallationId(),
      session_id: this.sessionId,
      song_play_id: play.song_play_id,
      id_music: play.id_music,
      song_title: play.song_title,
      subtitle: play.subtitle,
      album_name: play.album_name,
      audio_mode: play.audio_mode,
      is_external: play.is_external,
      total_slides: totalSlides,
      slides_shown: slidesShown,
      completion_pct: completionPct,
      duration_seconds: durationSeconds,
      stop_reason: stopReason,
      started_at: play.started_at.toISOString(),
      ended_at: endedAt.toISOString(),
      app_version: this.getAppVersion(),
    };

    const queue = this.getSongPlaysQueue();
    queue.push(payload);
    this.saveSongPlaysQueue(queue);
    this.flushSongPlaysQueue().catch(() => {});
  }

  /**
   * Envia a fila de reproduções consolidadas para a nuvem via ingest_song_play
   */
  public async flushSongPlaysQueue(): Promise<boolean> {
    if (this.isFlushingSongPlays || !this.isEnabled()) return false;
    this.isFlushingSongPlays = true;

    try {
      const queue = this.getSongPlaysQueue();
      if (queue.length === 0) {
        this.isFlushingSongPlays = false;
        return true;
      }

      const installation = this.getInstallationPayload();
      const remaining: TelemetrySongPlay[] = [];

      for (const songPlay of queue) {
        try {
          const res = await fetch(`${CLOUD_ENDPOINT}/rest/v1/rpc/ingest_song_play`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: CLOUD_TOKEN,
              Authorization: `Bearer ${CLOUD_TOKEN}`,
              "x-app-signature": APP_SIGNATURE,
            },
            body: JSON.stringify({
              p_installation: installation,
              p_song_play: songPlay,
            }),
          });
          if (!res.ok) {
            remaining.push(songPlay);
          }
        } catch {
          remaining.push(songPlay);
        }
      }

      this.saveSongPlaysQueue(remaining);
      return remaining.length === 0;
    } catch {
      // ignore
    } finally {
      this.isFlushingSongPlays = false;
    }
    return false;
  }
}

export const Telemetry = new TelemetryService();
export default Telemetry;
