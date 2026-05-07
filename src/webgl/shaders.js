export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uVelocity;
  uniform int uDarkMode;
  varying vec2 vUv;

  // Hash function
  vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                  dot(p, vec2(269.5, 183.3)),
                  dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 43758.5453);
  }

  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash3(i).x, hash3(i + vec2(1.0, 0.0)).x, u.x),
               mix(hash3(i + vec2(0.0, 1.0)).x, hash3(i + vec2(1.0, 1.0)).x, u.x), u.y);
  }

  // FBM
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 mouse = uMouse / uResolution;

    // Slow moving base noise
    vec2 q = vec2(fbm(uv + 0.1 * uTime * 0.15), fbm(uv + vec2(1.0)));
    vec2 r = vec2(fbm(uv + 1.0 * q + 0.15 * uTime * 0.1),
                  fbm(uv + 1.0 * q + 0.126));
    float f = fbm(uv + r);

    // Mouse ripple
    float dist = length(uv - mouse);
    float ripple = uVelocity * exp(-dist * 8.0) * sin(dist * 30.0 - uTime * 3.0) * 0.04;
    f += ripple;

    // Grayscale
    float brightness = mix(0.92, 1.0, f);
    if (uDarkMode == 1) {
      brightness = 1.0 - brightness * 0.15;
    } else {
      brightness = 1.0 - (1.0 - brightness) * 0.08;
    }

    gl_FragColor = vec4(vec3(brightness), 1.0);
  }
`
