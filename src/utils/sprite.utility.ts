export function generateFramesFromAtlas(
  anims: Phaser.Animations.AnimationState,
  textureKey: string,
  prefix: string,
  start: number,
  end: number,
) {
  return anims.generateFrameNames(textureKey, {
    prefix,
    suffix: ".png",
    start,
    end,
    zeroPad: 5,
  });
}
