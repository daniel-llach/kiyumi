import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const splashImage = require('../../assets/splash-screen-full.png');

export function SplashScreen() {
  return (
    <View style={styles.root}>
      <Image source={splashImage} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#A2D7C5',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
