import { Bot } from "mineflayer";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import { CustomLook } from "./smoothLook";

declare module "mineflayer" {
    interface Bot {
        smoothLook: CustomLook;
    }
}


export function loader(bot: Bot) {
    bot.smoothLook = new CustomLook(bot);
    bot.on("physicsTick", () => {
        TWEEN.update()
    })
}