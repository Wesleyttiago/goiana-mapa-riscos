import { GOIANA_CENTER } from "../map/riskModel.js";

// Coordenadas e classificações sintéticas: não representam áreas de risco reais.
export function createDemoData(count = 2000) {
  if (!Number.isInteger(count) || count < 0 || count > 2000) {
    throw new RangeError("A demonstração aceita de 0 a 2.000 pontos.");
  }
  let seed = 20261008;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const centers = [
    GOIANA_CENTER,
    [-7.5455, -34.989],
    [-7.578, -35.024],
    [-7.53, -35.015],
  ];
  const levels = ["baixa", "media", "baixa", "alta", "media", "baixa"];
  const features = Array.from({ length: count }, (_, index) => {
    const center = centers[index % centers.length];
    const spread = index % 11 === 0 ? 0.12 : 0.022;
    const latitude = Number((center[0] + (random() - 0.5) * spread).toFixed(6));
    const longitude = Number(
      (center[1] + (random() - 0.5) * spread).toFixed(6),
    );
    const number = String(index + 1).padStart(4, "0");
    return {
      type: "Feature",
      id: `DEMO-${number}`,
      geometry: { type: "Point", coordinates: [longitude, latitude] },
      properties: {
        titulo: `Ponto de demonstração ${number}`,
        vulnerabilidade: levels[index % levels.length],
        descricao:
          "Exemplo fictício para testar a visualização e o agrupamento de marcadores.",
      },
    };
  });
  return { type: "FeatureCollection", features };
}
