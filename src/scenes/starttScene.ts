import Phaser from "phaser";
import FpsText from "../objects/fpsText";
// CODE FOR createSpeechBubbles() HEAVILY REFERENCED FROM HERE: https://github.com/phaserjs/examples/blob/master/public/src/game%20objects/text/speech%20bubble.js

export default class StartScene extends Phaser.Scene {
    fpsText: FpsText;
    // this will have a number corresponding to the speech bubble 'ID' and an object containing the speech bubble graphics to display
    bubbleData: object;

    constructor() {
        super({ key: "StartScene" });
    }

    create() {
        this.bubbleData = { bubbleNum: 0, showBubble: {} };
        // for input
        var spaceBar = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        console.log(
            Object.values(this.bubbleData)[0],
            Object.values(this.bubbleData)[1]
        );
        spaceBar?.on("down", () => {
            this.cycleDialogue(
                Object.values(this.bubbleData)[0],
                Object.values(this.bubbleData)[1]
            );
        });

        // Spawn in the background and CAT image
        this.add.image(400, 300, "desktopBG");
        this.add.image(1100, 600, "CAT");

        // FILES
        // currently do nothing, should be spaced 100 pixels apart
        this.add.image(100, 100, "locked program");
        this.add.image(200, 100, "locked text");
        this.add.image(100, 200, "unlocked text");

        // SPEECH
        // switch cases are used to determine which speech bubble to display/destory
        this.cycleDialogue(
            Object.values(this.bubbleData)[0],
            Object.values(this.bubbleData)[1]
        );
        console.log(
            Object.values(this.bubbleData)[0],
            Object.values(this.bubbleData)[1]
        );
    }
    // for controlling when speech bubbles spawn
    cycleDialogue(bubbleNum: number, showBubble: object) {
        console.log(bubbleNum);
        // if showBubble isn't empty, destroy the old speech bubble
        if (JSON.stringify(showBubble) != "{}") {
            console.log("not empty");
            Object.values(showBubble)[0].destroy();
            Object.values(showBubble)[1].destroy();
        }
        // switch cases for dialogue
        switch (bubbleNum) {
            case 0:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "woagh !!!! so silly"
                );
                console.log("LOOK HERE: ");
                console.log(showBubble);
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 1:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "nice space button press :3"
                );
                console.log("LOOK HERE: ");
                console.log(showBubble);
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
            case 2:
                showBubble = this.createSpeechBubble(
                    1060,
                    400,
                    200,
                    100,
                    "Where'd you get it? The space bar store ???"
                );
                // make the white bubble graphic visible
                Object.values(showBubble)[0].visible = true;
                // make the text object visible
                Object.values(showBubble)[1].visible = true;
                break;
        }
        bubbleNum = bubbleNum + 1;
        this.bubbleData = { bubbleNum, showBubble };
    }
    // for making the speech bubbles
    createSpeechBubble(
        x: number,
        y: number,
        width: number,
        height: number,
        quote: string
    ) {
        const bubbleWidth = width;
        const bubbleHeight = height;
        const bubblePadding = 10;
        const arrowHeight = bubbleHeight / 4;

        const bubble = this.add.graphics({ x: x, y: y });

        //  Bubble shadow
        bubble.fillStyle(0x222222, 0.5);
        bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

        //  Bubble color
        bubble.fillStyle(0xffffff, 1);

        //  Bubble outline line style
        bubble.lineStyle(4, 0x565656, 1);

        //  Bubble shape and outline
        bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
        bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

        //  Calculate arrow coordinates
        const point1X = Math.floor(bubbleWidth / 7);
        const point1Y = bubbleHeight;
        const point2X = Math.floor((bubbleWidth / 7) * 2);
        const point2Y = bubbleHeight;
        const point3X = Math.floor(bubbleWidth / 7);
        const point3Y = Math.floor(bubbleHeight + arrowHeight);

        //  Bubble arrow shadow
        bubble.lineStyle(4, 0x222222, 0.5);
        bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

        //  Bubble arrow fill
        bubble.fillTriangle(
            point1X,
            point1Y,
            point2X,
            point2Y,
            point3X,
            point3Y
        );
        bubble.lineStyle(2, 0x565656, 1);
        bubble.lineBetween(point2X, point2Y, point3X, point3Y);
        bubble.lineBetween(point1X, point1Y, point3X, point3Y);

        const content = this.add.text(0, 0, quote, {
            fontFamily: "Arial",
            fontSize: 20,
            color: "#000000",
            align: "center",
            wordWrap: { width: bubbleWidth - bubblePadding * 2 },
        });

        const b = content.getBounds();

        content.setPosition(
            bubble.x + bubbleWidth / 2 - b.width / 2,
            bubble.y + bubbleHeight / 2 - b.height / 2
        );

        content.visible = false;
        bubble.visible = false;
        return { bubble, content };
        // kill
        //content.destroy();
        //bubble.destroy();
    }

    update() {
        //this.fpsText.update();
        //this.input.keyboard?.on('keydown_ENTER', this.cycleDialogue(bubbleCounter), this)
        //this.input.keyboard.on('keydown_ENTER', this.cycleDialogue(1));
    }
}
