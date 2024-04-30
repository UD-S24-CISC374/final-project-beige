type CatFSDirContents = { files: string[], dirs: string[], zips: string[] };

export class CatFS {
    #files: { [path: string]: string } = {};
    #cwd: string;

    constructor(files: { [path: string]: string }, initialPath: string = "") {
        this.#cwd = "/";
        this.#cwd = this.#makePathAbsolute(initialPath);

        for (const [path, contents] of Object.entries(files)) {
            this.#files[this.#makePathAbsolute(path)] = contents;
        }
    }

    get cwd(): string {
        return this.#cwd;
    }

    set cwd(path: string) {
        console.log(`setting path to ${path}`);
        path = this.#makePathAbsolute(path);
        console.log(`setting path to ${path}`);
        if (this.exists(path)) {
            console.log(`setting path to ${path}`);
            this.#cwd = path;
        }
    }

    #makePathAbsolute(path: string): string {
        // Base cases
        if (path === "" || path === ".") {
            return this.cwd;
        }
        if (path === "/") {
            return path;
        }

        // Make all paths absolute
        if (!path.startsWith('/')) {
            path = (this.cwd === "/" ? this.cwd : this.cwd + "/") + path;
        }

        // Handle . directories
        path.replaceAll("./", "");

        // Handle .. directories
        const pathSplit = path.substring(1).split("/");
        const finalPath: string[] = [];
        for (const pathPart of pathSplit) {
            if (pathPart === ".." && finalPath.length > 0) {
                finalPath.pop();
            } else {
                finalPath.push(pathPart);
            }
        }

        // Create final path
        path = finalPath.join('/');
        if (path.endsWith('/')) {
            path = path.substring(0, path.length - 1);
        }
        path = "/" + path;
        return path;
    }

    exists(path: string): boolean {
        path = this.#makePathAbsolute(path);

        // Base cases
        if (path === "" || path === "/") {
            return true;
        }

        // Check for a file
        if (path in this.#files) {
            return true;
        }

        // Check for a directory
        for (const filepath of Object.keys(this.#files)) {
            if (filepath.length > path.length && filepath.startsWith(path) && filepath.at(path.length) === "/") {
                console.log("yep ");
                return true;
            }
        }

        // Doesn't exist
        return false;
    }

    readFile(path: string, cleanHTML: boolean = false): string {
        path = this.#makePathAbsolute(path);
        if (path in this.#files) {
            const contents = this.#files[path];
            if (!cleanHTML) {
                return contents;
            }
            return contents
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
        }
        return "";
    }

    readCWD(): CatFSDirContents {
        return this.readDir(".");
    }

    readDir(path: string): CatFSDirContents {
        path = this.#makePathAbsolute(path);
        const out: CatFSDirContents = {
            files: [],
            dirs: [],
            zips: [],
        }
        const processPath = (filepath: string) => {
            if (filepath.includes("/")) {
                filepath = filepath.substring(0, filepath.indexOf("/"));
                if (!out.dirs.includes(filepath)) {
                    out.dirs.push(filepath);
                }
            } else {
                if (!out.files.includes(filepath)) {
                    out.files.push(filepath);
                }
            }
        };
        if (path === "/") {
            for (const filepath of Object.keys(this.#files)) {
                processPath(filepath.substring(1));
            }
        } else {
            for (let filepath of Object.keys(this.#files)) {
                if (filepath.length > path.length && filepath.startsWith(path) && filepath.at(path.length) === "/") {
                    filepath = filepath.substring(path.length + 1);
                    processPath(filepath);
                }
            }
        }
        return out;
    }
}

export const CATFS = new CatFS({
    "/instructions.txt": `Let's learn some commands!

echo TEXT: Have the terminal 'say' the TEXT that you enter.
        Ex: "echo haha" would make the terminal say "haha"

cd DIRECTORY: Navigate to a new DIRECTORY with new files!

cat FILE: Read a FILE that you choose in the terminal!

ls: Lists everything in your current directory!`,

    "/logs/log4-15-2024.txt": `wizard56: Can we really do this? That's awesome!
lizard58: Of course we can, we'll just need a name.
lizard58: There's no way we can get caught.
wizard56: But we need justice for our friend.
lizard58: Exactly. I've got just the name for us.
wizard56: Wait hold on who let you pick the name?
lizard58: Me, I'm literally the guy who has coding experience here dummy!!
wizard56: Man I wanna pick the name, Im great at naming things.
lizard58: No way am I letting you name our alias.
lizard58: You'll name us a number or something stupid.`,

    "/logs/baller.txt": `It's time to learn some BALLER techniques.

You ever feel trapped in a directory? With no way to get out?
Well boy do I have a command for you!
INTRODUCING "cd .." This will change your directory to the one you were in previously! Incredible!

You ever encounter a directory that ends in .zip? With no way to open it?
Well girl do I have a command for you!
INTRODUCING "unzip DIRECTORY.zip" This will unzip that directory so you can get to explorin it!`,

    "/logs/dir2.zip/rm.txt": `wizard56: Duuuuuuuuuuuuuuuude I accidentally made a virus.
lizard58: HOW DO YOU JUST *MAKE* A VIRUS???
wizard56: Idk dude but I need to remove it STAT.
lizard58: Ohhhhhhhhh boy ok. Use the rm command.
wizard56: rm? That stand for remove?
lizard58: YES YOU TYPE IN rm AND THEN WHAT YOU WANT TO REMOVE
wizard56: So like "rm virus"?
lizard58: IF YOU ACTUALLY NAMED YOUR VIRUS virus THEN YES. YES.
wizard56: Thank you :)
lizard58: I'm going to rm you in a second.`,

    "/logs/dir2.zip/log4-20-2024.txt": `lizard58: Alright it's done!
wizard56: YES! THEY'LL NEVER KNOW WHO HIT EM!
lizard58: The articles will be CRAZY after this one.
lizard58: We should lock them up in case our logs get out.
wizard56: Ooh ooh! Ok I'll make a program that can lock it!
lizard58: Ok I'll leave it to you, we just have to hope no one gets rid of it.
wizard56: Nah that would never happen, we're too cool.
lizard58: Soon we'll have justice :)
wizard56: <:D`,
});
