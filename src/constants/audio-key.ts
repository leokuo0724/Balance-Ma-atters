export const AUDIO_KEY = {
  BGM_1: "bgm-1",
  BGM_2: "bgm-2",
  BGM_3: "bgm-3",
  HIT: "hit",
  CLICK: "click",
  MULTIPLY: "multiply",
  EQUIP: "equip",
  FIXING: "fixing",
  FAIL: "fail",
};

export type TAudioKey = (typeof AUDIO_KEY)[keyof typeof AUDIO_KEY];
