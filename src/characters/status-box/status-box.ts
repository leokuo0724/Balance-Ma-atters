import { SIZE } from "~/constants";
import { EStatusType } from "~/type";

import { StatusTag } from "./status-tag";

export class StatusBox extends Phaser.GameObjects.Container {
  private _storedTag: StatusTag[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this.addStatus(EStatusType.VENOM, 1);
  }

  public addStatus(type: EStatusType, value: number) {
    const START_X = SIZE.STATUS_TAG[0] / 2;

    // find existing
    const existingTag = this._storedTag.find((tag) => tag._statusType === type);
    if (existingTag) {
      existingTag.addValue(value);
    } else {
      const currentLength = this._storedTag.length;
      const SPACING = 4;
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

  public clear() {}
}
