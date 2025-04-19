import { ShieldGroup } from "~/ui/shield-group";

export interface IShield {
  shieldGroup: ShieldGroup;

  currentShield: number;
  updateShield(value: number): void;
}
