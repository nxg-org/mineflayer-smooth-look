const{ Bot, createBot } = require( "mineflayer");
const { createPlugin } = require( "../lib/index");

const TWEEN = require( "@tweenjs/tween.js");

const bot = createBot({
  host: process.argv[2],
  port: 25565,
  username: "lookTesting",
  auth: "microsoft",
  version: "1.19.4",
});


const smoothLook = createPlugin({
    easingFunction: TWEEN.Easing.Cubic.Out,
    turnRateModifier: 1.8, // modifies yawSpeed and pitchSpeed. if those are changed later, this value is ignored.
    debug: true,
    goodEnoughDot: 0.9999,
})

bot.loadPlugin(smoothLook);

const options = {
  attack: false,
  run: false,
  old: false,
};

bot.on("spawn", () => {

  bot.on("chat", async (user, message) => {
    const [cmd, ...args] = message.trim().split(" ");
    let target;
    switch (cmd) {
      case "info": {
        bot.chat(`yaw: ${bot.entity.yaw} pitch: ${bot.entity.pitch}`);
        break;
      }

      case "look": {
        target = bot.nearestEntity((e) => !!e.username?.startsWith(args[0]));
        if (!target) return bot.chat("didn't find target");
        const start = performance.now();
        await bot.smoothLook.lookAt(target.position.offset(0, target.height, 0), true);
        const end = performance.now();
        bot.chat(`smoothLookAt took ${end - start}ms`);
        break;
      }

      case "oldlook": {
        target = bot.nearestEntity((e) => !!e.username?.startsWith(args[0]));
        if (!target) return bot.chat("didn't find target");
        const start = performance.now();
        await bot.lookAt(target.position.offset(0, target.height, 0), false);
        const end = performance.now();
        bot.chat(`lookAt took ${end - start}ms`);
        break;
      }
    }
  });
});

