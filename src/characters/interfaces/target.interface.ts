import { TCardMetadata } from "~/type";

export interface ITarget {
  belong: "self" | "opponent";
  markAsCovered(isCovered: boolean): void;
  applyCardEffect(card: TCardMetadata): void;
  dragAreaRect: Phaser.GameObjects.Rectangle;
  getDragArea(): Phaser.Geom.Rectangle;
}
