import { BloodBar } from "~/ui";

export interface IBlood {
  bloodBar: BloodBar;
  totalBlood: number;
  currentBlood: number;
  updateBloodBar(from: number, to: number, total: number): void;
}
