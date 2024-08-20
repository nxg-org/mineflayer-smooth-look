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

If you want to use this plugin while also retaining the ability to instantly snap to look at something, do not monkeypatch this plugin in and call `bot.smoothLook.look` or `bot.smoothLook.lookAt` instead.


### API:


#### smoothLook.setEasing(func)
- `func`: A function for interpolating movements. These are provided by `@tweenjs/tween.js`. 
I highly recommend you look at those instead. The default is `TWEEN.Easing.Elastic.Out`.


##### smoothLook.lookAt(target, force = true, goodEnoughDot = 1)
- `target`: A `Vec3` instance,  giving the location of whatever you want to look at.
    - For entities: do `entity.position`
- `force`: Whether or not to start the tween immediately, or after all others finish.
- `goodEnoughDot`: The dot product of the current look direction and the target direction. If the dot product is greater than this value, the tween will not start. This is to prevent the bot from looking at the target if it is already looking at it.


#### smoothLook.lookTowards(direction, force = true, goodEnoughDot = 1)
- `direction`: A `Vec3` instance, indicating `x`, `y`, and `z`.
- `force`: Whether or not to start the tween immediately, or after all others finish.
- `goodEnoughDot`: The dot product of the current look direction and the target direction. If the dot product is greater than this value, the tween will not start. This is to prevent the bot from looking at the target if it is already looking at it.


#### smoothLook.look(yaw, pitch, force = true, goodEnoughDot = 1)
- `yaw`: A number.
- `pitch`: A number.
- `force`: Whether or not to start the tween immediately, or after all others finish.
- `goodEnoughDot`: The dot product of the current look direction and the target direction. If the dot product is greater than this value, the tween will not start. This is to prevent the bot from looking at the target if it is already looking at it.


#### monkeyPatch(bot)
- `bot`: The mineflayer bot.
Monkey patches the bot's current look and lookAt to use the smoothLook plugin automatically.

