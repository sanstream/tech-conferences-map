export type SpeckleBackgroundConfig = {
  /** Fixed seed so the pattern is stable across builds. Change to get a new layout. */
  seed: number
  tileWidth: number
  tileHeight: number
  dotsPerColor: number
  colorTokens: readonly string[]
  radiusMin: number
  radiusMax: number
  /** Soft edge width added outside each dot radius. */
  fadePx: number
  /** Keep dots away from tile edges (percentage). */
  positionPaddingPercent: number
}

/** Deterministic PRNG (mulberry32). */
function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomBetween(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function speckleDotGradient(
  rng: () => number,
  colorToken: string,
  config: SpeckleBackgroundConfig,
): string {
  const pad = config.positionPaddingPercent
  const x = round1(randomBetween(rng, pad, 100 - pad))
  const y = round1(randomBetween(rng, pad, 100 - pad))
  const inner = round1(randomBetween(rng, config.radiusMin, config.radiusMax))
  const outer = round1(inner + config.fadePx)

  return `radial-gradient(circle at ${x}% ${y}%, var(${colorToken}) 0 ${inner}px, transparent ${outer}px)`
}

export function generateSpeckleBackgroundCss(
  config: SpeckleBackgroundConfig,
): string {
  const rng = createRng(config.seed)
  const gradients: string[] = []

  for (const colorToken of config.colorTokens) {
    for (let i = 0; i < config.dotsPerColor; i++) {
      gradients.push(speckleDotGradient(rng, colorToken, config))
    }
  }

  return `@layer defaults {
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background-color: var(--colour-main-bg);
    background-size: ${config.tileWidth}px ${config.tileHeight}px;
    background-image:
      ${gradients.join(",\n      ")};
  }
}`
}

export const speckleBackgroundConfig = {
  seed: 127131,
  tileWidth: 520,
  tileHeight: 144,
  dotsPerColor: 14,
  colorTokens: ["--bg-speckle-1", "--bg-speckle-2", "--bg-speckle-3"],
  radiusMin: 4,
  radiusMax: 5,
  fadePx: 3,
  positionPaddingPercent: 3,
} satisfies SpeckleBackgroundConfig

export const speckleBackgroundCss = generateSpeckleBackgroundCss(
  speckleBackgroundConfig,
)
