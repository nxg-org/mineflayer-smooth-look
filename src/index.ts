import { Bot } from "mineflayer";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import { SmoothLook } from "./smoothLook";
import { StaticOptions } from "./types";




declare module "mineflayer" {
    interface Bot {
        smoothLook: SmoothLook;
    }
}

/**
 * Utility function to create a plugin for mineflayer bots.
 * 
 * This can be used for easy access to settings on the bot, in case you want to customize things.
 */
export function createPlugin(opts: StaticOptions) {
    return (bot: Bot) => {
        loader(bot);

        if (opts.easingFunction) {
            bot.smoothLook.setEasing(opts.easingFunction);
        }   

        if (opts.turnRateModifier) {
            bot.physics.yawSpeed *= opts.turnRateModifier;
            bot.physics.pitchSpeed *= opts.turnRateModifier;
        }

        if (opts.debug) {
            bot.smoothLook.debug = opts.debug;
        }

        if (opts.goodEnoughDot) {
            bot.smoothLook.goodEnoughDot = opts.goodEnoughDot;
        }
    }
}

/**
 * Default loader function for the smoothLook plugin.
 * @param bot The bot to load the smoothLook plugin on.
 */
export function loader(bot: Bot, debug = false, _monkeyPatch = false) {
    bot.smoothLook = new SmoothLook(bot, debug, _monkeyPatch);
    bot.on("physicsTick", () => {
        TWEEN.update()
    })
}


export function monkeyPatch(bot: Bot) {
    if (bot.smoothLook) {
        throw 'Calling monkey patch and loading the plugin is no longer supported.'
    }
    loader(bot, true);
}