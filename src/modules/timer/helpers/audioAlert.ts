let activeAudioElement: HTMLAudioElement | null = null;
let activeAudioContext: AudioContext | null = null;
let activeSources: { stop: () => void }[] = [];
let activeFadeInterval: ReturnType<typeof setInterval> | null = null;

function clearFadeInterval() {
  if (activeFadeInterval) {
    clearInterval(activeFadeInterval);
    activeFadeInterval = null;
  }
}

function startFadeIn(audio: HTMLAudioElement, durationMs: number = 1500) {
  clearFadeInterval();
  audio.volume = 0;
  const stepIntervalMs = 50;
  const totalSteps = durationMs / stepIntervalMs;
  const volumeIncrement = 1 / totalSteps;

  activeFadeInterval = setInterval(() => {
    if (!audio || audio.paused) {
      clearFadeInterval();
      return;
    }
    const nextVolume = audio.volume + volumeIncrement;
    if (nextVolume >= 1) {
      audio.volume = 1;
      clearFadeInterval();
    } else {
      audio.volume = nextVolume;
    }
  }, stepIntervalMs);
}

function stopSynthesizedAlert() {
  activeSources.forEach((src) => {
    try {
      src.stop();
    } catch {
      // ignore
    }
  });
  activeSources = [];

  if (activeAudioContext && activeAudioContext.state !== "closed") {
    try {
      activeAudioContext.close();
    } catch {
      // ignore
    }
    activeAudioContext = null;
  }
}

export function stopSchoolBellAlert() {
  clearFadeInterval();
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.volume = 1;
    } catch {
      // ignore
    }
    activeAudioElement = null;
  }
  stopSynthesizedAlert();
}

function playSynthesizedAlert() {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    activeAudioContext = ctx;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-15, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(6, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.15, ctx.currentTime);
    compressor.connect(ctx.destination);

    const playBellStrike = (startTime: number, duration: number, isInitial: boolean) => {
      const freqs = [
        { f: 784, type: "sawtooth" as OscillatorType, gain: 0.3 },
        { f: 1046, type: "sine" as OscillatorType, gain: 0.35 },
        { f: 1568, type: "sine" as OscillatorType, gain: 0.25 },
        { f: 2093, type: "triangle" as OscillatorType, gain: 0.2 },
        { f: 3136, type: "sine" as OscillatorType, gain: 0.12 },
      ];

      const lfo = ctx.createOscillator();
      lfo.type = "square";
      lfo.frequency.setValueAtTime(24, startTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.45, startTime);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, startTime);
      // Fade in suave no primeiro toque
      const attackDuration = isInitial ? 1.0 : 0.15;
      mainGain.gain.linearRampToValueAtTime(0.65, startTime + attackDuration);
      mainGain.gain.setValueAtTime(0.65, startTime + duration);
      // Ring-out / ressonância metálica após parar o martelo
      mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.85);

      lfo.connect(lfoGain);
      lfoGain.connect(mainGain.gain);
      mainGain.connect(compressor);

      freqs.forEach(({ f, type, gain: volume }) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(f, startTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(volume, startTime);

        osc.connect(oscGain);
        oscGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.9);
        activeSources.push(osc);
      });

      lfo.start(startTime);
      lfo.stop(startTime + duration);
      activeSources.push(lfo);
    };

    const now = ctx.currentTime;
    playBellStrike(now + 0.05, 1.3, true);
    playBellStrike(now + 1.55, 1.8, false);
  } catch (err) {
    console.error("Failed to play synthesized school bell:", err);
  }
}

export function playSchoolBellAlert() {
  stopSchoolBellAlert();

  // Lista de caminhos suportados para o arquivo MP3 do usuário
  const candidateUrls = [
    "./audio/timer.mp3",
    "./audio/alerta.mp3",
    "./audio/alarm.mp3",
    "./audio/timer_alert.mp3",
    "./timer.mp3",
    "./alerta.mp3",
    "./alarm.mp3",
    "/audio/timer.mp3",
    "/audio/alerta.mp3",
    "/audio/alarm.mp3",
    "/audio/timer_alert.mp3",
    "/timer.mp3",
    "/alerta.mp3",
  ];

  let currentIdx = 0;
  let played = false;

  const tryNext = () => {
    if (played || currentIdx >= candidateUrls.length) {
      if (!played) {
        // Se nenhum arquivo MP3 respondeu, toca o sintetizador como fallback
        playSynthesizedAlert();
      }
      return;
    }

    const url = candidateUrls[currentIdx++];
    const audio = new Audio(url);
    activeAudioElement = audio;

    let hasError = false;

    const handleCanPlay = () => {
      if (hasError || played) return;
      played = true;
      audio.volume = 0;
      audio.play().then(() => {
        startFadeIn(audio, 1500);
      }).catch(() => {
        played = false;
        tryNext();
      });
    };

    const handleError = () => {
      hasError = true;
      if (!played) {
        tryNext();
      }
    };

    audio.addEventListener("canplaythrough", handleCanPlay, { once: true });
    audio.addEventListener("error", handleError, { once: true });

    // Inicia carregamento
    audio.load();

    // Timeout de segurança se o arquivo não responder em 300ms
    setTimeout(() => {
      if (!played && !hasError && audio.readyState < 2) {
        handleError();
      }
    }, 300);
  };

  tryNext();
}

export function playCultAlert(type: "start" | "5min" | "1min" | "end") {
  if (type === "end") {
    playSchoolBellAlert();
    return;
  }

  stopSchoolBellAlert();

  let fileNames: string[] = [];
  if (type === "start") {
    fileNames = ["abertura_escsb.mp3", "cult_start.mp3", "abertura.mp3"];
  } else if (type === "5min") {
    fileNames = ["5minutos_escsb.mp3", "cult_5min.mp3", "5minutos.mp3"];
  } else if (type === "1min") {
    fileNames = ["1minuto_escsb.mp3", "cult_1min.mp3", "1minuto.mp3"];
  }

  const candidateUrls: string[] = [];
  fileNames.forEach((file) => {
    candidateUrls.push(`./audio/${file}`, `/audio/${file}`, `./${file}`, `/${file}`);
  });

  let currentIdx = 0;
  let played = false;

  const tryNext = () => {
    if (played || currentIdx >= candidateUrls.length) {
      if (!played) {
        // Fallback sintetizado caso os arquivos MP3 não existam
        playSynthesizedAlert();
      }
      return;
    }

    const url = candidateUrls[currentIdx++];
    const audio = new Audio(url);
    activeAudioElement = audio;

    let hasError = false;

    const handleCanPlay = () => {
      if (hasError || played) return;
      played = true;
      audio.volume = 0;
      audio.play().then(() => {
        startFadeIn(audio, 1200);
      }).catch(() => {
        played = false;
        tryNext();
      });
    };

    const handleError = () => {
      hasError = true;
      if (!played) {
        tryNext();
      }
    };

    audio.addEventListener("canplaythrough", handleCanPlay, { once: true });
    audio.addEventListener("error", handleError, { once: true });

    audio.load();

    setTimeout(() => {
      if (!played && !hasError && audio.readyState < 2) {
        handleError();
      }
    }, 300);
  };

  tryNext();
}
