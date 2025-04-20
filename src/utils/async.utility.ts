export const tweensAsync = (
  scene: Phaser.Scene | null,
  config: Phaser.Types.Tweens.TweenBuilderConfig,
) => {
  return new Promise<void>((resolve) => {
    scene?.tweens.add({
      ...config,
      onComplete: () => {
        resolve();
      },
    });
  });
};

export const tweensCounterAsync = (
  scene: Phaser.Scene | null,
  config: Phaser.Types.Tweens.NumberTweenBuilderConfig,
) => {
  return new Promise<void>((resolve) => {
    scene?.tweens.addCounter({
      ...config,
      onComplete: () => {
        resolve();
      },
    });
  });
};

export const delayedCallAsync = (scene: Phaser.Scene | null, delay: number) => {
  return new Promise<void>((resolve) => {
    scene?.time.delayedCall(delay, () => {
      resolve();
    });
  });
};

export const playAnimAsync = (
  anims: Phaser.Animations.AnimationState | null,
  key: string,
) => {
  return new Promise<void>((resolve) => {
    anims?.play(key).once("animationcomplete", () => {
      resolve();
    });
  });
};
