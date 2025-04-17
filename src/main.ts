import Phaser from "phaser";
import "~/style.css";

import { PreloadScene } from "./scenes";

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: "game-container",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene],
};

export default new Phaser.Game(config);
