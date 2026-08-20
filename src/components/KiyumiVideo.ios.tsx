import React from 'react';
import { Image, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Canvas, Fill, ImageShader, Shader, useVideo } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';
import { useAudioPlayer } from 'expo-audio';
import { chromaKeySource } from '../shaders/chromaKey';

const kiyumiAudioSource = require('../../assets/audio/kiyumi-intro.m4a');

type Props = {
  source: string | number;
  threshold?: number;
  smoothing?: number;
  spillSuppression?: number;
};

export function KiyumiVideo({
  source,
  threshold = 0.06,
  smoothing = 0.12,
  spillSuppression = 0.6,
}: Props) {
  const paused = useSharedValue(false);
  const videoUri =
    typeof source === 'number' ? Image.resolveAssetSource(source).uri : source;
  const { currentFrame } = useVideo(videoUri, { paused, looping: true });
  const [size, setSize] = React.useState({ width: 0, height: 0 });

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

  if (currentFrame && !audioStarted.current) {
    audioStarted.current = true;
    audioPlayer.seekTo(0);
    audioPlayer.play();
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {size.width > 0 && (
        <Canvas style={StyleSheet.absoluteFill} opaque={false}>
          <Fill>
            <Shader
              source={chromaKeySource}
              uniforms={{ threshold, smoothing, spillSuppression }}
            >
              <ImageShader
                image={currentFrame}
                fit="contain"
                rect={{ x: 0, y: 0, width: size.width, height: size.height }}
              />
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
