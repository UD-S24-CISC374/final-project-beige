import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        this.load.image("title", "assets/img/title.png");
        this.load.image("end", "assets/img/end.png");
        this.load.image("trueEnd", "assets/img/finale.png");
        this.load.image("desktopBG", "assets/img/xpbg.jpg");
        this.load.image("CAT", "assets/img/CAT shadeless-export big.png");
        this.load.image("deadCAT", "assets/img/dead CAT final ver.png");
        this.load.image("talkCAT", "assets/img/CAT talk.png");
        this.load.image("CATputer", "assets/img/CATputer.png");
        // desktop icon assets
        this.load.image("locked program", "assets/img/locked file.png");
        this.load.image("unlocked program", "assets/img/unlocked file.png");
        this.load.image("x", "assets/img/x.png");
        this.load.image("locked text", "assets/img/locked text file.png");
        this.load.image("r locked text", "assets/img/redlocktext.png");
        this.load.image("r locked program", "assets/img/redlockprogram.png");
        this.load.image("unlocked text", "assets/img/unlocked text file.png");
        this.load.image("article1", "assets/img/window.png");
        this.load.image("article2", "assets/img/window2.png");
        this.load.audio("lockedfile", "assets/sounds/hitnoise.mp3");
        this.load.audio("blip", "assets/sounds/blip.mp3");
        this.load.audio("pop", "assets/sounds/pop.mp3");
        this.load.audio("boom", "assets/sounds/boomupdated.mp3");
        this.load.audio("background", "assets/sounds/background.mp3");
    }

    create() {
        this.scene.start("TitleScene");
    }
}
