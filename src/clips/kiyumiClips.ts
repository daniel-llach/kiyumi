export type KiyumiClip = {
  loop: boolean;
  durationMs: number;
  ios: {
    video: number;
    audio: number;
  };
  android: {
    audio: number;
    spriteSheet: number;
    frameW: number;
    frameH: number;
    cols: number;
    rows: number;
    frameCount: number;
    fps: number;
  };
};

export const introClip: KiyumiClip = {
  loop: false,
  durationMs: 6050,
  ios: {
    video: require('../../assets/video/kiyumi-intro.mp4'),
    audio: require('../../assets/audio/kiyumi-intro.m4a'),
  },
  android: {
    audio: require('../../assets/audio/kiyumi-intro.m4a'),
    spriteSheet: require('../../assets/sprites/kiyumi-intro-spritesheet.webp'),
    frameW: 480,
    frameH: 854,
    cols: 9,
    rows: 8,
    frameCount: 72,
    fps: 12,
  },
};

export const waitingNeutralClip: KiyumiClip = {
  loop: true,
  durationMs: 4064,
  ios: {
    video: require('../../assets/video/waiting-neutral.mp4'),
    audio: require('../../assets/audio/waiting-neutral.m4a'),
  },
  android: {
    audio: require('../../assets/audio/waiting-neutral.m4a'),
    spriteSheet: require('../../assets/sprites/waiting-neutral-spritesheet.webp'),
    frameW: 478,
    frameH: 854,
    cols: 8,
    rows: 6,
    frameCount: 48,
    fps: 12,
  },
};
