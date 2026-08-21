import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { KiyumiVideo } from '../components/KiyumiVideo';
import { introClip, waitingNeutralClip, KiyumiClip } from '../clips/kiyumiClips';

const backgroundVideoSource = require('../../assets/video/fondo_intro.mp4');

// Once the new clip mounts, its first frame renders on top of the old one
// (which stays frozen underneath), so there's no gap before we drop the old layer.
const OLD_LAYER_REMOVAL_DELAY_MS = 600;

type Layer = { clip: KiyumiClip; id: number };

export function Welcome() {
  const { width, height } = useWindowDimensions();
  const [layers, setLayers] = React.useState<Layer[]>([{ clip: introClip, id: 0 }]);

  const backgroundPlayer = useVideoPlayer(backgroundVideoSource, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLayers((prev) => [...prev, { clip: waitingNeutralClip, id: prev.length }]);
    }, introClip.durationMs);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (layers.length <= 1) return;
    const timer = setTimeout(() => {
      setLayers((prev) => prev.slice(-1));
    }, OLD_LAYER_REMOVAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [layers]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <VideoView
        player={backgroundPlayer}
        style={[styles.background, { width, height }]}
        contentFit="cover"
        nativeControls={false}
      />
      {layers.map((layer) => (
        <View key={layer.id} style={[styles.kiyumiWrapper, { width, height }]}>
          <KiyumiVideo clip={layer.clip} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  kiyumiWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
});
