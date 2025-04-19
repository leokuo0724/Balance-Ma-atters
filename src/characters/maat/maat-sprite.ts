export class MaatSprite extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "maat-test");
    scene.add.existing(this);
    this.setOrigin(0.5, 1);
  }
}
