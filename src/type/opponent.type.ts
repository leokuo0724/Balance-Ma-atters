export type TOpponentMetadata = {
  id: string;
  name: string;
  blood: number;
  moves: (TOpponentMove | null)[];
};

export type TOpponentMove = {
  action: EOpponentAction;
  value: number;
};

export type TOpponentMovable = {
  action: EOpponentActionable;
  value: number;
};

/** predefined */
export enum EOpponentAction {
  ATTACK = "damage",
  SHIELD = "shield",
  HEAL = "heal",
  RANDOM_BALANCE = "random_balance",
  SUMMON = "summon",
  VENOM = "venom",
}

export enum EOpponentActionable {
  ATTACK = "attack",
  SHIELD = "shield",
  HEAL = "heal",
  SUMMON = "summon",
  VENOM = "venom",
  INTERRUPT_PHY = "interrupt_phy",
  INTERRUPT_MAG = "interrupt_mag",
  INTERRUPT_DEF = "interrupt_def",
  INTERRUPT_ATK = "interrupt_atk",
  INTERRUPT_SHT = "interrupt_sht",
  INTERRUPT_LNG = "interrupt_lng",
  INTERRUPT_DUT = "interrupt_dut",
  INTERRUPT_FIR = "interrupt_fir",
}
