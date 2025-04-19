export enum EEffect {
  QUICKSAND = "quicksand",
  FIRING = "firing",
  ABSORB = "absorb",
  RIGHT_LIBRA_ATTACK = "right_libra_attack",
  LEFT_LIBRA_ATTACK = "left_libra_attack",
  COUNTER_ATTACK = "counter_attack",
  COUNTER_QUICKSAND = "counter_quicksand",
  COUNTER_FIRING = "counter_firing",
  SHIELD_ATTACK = "shield_attack",
  DODGE = "dodge",
  WEAKEN = "weaken",
  NEXT_CRITICAL = "next_critical",
  PURIFY = "purify",
  CRITICAL_UP = "critical_up",
  BLIND = "blind",
}

export type TEffect = {
  type: EEffect;
  value: number;
};
