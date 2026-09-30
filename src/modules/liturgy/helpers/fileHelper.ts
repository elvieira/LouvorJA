export interface LiturgyFileInfo {
  category: "audio" | "video" | "presentation" | "pdf" | "image" | "louvorja" | "folder" | "document" | "file";
  icon: string;
  color: string;
  label: string;
  extension: string;
  fileName: string;
  isMedia: boolean;
  isAudio: boolean;
  isVideo: boolean;
  isLouvorJa: boolean;
  isNativeOpen: boolean;
}

export function getLiturgyFileInfo(filePath?: string | null): LiturgyFileInfo {
  if (!filePath) {
    return {
      category: "file",
      icon: "mdi-folder-file-outline",
      color: "blue-grey",
      label: "Arquivo",
      extension: "",
      fileName: "",
      isMedia: false,
      isAudio: false,
      isVideo: false,
      isLouvorJa: false,
      isNativeOpen: true,
    };
  }

  const cleanPath = filePath.trim();
  const fileName = cleanPath.split(/[\\/]/).pop() || "";
  const ext = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() || "" : "";

  // 1. Áudio
  const audioExts = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"];
  if (audioExts.includes(ext)) {
    return {
      category: "audio",
      icon: "mdi-headphones",
      color: "orange",
      label: "Áudio",
      extension: ext.toUpperCase(),
      fileName,
      isMedia: true,
      isAudio: true,
      isVideo: false,
      isLouvorJa: false,
      isNativeOpen: false,
    };
  }

  // 2. Vídeo
  const videoExts = ["mp4", "mkv", "avi", "mov", "wmv", "webm", "m4v"];
  if (videoExts.includes(ext)) {
    return {
      category: "video",
      icon: "mdi-video-outline",
      color: "deep-orange",
      label: "Vídeo",
      extension: ext.toUpperCase(),
      fileName,
      isMedia: true,
      isAudio: false,
      isVideo: true,
      isLouvorJa: false,
      isNativeOpen: false,
    };
  }

  // 3. LouvorJA (.slja, .sja, .lja)
  const louvorJaExts = ["slja", "sja", "lja"];
  if (louvorJaExts.includes(ext)) {
    return {
      category: "louvorja",
      icon: "mdi-music-box-outline",
      color: "purple",
      label: "Música LouvorJA",
      extension: ext.toUpperCase(),
      fileName,
      isMedia: true,
      isAudio: false,
      isVideo: false,
      isLouvorJa: true,
      isNativeOpen: false,
    };
  }

  // 4. Apresentação PowerPoint / Slides
  const presentationExts = ["ppt", "pptx", "pps", "ppsx", "odp", "key"];
  if (presentationExts.includes(ext)) {
    return {
      category: "presentation",
      icon: "mdi-file-powerpoint-box",
      color: "red-darken-2",
      label: "Apresentação",
      extension: ext.toUpperCase(),
      fileName,
      isMedia: false,
      isAudio: false,
      isVideo: false,
      isLouvorJa: false,
      isNativeOpen: true,
    };
  }

  // 5. PDF
  if (ext === "pdf") {
    return {
      category: "pdf",
      icon: "mdi-file-pdf-box",
      color: "red",
      label: "Documento PDF",
      extension: "PDF",
      fileName,
      isMedia: false,
      isAudio: false,
      isVideo: false,
      isLouvorJa: false,
      isNativeOpen: true,
    };
  }

  // 6. Imagens
  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  if (imageExts.includes(ext)) {
    return {
      category: "image",
      icon: "mdi-image-outline",
      color: "teal",
      label: "Imagem",
      extension: ext.toUpperCase(),
      fileName,
      isMedia: false,
      isAudio: false,
      isVideo: false,
      isLouvorJa: false,
      isNativeOpen: true,
    };
  }

  // 7. Pasta / Diretório
  if (!ext || !fileName.includes(".")) {
    return {
      category: "folder",
      icon: "mdi-folder-outline",
      color: "amber-darken-2",
      label: "Pasta",
      extension: "PASTA",
      fileName,
      isMedia: false,
      isAudio: false,
      isVideo: false,
      isLouvorJa: false,
      isNativeOpen: true,
    };
  }

  // 8. Documentos gerais (Word, Excel, Texto, etc.)
  const docExts = ["doc", "docx", "txt", "rtf", "odt", "xls", "xlsx", "csv"];
  if (docExts.includes(ext)) {
    return {
      category: "document",
      icon: "mdi-file-document-outline",
      color: "blue-grey",
      label: "Documento",
      extension: ext.toUpperCase(),
      fileName,
      isMedia: false,
      isAudio: false,
      isVideo: false,
      isLouvorJa: false,
      isNativeOpen: true,
    };
  }

  // Genérico
  return {
    category: "file",
    icon: "mdi-file-outline",
    color: "blue-grey",
    label: "Arquivo",
    extension: ext.toUpperCase(),
    fileName,
    isMedia: false,
    isAudio: false,
    isVideo: false,
    isLouvorJa: false,
    isNativeOpen: true,
  };
}
