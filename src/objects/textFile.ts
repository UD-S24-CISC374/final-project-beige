import Phaser from "phaser";
export default class TextFile extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, file: string, x: number, y: number) {
        super(scene, x, y, file, { color: "white", fontSize: "18px", wordWrap: { width: 280 }, fixedWidth: 300,
    fixedHeight: 300,backgroundColor: "black",align: 'left',
    padding: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
    },fontFamily: 'jetbrains-mono-normal',});
        scene.add.existing(this);
        this.setOrigin(0).setInteractive()
        .on("pointerdown", () => {
                this.destroy();
            });
    }
}
