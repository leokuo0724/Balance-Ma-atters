import { EStatusType } from "~/type";

import { StatusBox } from "../status-box";

export interface IStatus {
  statusBox: StatusBox;
  addStatus(type: EStatusType, value: number): void;
  executeEndTurnStatus(): Promise<void>;
  takeStatusEffect(type: EStatusType, value: number): Promise<void>;
}
