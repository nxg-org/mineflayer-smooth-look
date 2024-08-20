import * as THREE from "three";
import { Vec3 } from "vec3";


export function lookingAtEuler(yaw: number, pitch: number) {
    // clamp yaw to -PI, PI
    yaw = yaw % (2 * Math.PI);
    return new THREE.Euler(yaw, pitch, 0);
}

export function targetEuler(src: Vec3, dest: Vec3) {
    const dir = dest.minus(src);
    return dirToEuler(dir);
}

export function dirToEuler(dir: Vec3): THREE.Euler {
    const yaw = Math.atan2(-dir.x, -dir.z);
    const groundDistance = Math.sqrt(dir.x * dir.x + dir.z * dir.z);
    const pitch = Math.atan2(dir.y, groundDistance);
    return new THREE.Euler(yaw, pitch, 0);
}

export function EulerToDir(euler: THREE.Euler) {
    return yawPitchToDir(euler.y, euler.x);
}

export function yawPitchToDir(yaw: number, pitch: number) {
    return new Vec3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
}
