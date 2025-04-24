import { SIZE } from "~/constants";
import { EStatusType } from "~/type";

import { IStatus } from "../interfaces";
import { StatusTag } from "./status-tag";

const SPACING = 4;
const START_X = SIZE.STATUS_TAG[0] / 2;

export class StatusBox extends Phaser.GameObjects.Container {
  private _storedTag: (StatusTag | null)[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
  }

  public addStatus(type: EStatusType, value: number) {
    // TODO: visual effect
    // find existing
    const existingTag = this._storedTag.find((tag) => tag?.statusType === type);
    if (existingTag) {
      existingTag.addValue(value);
    } else {
      const currentLength = this._storedTag.length;
      const tag = new StatusTag(
        this.scene,
        START_X + 2 * START_X * currentLength + SPACING,
        0,
        type,
        value,
      );
      this.add(tag);
      this._storedTag.push(tag);
    }
  }

  public async executeEndTurnStatus() {
    const endTurnStatuses: EStatusType[] = [EStatusType.VENOM];
    for (const tag of this._storedTag) {
      if (!tag) continue;
      const { statusType, value } = tag;
      const isEndTurnType = endTurnStatuses.includes(statusType);
      if (!isEndTurnType) continue;
      switch (statusType) {
        case EStatusType.VENOM: {
          const character = this.parentContainer as unknown as IStatus;
          await character.takeStatusEffect(statusType, value);
          tag.addValue(-1);
          break;
        }
        default:
          break;
      }
    }
    this.rerender();
  }

  /** check 0, and rearrange */
  private rerender() {
    for (let i = 0; i < this._storedTag.length; i++) {
      const tag = this._storedTag[i];
      if (tag && tag.value <= 0) {
        tag.destroy();
        this._storedTag[i] = null;
      }
    }
    this._storedTag = this._storedTag.filter(Boolean);
    this._storedTag.forEach((tag, index) => {
      tag?.setX(START_X + 2 * START_X * index + SPACING);
    });
  }

  public clear() {
    this._storedTag.forEach((tag) => tag && tag.destroy());
    this._storedTag = [];
  }
}
