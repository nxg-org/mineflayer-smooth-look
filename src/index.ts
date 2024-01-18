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

export function monkeyPatch(bot: Bot) {
    if (!bot.smoothLook) {
        console.warn('smoothLook was not loaded yet!');
        loader(bot);
    }

    bot.lookAt = (point, force) => {
        return bot.smoothLook.lookAt(point, undefined, true);
    }

    bot.look = (yaw, pitch, force) => {
        return bot.smoothLook.look(yaw, pitch, undefined, true);
    }
}