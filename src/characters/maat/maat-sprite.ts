import { ATLAS_KEY } from "~/constants";
import { generateFramesFromAtlas, playAnimAsync } from "~/utils";

export class MaatSprite extends Phaser.GameObjects.Sprite {
  private readonly ANIM_KEY = {
    IDLE: "maat-idle",
    PLAY_CARD: "maat-play-card",
    LIBRA_STRIKE: "maat-libra-strike",
  };
  private readonly _prefix = "maat-sprite_";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ATLAS_KEY.MAAT_SPRITE);
    scene.add.existing(this);
    this.setOrigin(0.5, 1);
    this._createAnim();

    this.playIdle();
  }

  private _createAnim() {
    this.anims.create({
      key: this.ANIM_KEY.IDLE,
      frames: generateFramesFromAtlas(
        this.anims,
        ATLAS_KEY.MAAT_SPRITE,
        this._prefix,
        0,
        14,
      ),
      repeat: -1,
      frameRate: 8,
    });
    this.anims.create({
      key: this.ANIM_KEY.PLAY_CARD,
      frames: generateFramesFromAtlas(
        this.anims,
        ATLAS_KEY.MAAT_SPRITE,
        this._prefix,
        14,
        28,
      ),
      frameRate: 35,
    });
    this.anims.create({
      key: this.ANIM_KEY.LIBRA_STRIKE,
      frames: generateFramesFromAtlas(
        this.anims,
        ATLAS_KEY.MAAT_SPRITE,
        this._prefix,
        28,
        58,
      ),
      frameRate: 30,
    });
  }

  public playIdle() {
    this.anims.play(this.ANIM_KEY.IDLE);
  }
  public async playPlayCard() {
    await playAnimAsync(this.anims, this.ANIM_KEY.PLAY_CARD);
    this.playIdle();
  }
  public async playLibraStrike() {
    await playAnimAsync(this.anims, this.ANIM_KEY.LIBRA_STRIKE);
    this.playIdle();
  }
}
