import Phaser from "phaser";
import FadePlugin from "phaser3-rex-plugins/plugins/fade-plugin.js";
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
  plugins: {
    global: [{ key: "rexFade", plugin: FadePlugin, start: true }],
  },
};

export default new Phaser.Game(config);
