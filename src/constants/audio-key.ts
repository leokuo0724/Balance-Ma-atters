export const AUDIO_KEY = {
  BGM_1: "bgm-1",
  HIT: "hit",
};

export type TAudioKey = (typeof AUDIO_KEY)[keyof typeof AUDIO_KEY];
