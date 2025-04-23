export const COLOR_KEY = {
  BEIGE_2: "#eae3da",
  BEIGE_3: "#e0d6c8",
  BEIGE_4: "#c4b1a6",

  BROWN_3: "#9c8973",
  BROWN_4: "#937e69",
  BROWN_8: "#604536",
  BROWN_9: "#442d26",

  RED_6: "#ca6059",
  RED_8: "#994031",
  ORANGE_6: "#c16527",
  YELLOW_5: "#ffb760",
  YELLOW_6: "#e78e4f",
  GREEN_6: "#6a986a",
  BLUE_6: "#505b79",
} as const;

export type TColorKey = (typeof COLOR_KEY)[keyof typeof COLOR_KEY];
