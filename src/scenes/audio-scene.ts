import { AUDIO_KEY, TAudioKey } from "~/constants";
import { SCENE_KEY } from "~/constants/scene-key";

export class AudioScene extends Phaser.Scene {
  private _bgm1!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: SCENE_KEY.AUDIO });
  }

  create() {
    this._bgm1 = this.sound.add(AUDIO_KEY.BGM_1, {
      loop: true,
    });
  }

  public setMute(isMute: boolean) {
    this.sound.setMute(isMute);
  }

  public playMainBgm() {
    this._bgm1.play();
  }

  public fadeOutMainBGM(duration = 1000) {
    if (!this._bgm1.isPlaying) return;
    this.tweens.add({
      targets: this._bgm1,
      volume: 0,
      duration,
      onComplete: () => this._bgm1.stop(),
    });
  }

  public playSFX(key: TAudioKey, config?: Phaser.Types.Sound.SoundConfig) {
    this.sound.play(key, config);
  }
  public createAndPlaySFX(
    key: TAudioKey,
    config?: Phaser.Types.Sound.SoundConfig,
  ) {
    return this.sound.add(key, config).play();
  }
}
