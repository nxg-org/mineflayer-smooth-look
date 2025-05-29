export type StaticOptions = {
    easingFunction?: EasingFunction;
    turnRateModifier?: number;
    debug?: boolean;
    goodEnoughDot?: number;
}

export type EasingFunction = (amount: number) => number;


export interface MoveTaskInfo {
    dest: THREE.Euler;
    closeEnoughDot: number;
  }