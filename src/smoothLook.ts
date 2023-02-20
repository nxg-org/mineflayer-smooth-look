import { Bot } from "mineflayer";
import { Vec3 } from "vec3";
import { dirToEuler, lookingAtEuler, targetEuler, yawPitchToDir } from "./lookUtil";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import * as THREE from "three";

type EasingFunction = (amount: number) => number;

export class CustomLook {
    public readonly _currentlyLooking: boolean;
    public _task: Tween<THREE.Euler> | null;
    public easing: EasingFunction;

    constructor(private bot: Bot, public debug: boolean = false) {
        this._currentlyLooking = false;
        this.easing = TWEEN.Easing.Elastic.Out;
        this._task = null;
    }

    public setEasing(func: EasingFunction) {
        this.easing = func
    }

    /**
     * Wraps the euler so the walk from start to finish is clean,
     * no snapback when neg to pos values.
     */
    private _wrapRotationEuler(start: THREE.Euler, dest: THREE.Euler) {
        if (Math.abs(start.x - dest.x) > Math.PI) dest.x = dest.x + 2 * Math.sign(start.x - dest.x) * Math.PI;
        return dest;
    }

    /**
     * Build custom Tween that interacts w/ the bot object
     * and cleans itself up once finishing.
     */
    private _buildTask(start: THREE.Euler, dest: THREE.Euler, duration: number) {
        return new TWEEN.Tween(start)
            .to(dest, duration)
            .easing(this.easing)
            .onUpdate((current) => {
                this.bot.look(current.x, current.y, true);
            })
            .onComplete((current) => {
                if (this._task && (this._task as any)._chainedTweens.length === 0) {
                    this._task = null;
                }
            });
    }

    /**
     * Unused. Would clean up internal tasks.
     */
    private _cleanupTasks(chained: boolean = true) {
        if (this._task) {
            this._task.stop();
            if (chained) this._task.stopChainedTweens();
            this._task = null;
        }
    }

    /**
     * Used by force value. Cancel current task,
     * then start on current tween value to wanted destination.
     * This smoothly connects tweens (standard chaining is broken).
     */
    private _launchNextTaskFromCancel(dest: THREE.Euler, duration: number) {
        if (this._task) {
            this._task
                .onStop((current) => {
                    this._task = this._buildTask(current, this._wrapRotationEuler(current, dest), duration);
                    this._task.start();
                })
                .stop();
        }
    }

    /**
     * Used by non-force. Wait for current task to end,
     * then begin new task from current position.
     * This does not cancel the current task and overrides the initial custom task clear.
     */
    private eventuallyChain(dest: THREE.Euler, duration: number) {
        if (this._task) {
            this._task.onComplete((current) => {
                this._task = this._buildTask(current, this._wrapRotationEuler(current, dest), duration).start();
            });
        }
    }

    public async look(yaw: number, pitch: number, duration: number = 1000, force: boolean = true) {
        this.lookTowards(yawPitchToDir(yaw, pitch), duration, force);
    }

    public async lookTowards(dir: Vec3, duration: number = 1000, force: boolean = true) {
        const startRotation = lookingAtEuler(this.bot.entity.yaw, this.bot.entity.pitch);
        const endRotation = dirToEuler(dir);
        
        this._wrapRotationEuler(startRotation, endRotation);

        if (this._task?.isPlaying() && !force) {
            this._debug("task running + not forcing.", TWEEN.getAll().length, "tasks.");
            this.eventuallyChain(endRotation, duration);
        } else if (this._task?.isPlaying() && force) {
            this._debug("task running + forcing.", TWEEN.getAll().length, "tasks.");
            this._launchNextTaskFromCancel(endRotation, duration);
        } else if (!this._task?.isPlaying()) {
            this._debug("task not running, making new.", TWEEN.getAll().length, "tasks.");
            this._task = this._buildTask(startRotation, endRotation, duration);
            this._task.start();
        }
    }

    public async lookAt(target: Vec3, duration: number = 1000, force: boolean = true) {
        const startRotation = lookingAtEuler(this.bot.entity.yaw, this.bot.entity.pitch);
        const endRotation = targetEuler(this.bot.entity.position.offset(0, this.bot.entity.height, 0), target);
        
        this._wrapRotationEuler(startRotation, endRotation);

        if (this._task?.isPlaying() && !force) {
            this._debug("task running + not forcing.", TWEEN.getAll().length, "tasks.");
            this.eventuallyChain(endRotation, duration);
        } else if (this._task?.isPlaying() && force) {
            this._debug("task running + forcing.", TWEEN.getAll().length, "tasks.");
            this._launchNextTaskFromCancel(endRotation, duration);
        } else if (!this._task?.isPlaying()) {
            this._debug("task not running, making new.", TWEEN.getAll().length, "tasks.");
            this._task = this._buildTask(startRotation, endRotation, duration);
            this._task.start();
        }
    }

    private _debug(message?: any, ...optionalParams: any[]): void {
        if (this.debug) console.log(message, ...optionalParams)
    }
}
