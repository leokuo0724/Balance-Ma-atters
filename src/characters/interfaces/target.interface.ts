import { TCardMetadata } from "~/type";

import { StatusBox } from "../status-box";

export interface ITarget {
  belong: "self" | "opponent";
  markAsCovered(isCovered: boolean): void;
  applyCardEffect(card: TCardMetadata): void;

  statusBox: StatusBox;
}
