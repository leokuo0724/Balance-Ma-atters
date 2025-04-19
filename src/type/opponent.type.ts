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

export enum EOpponentAction {
  DAMAGE = "damage",
  SHIELD = "shield",
  HEAL = "heal",
  RANDOM_BALANCE = "random_balance",
  SUMMON = "summon",
  VENOM = "venom",
}
