export type HousingSample = {
  id: number;
  squareFeet: number;
  bedrooms: number;
  distanceToCenter: number;
  yearBuilt: number;
  price: number;
};

export type HousingGeneratorConfig = {
  seed?: number;
  samples?: number;
  noiseScale?: number;
};

const DEFAULT_CONFIG: Required<HousingGeneratorConfig> = {
  seed: 42,
  samples: 500,
  noiseScale: 0.08,
};

function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function generateHousingData(config: HousingGeneratorConfig = {}): HousingSample[] {
  const { seed, samples, noiseScale } = { ...DEFAULT_CONFIG, ...config };
  const random = createRng(seed);
  const baselinePrice = 90000;

  return Array.from({ length: samples }, (_, index) => {
    const squareFeet = 600 + random() * 2200;
    const bedrooms = Math.round(1 + random() * 4);
    const distanceToCenter = 0.5 + random() * 25;
    const yearBuilt = 1960 + Math.floor(random() * 60);

    const distanceFactor = Math.exp(-distanceToCenter / 12);
    const seasonal = Math.sin((yearBuilt - 1960) / Math.PI) * 5000;
    const interaction = (squareFeet * distanceFactor) / 8;

    const deterministicPrice =
      baselinePrice + squareFeet * 180 + bedrooms * 12000 + distanceFactor * 35000 + seasonal + interaction;
    const noise = (random() - 0.5) * noiseScale * deterministicPrice;

    return {
      id: index,
      squareFeet,
      bedrooms,
      distanceToCenter,
      yearBuilt,
      price: Math.max(40000, deterministicPrice + noise),
    };
  });
}
