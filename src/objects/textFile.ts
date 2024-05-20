import Phaser from "phaser";
export default class TextFile {
    text: Phaser.GameObjects.Text;
    button: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, file: string, x: number, y: number) {
        this.text = new Phaser.GameObjects.Text(scene, x, y, file, {
            color: "white",
            fontSize: "18px",
            wordWrap: { width: 280 },
            fixedWidth: 300,
            fixedHeight: 300,
            backgroundColor: "black",
            align: "left",
            padding: {
                left: 5,
                right: 5,
                top: 5,
                bottom: 5,
            },
            fontFamily: "jetbrains-mono-normal",
        });
        this.button = new Phaser.GameObjects.Image(scene, x + 258, y, "x");
        scene.add.existing(this.text).setInteractive({ draggable: true });
        scene.add.existing(this.button);
        this.button
            .setOrigin(0)
            .setInteractive()
            .on("pointerdown", () => {
                this.text.destroy();
                this.button.destroy();
            });
        this.text.on(
            "drag",
            (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.text.x = dragX;
                this.text.y = dragY;
                this.button.x = this.text.x + 258;
                this.button.y = this.text.y;
            },
        );
        this.text.on("pointerdown", () => {
            this.text.depth = 1;
            this.button.depth = 1;
        });

        this.text.on("pointerup", () => {
            this.text.depth = 0;
            this.button.depth = 0;
        });
    }
}
