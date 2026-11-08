// khpi-brand 0.1.0. Згенеровано з tokens/ (npm run build). Не редагувати вручну.
// Типізовані константи для Remotion (і будь-якого TS-коду). Числа в px і ms; кадри — через msToFrames.
export const colors = {
  "light": {
    "brandSolid": "#A0001B",
    "onBrand": "#FFFFFF",
    "accentYellow": "#FBBA00",
    "accentBlue": "#3EB1C8",
    "data": {
      "1": "#A0001B",
      "2": "#3EB1C8",
      "3": "#FBBA00",
      "4": "#5F5F5F"
    },
    "onAccent": "#2A2A2A",
    "surface": "#FFFFFF",
    "surfaceRaised": "#F7F7F7",
    "ink": "#2A2A2A",
    "inkMuted": "#5F5F5F",
    "border": "#E5E5E5",
    "borderStrong": "#7F7F7F",
    "brand": "#A0001B",
    "brandSubtle": "#F7EBED",
    "accentBlueText": "#1D7F93"
  },
  "dark": {
    "brandSolid": "#A0001B",
    "onBrand": "#FFFFFF",
    "accentYellow": "#FBBA00",
    "accentBlue": "#3EB1C8",
    "data": {
      "1": "#D999A4",
      "2": "#3EB1C8",
      "3": "#FBBA00",
      "4": "#AAAAAA"
    },
    "onAccent": "#2A2A2A",
    "surface": "#2A2A2A",
    "surfaceRaised": "#333333",
    "ink": "#ECECEC",
    "inkMuted": "#AAAAAA",
    "border": "#4A4A4A",
    "borderStrong": "#7F7F7F",
    "brand": "#D999A4",
    "brandSubtle": "#3D2A2D",
    "accentBlueText": "#6EC4D6"
  }
} as const;

export const palette = {
  "white": "#FFFFFF",
  "brand": {
    "40": "#D999A4",
    "60": "#C66676",
    "75": "#B84054",
    "100": "#A0001B"
  },
  "yellow": {
    "40": "#FDE399",
    "60": "#FDD666",
    "75": "#FCCB40",
    "100": "#FBBA00"
  },
  "blue": {
    "40": "#B2E0E9",
    "60": "#8BD0DE",
    "75": "#6EC4D6",
    "100": "#3EB1C8"
  },
  "graphite": {
    "40": "#AAAAAA",
    "60": "#7F7F7F",
    "75": "#5F5F5F",
    "100": "#2A2A2A"
  }
} as const;

export const fonts = {
  sans: "'Fira Sans', 'Helvetica Neue', Arial, sans-serif",
  doc: "'Times New Roman', Times, serif",
  soft: "Cambria, Georgia, serif",
  weight: { regular: 400, semibold: 600 },
} as const;

export const space = {"4":4,"8":8,"16":16,"24":24,"32":32,"48":48,"64":64} as const;
export const radius = {"0":0,"2":2,"4":4,"full":9999} as const;

/** Контексти: Remotion використовує video; slide — для Reveal-подібних композицій. */
export const contexts = {
  "doc": {
    "type": {
      "family": "'Fira Sans', 'Helvetica Neue', Arial, sans-serif",
      "title": {
        "size": 24,
        "lineHeight": 32,
        "weight": 600
      },
      "body": {
        "size": 17,
        "lineHeight": 28,
        "weight": 400
      },
      "label": {
        "size": 14,
        "lineHeight": 20,
        "weight": 600
      },
      "minSize": 14
    },
    "layout": {
      "gap": 16,
      "measure": 70
    }
  },
  "slide": {
    "type": {
      "family": "'Fira Sans', 'Helvetica Neue', Arial, sans-serif",
      "title": {
        "size": 64,
        "lineHeight": 72,
        "weight": 600
      },
      "body": {
        "size": 36,
        "lineHeight": 48,
        "weight": 400
      },
      "label": {
        "size": 28,
        "lineHeight": 36,
        "weight": 600
      },
      "minSize": 28
    },
    "layout": {
      "gap": 32,
      "margin": 80
    }
  },
  "video": {
    "type": {
      "family": "'Fira Sans', 'Helvetica Neue', Arial, sans-serif",
      "title": {
        "size": 72,
        "lineHeight": 80,
        "weight": 600
      },
      "body": {
        "size": 44,
        "lineHeight": 56,
        "weight": 400
      },
      "label": {
        "size": 36,
        "lineHeight": 44,
        "weight": 600
      },
      "minSize": 36
    },
    "layout": {
      "gap": 48,
      "safeMargin": 96,
      "safeBottomRatio": 0.2
    }
  },
  "print": {
    "type": {
      "family": "'Times New Roman', Times, serif",
      "body": {
        "size": "14pt"
      },
      "minSize": "14pt"
    }
  }
} as const;
export const video = contexts.video;

export const motion = {
  durationMs: {"fast":150,"base":300,"slow":600,"stagger":80,"block":2400},
  easing: {"standard":[0.2,0,0,1],"enter":[0,0,0.2,1],"exit":[0.4,0,1,1]},
  shiftMaxPx: 12,
} as const;

export const msToFrames = (ms: number, fps: number): number => Math.round((ms * fps) / 1000);

/** Безпечна зона відео 1920×1080: поля 96 + 20 % висоти знизу під субтитри. */
export const videoSafeArea = {
  left: 96,
  right: 96,
  top: 96,
  bottom: 312,
} as const;

export type Theme = keyof typeof colors;
