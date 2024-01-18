# mineflayer-smooth-look


### Example:
```js
const {loader} = require("@nxg-org/mineflayer-smooth-look");
const {createBot} = require("mineflayer");
const {Vec3} = require("vec3");


const bot = createBot({...});
bot.loadPlugin(loader);


bot.smoothLook.lookAt(target /* entity position */)
bot.smoothLook.lookTowards(new Vec3(0, 0, 0) /* direction */)
bot.smoothLook.look(yaw, pitch)
```



### Notes:

"Why is force default to true?"

Well, The alternative is to append the latest tween to the list of tweens that have not completed yet. Naturally, most tweening will occur over the span than more than one tick. Yet someone will definitely look at an entity every tick. If force is false, the bot will take `duration * # of calls` to complete the look. If force is true, it will only take `duration` ms to complete.

"Why is the default duration so long?"

Some of the function intervals may vary wildly. For example, the default tween function I used is `TWEEN.Easing.Elastic.Out`, which snaps to the destination almost immediately (even with 1000ms given), only to overshoot -> re-adjust back to the destination for the rest of the 1000ms. Mileage will vary wildly depending on what easing function you use.


### API:


#### smoothLook.setEasing(func)
- `func`: A function for interpolating movements. These are provided by `@tweenjs/tween.js`. 
I highly recommend you look at those instead.



##### smoothLook.lookAt(target, duration = 1000, force = true)
- `target`: A `Vec3` instance,  giving the location of whatever you want to look at.
    - For entities: do `entity.position`
- `duration`: The amount of time needed to complete the look.
- `force`: Whether or not to start the tween immediately, or after all others finish.


#### smoothLook.lookTowards(direction, duration = 1000, force = true)
- `direction`: A `Vec3` instance, indicating `x`, `y`, and `z`.
- `duration`: The amount of time needed to complete the look.
- `force`: Whether or not to start the tween immediately, or after all others finish.


#### smoothLook.look(yaw, pitch, duration = 1000, force = true)
- `yaw`: A number.
- `pitch`: A number.
- `duration`: The amount of time needed to complete the look.
- `force`: Whether or not to start the tween immediately, or after all others finish.


#### monkeyPatch(bot)
- `bot`: The mineflayer bot.
Monkey patches the bot's current look and lookAt to use the smoothLook plugin automatically.

