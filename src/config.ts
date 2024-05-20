import Phaser from "phaser";
import MainScene from "./scenes/mainScene";
import PreloadScene from "./scenes/preloadScene";
// added scenes
import StartScene from "./scenes/starttScene";
import TitleScene from "./scenes/titleScene";
import EndScene from "./scenes/endScene";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

export const CONFIG = {
    title: "Terminal 0",
    version: "0.0.1",
    type: Phaser.AUTO,
    backgroundColor: "#ffffff",
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    parent: "phaser-game",
    dom: {
        createContainer: true,
    },
    scene: [PreloadScene, MainScene, StartScene, TitleScene, EndScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { x: 0, y: 300 },
        },
    },
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false,
    },
    render: {
        pixelArt: false,
        antialias: true,
    },
};
