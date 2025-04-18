export const COLOR_KEY = {
  BEIGE_2: "#eae3da",
  BEIGE_3: "#e0d6c8",
  BEIGE_4: "#c4b1a6",

  BROWN_8: "#604536",
  BROWN_9: "#442d26",
} as const;

export type TColorKey = (typeof COLOR_KEY)[keyof typeof COLOR_KEY];
