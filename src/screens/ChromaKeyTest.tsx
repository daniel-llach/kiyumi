import React from 'react';
import { AppState, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KiyumiVideo } from '../components/KiyumiVideo';

const kiyumiVideoSource = require('../../assets/video/kiyumi-intro.mp4');

const CHECKER_ROWS = 8;
const CHECKER_COLS = 6;

export function ChromaKeyTest() {
  const { width, height } = useWindowDimensions();
  const cellWidth = width / CHECKER_COLS;
  const cellHeight = height / CHECKER_ROWS;

  const [videoKey, setVideoKey] = React.useState(0);

  React.useEffect(() => {
    const wasBackgrounded = { current: false };
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        wasBackgrounded.current = true;
      } else if (wasBackgrounded.current) {
        wasBackgrounded.current = false;
        setVideoKey((k) => k + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.checkerboard, { width, height }]}>
        {Array.from({ length: CHECKER_ROWS }).map((_, row) => (
          <View key={row} style={{ flexDirection: 'row', width, height: cellHeight }}>
            {Array.from({ length: CHECKER_COLS }).map((__, col) => {
              const dark = (row + col) % 2 === 0;
              return (
                <View
                  key={col}
                  style={[
                    { width: cellWidth, height: cellHeight },
                    dark ? styles.checkerDark : styles.checkerLight,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View style={[styles.videoWrapper, { width, height }]}>
        <KiyumiVideo key={videoKey} source={kiyumiVideoSource} />
      </View>
      <Text style={styles.label}>Chroma-key test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  checkerboard: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  checkerDark: {
    backgroundColor: '#e91e63',
  },
  checkerLight: {
    backgroundColor: '#ffc107',
  },
  videoWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
