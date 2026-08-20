import { Skia } from '@shopify/react-native-skia';

export const chromaKeySource = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float threshold;
uniform float smoothing;
uniform float spillSuppression;

half4 main(vec2 xy) {
  vec4 color = image.eval(xy);
  float blueness = color.b - max(color.r, color.g);
  float alpha = (1.0 - smoothstep(threshold, threshold + smoothing, blueness)) * color.a;

  vec3 rgb = color.rgb;
  float spill = max(0.0, color.b - max(color.r, color.g) * 1.05);
  rgb.b -= spill * spillSuppression;

  return half4(rgb * alpha, alpha);
}
`)!;
