import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";
import { ATLAS_KEY, DEPTH } from "~/constants";
import { generateFramesFromAtlas, playAnimAsync } from "~/utils";

export class Damaged extends Phaser.GameObjects.Sprite {
  public ANIM_KEY = "damaged";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ATLAS_KEY.DAMAGED);
    scene.add.existing(this);
    this.setDepth(DEPTH.EFFECT);
    this._createAnim();
  }

  private _createAnim() {
    this.anims.create({
      key: this.ANIM_KEY,
      frames: generateFramesFromAtlas(
        this.anims,
        ATLAS_KEY.DAMAGED,
        "damaged_",
        0,
        4,
      ),
      repeat: 0,
      frameRate: 24,
    });
  }

  public async playAndFadeOut() {
    await playAnimAsync(this.anims, this.ANIM_KEY);
    FadeOutDestroy(this, 1000);
  }
}
