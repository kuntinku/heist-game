// gilded-trust: tuning constants for the whole heist.
export const TILE = 32;
export const VIEW_W = 960;
export const VIEW_H = 600;

// thief movement, px/s
export const SPEED_RUN = 155;
export const SPEED_WALK = 105;
export const SPEED_SNEAK = 62;
export const SPEED_CARRY = 88;         // slower while lugging a loot bag

// noise footprint, px
export const NOISE_RUN = 115;
export const NOISE_WALK = 55;
export const NOISE_SNEAK = 12;
export const WHISTLE_NOISE = 250;

// vision
export const GUARD_RANGE = 225;
export const GUARD_HALF_ANGLE = Math.PI / 6;
export const CAMERA_RANGE = 200;
export const CAMERA_HALF_ANGLE = Math.PI / 5;
export const CAMERA_SWEEP = 0.5;       // rad/s the camera lens sweeps
export const PLAYER_LIGHT_RANGE = 150;

// alarm meter, 0..100: cameras and guards feed it, smoke hides you from both
export const DETECT_RATE = 22;         // alarm points per second, at point blank
export const DETECT_COOL = 9;          // points per second cooling out of sight
export const ALARM_MAX = 100;
export const ALARM_TRIGGER = 100;      // full meter = lockdown: every guard hunts
export const CATCH_RADIUS = 22;
export const SEARCH_TIME = 6;

// tools, each costs a use
export const SMOKE_RADIUS = 120;
export const SMOKE_TIME = 7;
export const SMOKE_COUNT = 2;
export const EMP_TIME = 6;
export const EMP_COUNT = 1;

export const LOOT_TOTAL = 3;
export const DRILL_TIME = 5;           // seconds holding E at the vault door
