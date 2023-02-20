# minfelayer-smooth-look


### Example:
```js
const {loader} = require("@nxg-org/mineflayer-smooth-look");
const {createBot} = require("mineflayer");
const {Vec3} = require("vec3");


const bot = createBot({...});
bot.loadPlugin(loader);


bot.smoothLook.lookAt(target /* entity */)
bot.smoothLook.lookTowards(new Vec3(0, 0, 0) /* direction */)
bot.smoothLook.look(yaw, pitch)
```

### API:


#### smoothLook.setEasing(func)
- `func`: A function for interpolating movements. These are provided by `@tweenjs/tween.js`. 
I highly recommend you look at those instead.



##### smoothLook.lookAt(target, duration = 1000, force = true)
- `target`: A `prismarine-entity` instance, usually found from `bot.entities`.
- `duration`: The amount of time needed to complete the look.
- `force`: Whether or not to start the tween immediately, or after all others finish.


##### smoothLook.lookTowards(direction, duration = 1000, force = true)
- `direction`: A `Vec3` instance, indicating `x`, `y`, and `z`.
- `duration`: The amount of time needed to complete the look.
- `force`: Whether or not to start the tween immediately, or after all others finish.


##### smoothLook.look(yaw, pitch, duration = 1000, force = true)
- `yaw`: A number.
- `pitch`: A number.
- `duration`: The amount of time needed to complete the look.
- `force`: Whether or not to start the tween immediately, or after all others finish.
