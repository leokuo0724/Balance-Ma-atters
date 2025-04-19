import { COLOR_KEY, EVENT_KEY, FONT_KEY, TEXTURE_KEY } from "~/constants";

export class RestCardGroup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add.image(0, 0, TEXTURE_KEY.REST_CARD_BG);
    const restLabel = scene.add
      .text(0, -18, "Rest", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 20,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    const valueLabel = scene.add
      .text(0, 8, "0", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 42,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    this.add([bg, restLabel, valueLabel]);

    this.scene.events.on(
      EVENT_KEY.ON_AVAILABLE_CARDS_UPDATED,
      ({ count }: { count: number }) => {
        valueLabel.setText(count.toString());
      },
    );
  }
}
