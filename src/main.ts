import Phaser from "phaser";
import "~/style.css";

import { COLOR_KEY } from "./constants";
import { BootScene, GameScene, PreloadScene } from "./scenes";

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  parent: "game-container",
  backgroundColor: COLOR_KEY.BEIGE_3,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, GameScene],
};

export default new Phaser.Game(config);
