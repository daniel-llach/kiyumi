import React from 'react';
import { SplashScreen } from './src/screens/SplashScreen';
import { ChromaKeyTest } from './src/screens/ChromaKeyTest';

const SPLASH_DURATION_MS = 1800;

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <ChromaKeyTest />;
}
