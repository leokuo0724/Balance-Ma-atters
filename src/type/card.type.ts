import { EBalanceType } from "./balance.type";

export type TCardMetadata = {
  damage: number | null;
  shield: number;
  title: string;
  description: string;
  balances: TCardBalance[];
  // TODO: effect
};

export type TCardBalance = {
  type: EBalanceType;
  value: number;
};
