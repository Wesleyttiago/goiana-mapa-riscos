export const GOIANA_CENTER = Object.freeze([-7.5606, -35.0031]);

export const VULNERABILITY_LEVELS = Object.freeze({
  baixa: { label: "Baixa", letter: "B", color: "#155fa5" },
  media: { label: "Média", letter: "M", color: "#8c5a00" },
  alta: { label: "Alta", letter: "A", color: "#b42318" },
});

// GeoJSON usa [longitude, latitude]; Leaflet usa [latitude, longitude].
export function parseRiskData(data) {
  if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    return {
      points: [],
      rejected: 0,
      issue: "Informe uma coleção GeoJSON do tipo FeatureCollection.",
    };
  }

  const ids = new Set();
  const points = [];
  let rejected = 0;
  for (const [index, feature] of data.features.entries()) {
    const properties = feature?.properties || {};
    const coordinates = feature?.geometry?.coordinates;
    const level =
      typeof properties.vulnerabilidade === "string"
        ? properties.vulnerabilidade
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .trim()
        : "";
    const id = String(feature?.id ?? properties.id ?? `ponto-${index + 1}`);
    if (
      feature?.type !== "Feature" ||
      feature.geometry?.type !== "Point" ||
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      !coordinates.slice(0, 2).every(Number.isFinite) ||
      Math.abs(coordinates[0]) > 180 ||
      Math.abs(coordinates[1]) > 85.05112878 ||
      !Object.hasOwn(VULNERABILITY_LEVELS, level) ||
      ids.has(id)
    ) {
      rejected += 1;
      continue;
    }
    ids.add(id);
    points.push({
      id,
      title:
        typeof properties.titulo === "string"
          ? properties.titulo.slice(0, 160)
          : `Ponto ${id}`,
      description:
        typeof properties.descricao === "string"
          ? properties.descricao.slice(0, 600)
          : "",
      vulnerability: level,
      position: [coordinates[1], coordinates[0]],
    });
  }
  return { points, rejected, issue: null };
}

export function countLevels(points) {
  const counts = { baixa: 0, media: 0, alta: 0 };
  for (const point of points) counts[point.vulnerability] += 1;
  return counts;
}
