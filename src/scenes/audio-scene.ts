import { AUDIO_KEY, TAudioKey } from "~/constants";
import { SCENE_KEY } from "~/constants/scene-key";

export class AudioScene extends Phaser.Scene {
  private _bgm1!: Phaser.Sound.BaseSound;
  private _bgm2!: Phaser.Sound.BaseSound;
  private _bgm3!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: SCENE_KEY.AUDIO });
  }

  create() {
    this._bgm1 = this.sound.add(AUDIO_KEY.BGM_1, {
      loop: true,
    });
    this._bgm2 = this.sound.add(AUDIO_KEY.BGM_2, {
      loop: true,
    });
    this._bgm3 = this.sound.add(AUDIO_KEY.BGM_3, {
      loop: true,
    });
  }

  public setMute(isMute: boolean) {
    this.sound.setMute(isMute);
  }

  public playMainBgm() {
    this._bgm1.play();
  }

  public switchToBossBgm() {
    this._fadeOutBgm(this._bgm1, 300);
    this._bgm2.play();
  }

  public switchToVictoryBgm() {
    this._bgm1.stop();
    this._fadeOutBgm(this._bgm2, 300);
    this._bgm3.play();
  }

  private _fadeOutBgm(target: Phaser.Sound.BaseSound, duration = 1000) {
    if (!target.isPlaying) return;
    this.tweens.add({
      targets: target,
      volume: 0,
      duration,
      onComplete: () => target.stop(),
    });
  }

  public fadeOutMainBGM(duration = 1000) {
    this._fadeOutBgm(this._bgm1, duration);
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
