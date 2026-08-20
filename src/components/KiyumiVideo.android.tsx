import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Canvas, Fill, Group, ImageShader, Shader, useImage } from '@shopify/react-native-skia';
import { useAudioPlayer } from 'expo-audio';
import { chromaKeySource } from '../shaders/chromaKey';

const kiyumiSpriteSheet = require('../../assets/sprites/kiyumi-intro-spritesheet.webp');
const kiyumiAudioSource = require('../../assets/audio/kiyumi-intro.m4a');

const SHEET_COLS = 9;
const SHEET_ROWS = 8;
const FRAME_COUNT = 72;
const FRAME_W = 480;
const FRAME_H = 854;
const SHEET_W = SHEET_COLS * FRAME_W;
const SHEET_H = SHEET_ROWS * FRAME_H;
const FPS = 12;
const CLIP_DURATION = FRAME_COUNT / FPS;

type Props = {
  source?: string | number;
  threshold?: number;
  smoothing?: number;
  spillSuppression?: number;
};

export function KiyumiVideo({
  threshold = 0.06,
  smoothing = 0.12,
  spillSuppression = 0.6,
}: Props) {
  const spriteSheet = useImage(kiyumiSpriteSheet);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [frameIndex, setFrameIndex] = React.useState(0);

  const audioPlayer = useAudioPlayer(kiyumiAudioSource);
  const audioStarted = React.useRef(false);

  React.useEffect(() => {
    audioPlayer.loop = true;
    audioPlayer.volume = 1;
    return () => {
      try {
        audioPlayer.pause();
      } catch {
        // Native player may already be released (e.g. app was backgrounded).
      }
      audioStarted.current = false;
    };
  }, [audioPlayer]);

  React.useEffect(() => {
    if (!audioStarted.current) {
      audioStarted.current = true;
      audioPlayer.seekTo(0);
      audioPlayer.play();
    }
    const interval = setInterval(() => {
      const t = audioPlayer.currentTime % CLIP_DURATION;
      const nextFrame = Math.floor(t * FPS) % FRAME_COUNT;
      setFrameIndex(nextFrame);
    }, 1000 / 30);
    return () => clearInterval(interval);
  }, [audioPlayer]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const scale = Math.min(size.width / FRAME_W, size.height / FRAME_H) || 0;
  const dispFrameW = FRAME_W * scale;
  const dispFrameH = FRAME_H * scale;
  const offsetX = (size.width - dispFrameW) / 2;
  const offsetY = (size.height - dispFrameH) / 2;
  const col = frameIndex % SHEET_COLS;
  const row = Math.floor(frameIndex / SHEET_COLS);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {spriteSheet && size.width > 0 && (
        <Canvas style={StyleSheet.absoluteFill} opaque={false}>
          <Group clip={{ x: offsetX, y: offsetY, width: dispFrameW, height: dispFrameH }}>
            <Fill>
              <Shader
                source={chromaKeySource}
                uniforms={{ threshold, smoothing, spillSuppression }}
              >
                <ImageShader
                  image={spriteSheet}
                  fit="fill"
                  rect={{
                    x: offsetX - col * dispFrameW,
                    y: offsetY - row * dispFrameH,
                    width: SHEET_W * scale,
                    height: SHEET_H * scale,
                  }}
                />
              </Shader>
            </Fill>
          </Group>
        </Canvas>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
