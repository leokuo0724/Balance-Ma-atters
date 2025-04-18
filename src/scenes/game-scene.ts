import { SCENE_KEY, SIZE } from "~/constants";
import { SmallLibraGroup } from "~/ui";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY.GAME });
  }

  create() {
    const MARGIN_Y = 18;
    const MARGIN_X = 12;
    const [libraSetWidth, libraSetHeight] = SIZE.SMALL_LIBRA_SET;
    new SmallLibraGroup(
      this,
      libraSetWidth / 2 + MARGIN_X,
      libraSetHeight / 2 + MARGIN_Y,
    );
  }
}
