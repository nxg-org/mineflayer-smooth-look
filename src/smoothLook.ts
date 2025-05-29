import { Bot } from "mineflayer";
import { Vec3 } from "vec3";
import { dirToEuler, lookingAtEuler, targetEuler, yawPitchToDir } from "./lookUtil";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import * as THREE from "three";

type EasingFunction = (amount: number) => number;

interface MoveTaskInfo {
  dest: THREE.Euler;
  closeEnoughDot: number;
}

interface LookOptions {
  speed?: number;
  sleek?: boolean;
}

export class SmoothLook {
  public readonly currentlyLooking: boolean;
  private _pendingTask: MoveTaskInfo | null;
  private _task: Tween<THREE.Euler> | null;

  public goodEnoughDot: number = 0.9999;
  public easing: EasingFunction;

  constructor(private bot: Bot, public debug: boolean = false) {
    this.currentlyLooking = false;
    this.easing = TWEEN.Easing.Elastic.Out;
    this._task = null;
    this._pendingTask = null;
  }

  public setEasing(func: EasingFunction) {
    this.easing = func;
  }

  /**
   * Wraps the euler so the walk from start to finish is clean,
   * no snapback when neg to pos values.
   */
  private _wrapRotationEuler(start: THREE.Euler, dest: THREE.Euler) {
    const startYaw = start.x;
    let destYaw = dest.x;

    const deltaYaw = destYaw - startYaw;

    // console.log('wrap', startYaw, destYaw, deltaYaw)

    if (deltaYaw > Math.PI) {
      destYaw -= 2 * Math.PI;
    } else if (deltaYaw < -Math.PI) {
      destYaw += 2 * Math.PI;
    }

    dest.x = destYaw;
    return dest;
  }

  /**
   * Build custom Tween that interacts w/ the bot object
   * and cleans itself up once finishing.
   */
  private _buildTask(start: THREE.Euler, dest: THREE.Euler, closeEnoughDot: number = this.goodEnoughDot, opts: LookOptions = {}) {
    const duration = this.estimateTurnTime(dest.x, dest.y, opts);

    return new TWEEN.Tween(start)
      .to(dest, duration)
      .easing(opts.sleek ? TWEEN.Easing.Cubic.Out : this.easing)
      .onUpdate((current, elapsed) => {
        this.bot.look(current.x, current.y, true);

        const curVec3 = yawPitchToDir(current.x, current.y);
        const destVec3 = yawPitchToDir(dest.x, dest.y);
        const dot = curVec3.dot(destVec3);

        if (dot > closeEnoughDot) {
          if (this._pendingTask) {
            this._launchNextTaskFromCancel(this._pendingTask.dest, this._pendingTask.closeEnoughDot);
          } else {
            this._task?.stop();
          }
        }
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
  private _launchNextTaskFromCancel(dest: THREE.Euler, closeEnoughDot: number = this.goodEnoughDot) {
    if (this._task) {
      this._task
        .onStop((current) => {
          this._task = this._buildTask(current, this._wrapRotationEuler(current, dest), closeEnoughDot);
          this._beginTween(this._task);

          if (this._pendingTask) {
            this._pendingTask = null;
          }
        })
        .stop();
    }
  }

  /**
   * Used by non-force. Wait for current task to end,
   * then begin new task from current position.
   * This does not cancel the current task and overrides the initial custom task clear.
   */
  private eventuallyChain(dest: THREE.Euler, closeEnoughDot: number = this.goodEnoughDot) {
    if (this._task) {
      this._task.onComplete((current) => {
        this._pendingTask = null;
        this._task = this._buildTask(current, this._wrapRotationEuler(current, dest), closeEnoughDot);
        this._beginTween(this._task);
      });

      this._pendingTask = { dest, closeEnoughDot };
    }
  }

  private _beginTween = (tween: Tween<THREE.Euler>) => {
    tween.start(TWEEN.now() - 50);
    tween.update();
  }

  /**
   * Estimate the time it takes to turn to a certain yaw/pitch.
   * This is used to determine the duration of the tween.
   *
   * @param yaw
   * @param pitch
   * @param opts optional look settings
   * @returns estimated time in ms
   */
  private estimateTurnTime(yaw: number, pitch: number, opts: LookOptions = {}) {
    const curYaw = this.bot.entity.yaw;
    const curPitch = this.bot.entity.pitch;

    const yawDiff = Math.abs(curYaw - yaw);
    const pitchDiff = Math.abs(curPitch - pitch);

    // 50ms * bot's yaw/pitch diff
    const maxDeltaYaw = 0.05 * this.bot.physics.yawSpeed;
    const maxDeltaPitch = 0.05 * (this.bot.physics as any).pitchSpeed;

    const yawTicks = yawDiff / maxDeltaYaw;
    const pitchTicks = pitchDiff / maxDeltaPitch;

    let base = Math.max(yawTicks, pitchTicks) * 20;

    if (opts.sleek) base *= 1.8;
    if (opts.speed && opts.speed > 0) base *= opts.speed;

    return base;
  }

  public async look(yaw: number, pitch: number, force: boolean = true, closeEnoughDot: number = this.goodEnoughDot, opts: LookOptions = {}) {
    this.lookTowards(yawPitchToDir(yaw, pitch), force, closeEnoughDot, opts);
  }

  public lookTowards(dir: Vec3, force: boolean = true, closeEnoughDot: number = this.goodEnoughDot, opts: LookOptions = {}) {
    const startRotation = lookingAtEuler(this.bot.entity.yaw, this.bot.entity.pitch);
    const endRotation = dirToEuler(dir);

    return this._lookHandler(startRotation, endRotation, force, closeEnoughDot, opts);
  }

  public lookAt(target: Vec3, force: boolean = true, closeEnoughDot: number = this.goodEnoughDot, opts: LookOptions = {}) {
    const startRotation = lookingAtEuler(this.bot.entity.yaw, this.bot.entity.pitch);
    const endRotation = targetEuler(this.bot.entity.position.offset(0, (this.bot.entity as any).eyeHeight, 0), target);

    return this._lookHandler(startRotation, endRotation, force, closeEnoughDot, opts);
  }

  private async _lookHandler(startRotation: THREE.Euler, endRotation: THREE.Euler, force: boolean = true, closeEnoughDot: number = this.goodEnoughDot, opts: LookOptions = {}) {
    this._wrapRotationEuler(startRotation, endRotation);

    if (this._task?.isPlaying() && !force) {
      this._debug("task running + not forcing.", TWEEN.getAll().length, "tasks.");
      this.eventuallyChain(endRotation, closeEnoughDot);
    } else if (this._task?.isPlaying() && force) {
      this._debug("task running + forcing.", TWEEN.getAll().length, "tasks.");
      this._launchNextTaskFromCancel(endRotation, closeEnoughDot);
    } else if (!this._task?.isPlaying()) {
      this._debug("task not running, making new.", TWEEN.getAll().length, "tasks.");
      this._task = this._buildTask(startRotation, endRotation, closeEnoughDot, opts);
      this._beginTween(this._task);
    }

    await new Promise<void>((resolve) => {
      this._task?.onComplete(() => {
        resolve();
      }).onStop(() => {
        resolve();
      });
    });
  }

  private _debug(message?: any, ...optionalParams: any[]): void {
    if (this.debug) console.log(message, ...optionalParams);
  }
}
