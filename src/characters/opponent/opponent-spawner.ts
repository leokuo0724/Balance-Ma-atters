import { WikiManager } from "~/manager";

import { Opponent } from "./opponent";

export class OpponentSpawner extends Phaser.GameObjects.Container {
  public opponent: Opponent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
  }

  public spawnOpponent(id: string) {
    if (this.opponent) return;
    // TODO: Animation
    const wm = WikiManager.getInstance();
    const data = wm.queryOpponentData(id);
    this.opponent = new Opponent(this.scene, 0, 0, data);
    this.add(this.opponent);
  }
}
