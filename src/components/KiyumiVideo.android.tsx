import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Canvas, Fill, Group, ImageShader, Shader, useImage } from '@shopify/react-native-skia';
import { useAudioPlayer } from 'expo-audio';
import { chromaKeySource } from '../shaders/chromaKey';
import type { KiyumiClip } from '../clips/kiyumiClips';

type Props = {
  clip: KiyumiClip;
  threshold?: number;
  smoothing?: number;
  spillSuppression?: number;
};

export function KiyumiVideo({
  clip,
  threshold = 0.06,
  smoothing = 0.12,
  spillSuppression = 0.6,
}: Props) {
  const { spriteSheet: spriteSheetSource, audio, frameW, frameH, cols, rows, frameCount, fps } =
    clip.android;
  const sheetW = cols * frameW;
  const sheetH = rows * frameH;
  const clipDuration = frameCount / fps;

  const spriteSheet = useImage(spriteSheetSource);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [frameIndex, setFrameIndex] = React.useState(0);

  const audioPlayer = useAudioPlayer(audio);
  const audioStarted = React.useRef(false);

  React.useEffect(() => {
    audioPlayer.loop = clip.loop;
    audioPlayer.volume = 1;
    return () => {
      try {
        audioPlayer.pause();
      } catch {
        // Native player may already be released (e.g. app was backgrounded).
      }
      audioStarted.current = false;
    };
  }, [audioPlayer, clip.loop]);

  React.useEffect(() => {
    if (!audioStarted.current) {
      audioStarted.current = true;
      audioPlayer.seekTo(0);
      audioPlayer.play();
    }
    const interval = setInterval(() => {
      const t = clip.loop ? audioPlayer.currentTime % clipDuration : audioPlayer.currentTime;
      const nextFrame = Math.min(Math.floor(t * fps), frameCount - 1);
      setFrameIndex(nextFrame);
      if (!clip.loop && t >= clipDuration) {
        clearInterval(interval);
      }
    }, 1000 / 30);
    return () => clearInterval(interval);
  }, [audioPlayer, clip.loop, clipDuration, fps, frameCount]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const scale = Math.min(size.width / frameW, size.height / frameH) || 0;
  const dispFrameW = frameW * scale;
  const dispFrameH = frameH * scale;
  const offsetX = (size.width - dispFrameW) / 2;
  const offsetY = size.height - dispFrameH;
  const col = frameIndex % cols;
  const row = Math.floor(frameIndex / cols);

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
                    width: sheetW * scale,
                    height: sheetH * scale,
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
