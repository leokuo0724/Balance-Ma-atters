import { EBalanceType } from "./balance.type";
import { TEffect } from "./effect.type";

export type TCardMetadata = {
  id: string;
  damage: number | null;
  shield: number;
  title: string;
  description: string;
  balances: TCardBalance[];
  effects: TEffect[];
  target: ETarget;
};

export type TCardBalance = {
  type: EBalanceType;
  value: number;
};

export enum ETarget {
  SELF = "self",
  SINGLE_OPPONENT = "ops",
}
