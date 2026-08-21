import React from 'react';
import { Image, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Canvas, Fill, ImageShader, Shader, useVideo } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';
import { useAudioPlayer } from 'expo-audio';
import { chromaKeySource } from '../shaders/chromaKey';
import type { KiyumiClip } from '../clips/kiyumiClips';

const VIDEO_W = 480;
const VIDEO_H = 854;

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
  const paused = useSharedValue(false);
  const videoUri = Image.resolveAssetSource(clip.ios.video).uri;
  const { currentFrame } = useVideo(videoUri, { paused, looping: clip.loop });
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const audioPlayer = useAudioPlayer(clip.ios.audio);
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

  if (currentFrame && !audioStarted.current) {
    audioStarted.current = true;
    audioPlayer.seekTo(0);
    audioPlayer.play();
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  let rect = { x: 0, y: 0, width: size.width, height: size.height };
  if (size.width > 0) {
    const scale = Math.min(size.width / VIDEO_W, size.height / VIDEO_H);
    const dispW = VIDEO_W * scale;
    const dispH = VIDEO_H * scale;
    rect = {
      x: (size.width - dispW) / 2,
      y: size.height - dispH,
      width: dispW,
      height: dispH,
    };
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {size.width > 0 && (
        <Canvas style={StyleSheet.absoluteFill} opaque={false}>
          <Fill>
            <Shader
              source={chromaKeySource}
              uniforms={{ threshold, smoothing, spillSuppression }}
            >
              <ImageShader image={currentFrame} fit="fill" rect={rect} />
            </Shader>
          </Fill>
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
