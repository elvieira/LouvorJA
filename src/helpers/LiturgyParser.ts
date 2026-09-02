export function parseClassicLiturgy(iniContent: string): Record<string, Record<string, unknown>[]> {
  const lines = iniContent.split(/\r?\n/);
  const sections: Record<string, Record<string, string>> = {};
  let currentSection = "";

  // 1. Parse INI to sections and keys
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";")) continue;

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      currentSection = trimmed.substring(1, trimmed.length - 1);
      if (!sections[currentSection]) {
        sections[currentSection] = {};
      }
    } else {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1 && currentSection) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        sections[currentSection][key] = value;
      }
    }
  }

  // 2. Map classic days to our days
  const dayMap: Record<string, string> = {
    Domingo: "sunday",
    Segunda: "monday",
    Terca: "tuesday",
    Quarta: "wednesday",
    Quinta: "thursday",
    Sexta: "friday",
    Sabado: "saturday",
  };

  const liturgies: Record<string, Record<string, unknown>[]> = {
    sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [],
  };

  const geral = sections["Geral"];
  if (!geral) return liturgies;

  // 3. Reconstruct items for each day
  for (const [classicDay, newDay] of Object.entries(dayMap)) {
    const itemIds = geral[classicDay] ? geral[classicDay].split(";").filter(id => id.trim() !== "") : [];
    
    for (const id of itemIds) {
      const itemData = sections[id];
      if (!itemData) continue;

      const classicType = (itemData.tipo || "").toLowerCase();
      let newType = "annotation";
      
      switch (classicType) {
        case "musica":
          newType = "music";
          break;
        case "arquivo": {
          const filePath = itemData.dir || itemData.param1 || "";
          const ext = filePath.split(".").pop()?.toLowerCase() || "";
          const isMedia = ["mp4", "mkv", "avi", "mov", "wmv", "webm", "mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(ext);
          newType = (itemData.subtipo === "midia" || isMedia) ? "media" : "file";
          break;
        }
        case "midia":
        case "media":
          newType = "media";
          break;
        case "versiculo":
        case "verse":
          newType = "verse";
          break;
        case "site":
        case "link":
          newType = "link";
          break;
        case "itensagendados":
        case "scheduled_item":
          newType = "scheduled_item";
          break;
        case "categoria":
        case "category":
          newType = "category";
          break;
        case "anotacao":
        case "annotation":
        default:
          newType = "annotation";
          break;
      }

      let defaultName = "";
      switch (newType) {
        case "annotation": defaultName = "Anotação"; break;
        case "music": defaultName = "Música"; break;
        case "media": defaultName = "Mídia"; break;
        case "file": defaultName = "Arquivo/Diretório"; break;
        case "category": defaultName = "Categoria"; break;
        case "verse": defaultName = "Versículo"; break;
        case "link": defaultName = "Link"; break;
        case "scheduled_item": defaultName = "Item Agendado"; break;
      }

      const rawName = itemData.item || itemData.subitem || "";
      const subtitle = itemData.subitem || "";

      const newItem: Record<string, unknown> = {
        id: Date.now() + Math.random(),
        type: newType,
        name: rawName || defaultName,
        subtitle,
        color: convertClassicColor(itemData.cor),
        done: false,
      };

      if (newType === "music") {
        const mId = itemData.musica || itemData.param1;
        if (mId && mId !== "-1") {
          newItem.musicId = isNaN(Number(mId)) ? mId : Number(mId);
        } else {
          newItem.musicId = null;
        }
        newItem.musicMode = itemData.subtipo || "audio";
      } else if (newType === "file" || newType === "media") {
        newItem.filePath = itemData.dir || itemData.param1 || "";
      } else if (newType === "verse") {
        newItem.verseBookId = itemData.livro ? Number(itemData.livro) : null;
        newItem.verseChapter = itemData.capitulo ? Number(itemData.capitulo) : null;
        newItem.verseNumbers = itemData.versos || "";
      } else if (newType === "link") {
        newItem.url = itemData.url || itemData.param1 || "";
      } else if (newType === "scheduled_item") {
        newItem.categoryId = itemData.id || itemData.param1 || "";
      }

      liturgies[newDay].push(newItem);
    }
  }

  return liturgies;
}

