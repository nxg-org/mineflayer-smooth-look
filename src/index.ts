import { Bot } from "mineflayer";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import { SmoothLook } from "./smoothLook";

declare module "mineflayer" {
    interface Bot {
        smoothLook: SmoothLook;
    }
}


export function loader(bot: Bot) {
    bot.smoothLook = new SmoothLook(bot);
    bot.on("physicsTick", () => {
        TWEEN.update()
    })
}