/* eslint-disable @typescript-eslint/no-explicit-any */
// Carregador único e reentrante da API oficial do YouTube IFrame (YT.Player).
// Cada BrowserWindow (janela principal e janelas de projeção) tem seu próprio
// escopo `window`, então cada uma carrega sua própria cópia — isso é esperado.

let apiPromise: Promise<any> | null = null;

export function loadYoutubeApi(): Promise<any> {
  const w = window as any;
  if (w.YT && w.YT.Player) {
    return Promise.resolve(w.YT);
  }
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      resolve(w.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}
