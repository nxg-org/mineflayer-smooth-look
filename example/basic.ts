import { Bot, createBot } from "mineflayer";
import { loader } from "../src/index";
import type { Entity } from "prismarine-entity";

const bot = createBot({
  host: "localhost",
  port: 25565,
  username: "lookTesting",
  auth: "offline",
});

bot.loadPlugin(loader);

const options = {
  attack: false,
  run: false,
};


bot.on("spawn", () => {
  bot.on("chat", (user, message) => {
    const [cmd, ...args] = message.trim().split(" ");
    let target;
    switch (cmd) {
      case "look":
        target = bot.nearestEntity((e) => !!e.username?.startsWith(args[0]));
        if (!target) return bot.chat("didn't find target");
        bot.smoothLook.lookAt(target.position, 50, true);
        // bot.lookAt(target.position, true)
        break;

      case "attack":
        target = bot.nearestEntity((e) => !!e.username?.startsWith(args[0]));
        if (!target) return bot.chat("didn't find target");
        options.attack = true;
        options.run = true
        attack(target);
        break;
      case "run":
        options.run = !options.run;
        break

      case "stopall":
        options.attack = false;
        options.run = false;
        break;
    }
  });
});

async function attack(target: Entity, ) {
  if (!target) return;
  let count = 0;
  while (options.attack) {
    // bot.lookAt(target.position.offset(0, 1, 0));
    bot.smoothLook.lookAt(target.position.offset(0, 1, 0), 150, true);
    count++;
    const flag0 = count > 4;
    const flag1 = bot.entity.position.distanceTo(target.position) < 3.5;
    const flag2 = (bot as any).entityAtCursor(3.5) === target;
    if (flag0 && flag1 && flag2) {
      bot.attack(target);
      count = 0;
    }

    if (options.run) {
      bot.setControlState("forward", true);
      bot.setControlState("sprint", true);
      bot.setControlState("jump", true);
    }

    await bot.waitForTicks(1);
  }

  bot.setControlState("forward", false);
  bot.setControlState("sprint", false);
  bot.setControlState("jump", false);
}