export function generateClassicLiturgy(liturgies: Record<string, Record<string, unknown>[]>): string {
  const dayMap: Record<string, string> = {
    sunday: "Domingo",
    monday: "Segunda",
    tuesday: "Terca",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sabado",
  };

  let ini = "[Geral]\r\n";
  const sectionsToAppend: string[] = [];

  for (const [newDay, classicDay] of Object.entries(dayMap)) {
    const items = liturgies[newDay] || [];
    const itemIds: string[] = [];

    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      let id = item.id !== undefined && item.id !== null ? String(item.id) : "";
      if (!id.startsWith("item_")) {
        const now = new Date();
        const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
        id = `item_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}${rand}`;
      }
      
      itemIds.push(id);

      let classicType = "anotacao";
      const itemType = item.type !== undefined && item.type !== null ? String(item.type) : "";
      switch (itemType) {
        case "music": classicType = "musica"; break;
        case "file": classicType = "arquivo"; break;
        case "media": classicType = "midia"; break;
        case "verse": classicType = "versiculo"; break;
        case "link": classicType = "site"; break;
        case "scheduled_item": classicType = "itensagendados"; break;
        case "category": classicType = "categoria"; break;
        case "annotation":
        default:
          classicType = "anotacao";
          break;
      }

      const itemName = item.name !== undefined && item.name !== null ? String(item.name) : (item.title !== undefined && item.title !== null ? String(item.title) : "");
      const itemSubtitle = item.subtitle !== undefined && item.subtitle !== null ? String(item.subtitle) : "";

      let section = `\r\n[${id}]\r\n`;
      section += `tipo=${classicType}\r\n`;
      section += `item=${itemName}\r\n`;
      if (itemSubtitle) section += `subitem=${itemSubtitle}\r\n`;
      section += `cor=${convertNewColor(item.color !== undefined && item.color !== null ? String(item.color) : undefined)}\r\n`;

      if (itemType === "music") {
        section += `musica=${item.musicId !== undefined && item.musicId !== null ? String(item.musicId) : "-1"}\r\n`;
        if (item.musicMode) section += `subtipo=${String(item.musicMode)}\r\n`;
      } else if (itemType === "file") {
        if (item.filePath) section += `dir=${String(item.filePath)}\r\n`;
      } else if (itemType === "media") {
        if (item.filePath) section += `dir=${String(item.filePath)}\r\n`;
        section += "subtipo=midia\r\n";
      } else if (itemType === "verse") {
        if (item.verseBookId) section += `livro=${String(item.verseBookId)}\r\n`;
        if (item.verseChapter) section += `capitulo=${String(item.verseChapter)}\r\n`;
        if (item.verseNumbers) section += `versos=${String(item.verseNumbers)}\r\n`;
      } else if (itemType === "link") {
        if (item.url) section += `url=${String(item.url)}\r\n`;
      } else if (itemType === "scheduled_item") {
        if (item.categoryId) section += `id=${String(item.categoryId)}\r\n`;
      }
      
      sectionsToAppend.push(section);
    }

    ini += `${classicDay}=${itemIds.join(";")}${itemIds.length > 0 ? ";" : ""}\r\n`;
  }

  for (const sec of sectionsToAppend) {
    ini += sec;
  }

  return ini;
}

function convertClassicColor(color: unknown): string {
  if (!color || typeof color !== "string") return "#FFFFFF";
  const c = color.toLowerCase();
  const map: Record<string, string> = {
    clwhite: "#FFFFFF",
    clblack: "#000000",
    clred: "#FF0000",
    clblue: "#0000FF",
    clgreen: "#008000",
    clyellow: "#FFFF00",
    clmaroon: "#800000",
    clnavy: "#000080",
    clpurple: "#800080",
    clteal: "#008080",
    clgray: "#808080",
    clsilver: "#C0C0C0",
    cllime: "#00FF00",
    clolive: "#808000",
    clfuchsia: "#FF00FF",
    claqua: "#00FFFF",
  };
  return map[c] || "#FFFFFF";
}

function convertNewColor(color: unknown): string {
  if (!color || typeof color !== "string") return "clWhite";
  const c = color.toUpperCase();
  const map: Record<string, string> = {
    "#FFFFFF": "clWhite",
    "#000000": "clBlack",
    "#FF0000": "clRed",
    "#0000FF": "clBlue",
    "#008000": "clGreen",
    "#FFFF00": "clYellow",
    "#800000": "clMaroon",
    "#000080": "clNavy",
    "#800080": "clPurple",
    "#008080": "clTeal",
    "#808080": "clGray",
    "#C0C0C0": "clSilver",
    "#00FF00": "clLime",
    "#808000": "clOlive",
    "#FF00FF": "clFuchsia",
    "#00FFFF": "clAqua",
  };
  return map[c] || "clWhite";
}
