import { Bot } from "mineflayer";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import { CustomLook } from "./customLook";
import utilPlugin from "@nxg-org/mineflayer-util-plugin"

declare module "mineflayer" {

    interface Bot {
        customLook: CustomLook;
    }
}


export function loader(bot: Bot, options: any) {
    if (!bot.hasPlugin(utilPlugin)) bot.loadPlugin(utilPlugin);
    bot.customLook = new CustomLook(bot);
    bot.on("physicsTick", () => {
        TWEEN.update()
    })
}