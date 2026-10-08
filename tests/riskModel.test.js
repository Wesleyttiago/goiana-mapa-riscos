import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  VULNERABILITY_LEVELS,
  parseRiskData,
  countLevels,
} from "../src/map/riskModel.js";
import { createDemoData } from "../src/data/demoData.js";

const collection = (features) => ({ type: "FeatureCollection", features });
const point = (id, coordinates = [-35.0031, -7.5606], level = "media") => ({
  type: "Feature",
  id,
  geometry: { type: "Point", coordinates },
  properties: { vulnerabilidade: level },
});

test("converte GeoJSON para latitude/longitude e aceita o rótulo Média", () => {
  const result = parseRiskData(
    collection([point("1", [-35.0031, -7.5606], "Média")]),
  );
  assert.deepEqual(result.points[0].position, [-7.5606, -35.0031]);
  assert.equal(result.points[0].vulnerability, "media");
  assert.equal(result.rejected, 0);
});

test("descarta coordenadas inválidas, geometrias incompatíveis e nível desconhecido", () => {
  const wrongGeometry = point("polygon");
  wrongGeometry.geometry.type = "Polygon";
  const result = parseRiskData(
    collection([
      point("ok"),
      point("nan", [NaN, -7]),
      point("range", [181, -7]),
      point("pole", [-35, 89]),
      point("level", [-35, -7], "critica"),
      wrongGeometry,
    ]),
  );
  assert.equal(result.points.length, 1);
  assert.equal(result.rejected, 5);
});

test("evita IDs duplicados e aceita coordenada zero", () => {
  const result = parseRiskData(
    collection([point("same", [0, 0]), point("same"), point(2)]),
  );
  assert.equal(result.points.length, 2);
  assert.equal(result.rejected, 1);
  assert.deepEqual(result.points[0].position, [0, 0]);
});

test("uma coleção vazia é válida e um contrato inválido informa o problema", () => {
  assert.deepEqual(parseRiskData(collection([])), {
    points: [],
    rejected: 0,
    issue: null,
  });
  assert.ok(parseRiskData({ features: [] }).issue);
});

test("os 2.000 pontos são válidos, determinísticos e têm os três níveis", () => {
  const data = createDemoData(2000);
  assert.deepEqual(data, createDemoData(2000));
  const result = parseRiskData(data);
  assert.equal(result.points.length, 2000);
  assert.equal(result.rejected, 0);
  const counts = countLevels(result.points);
  assert.deepEqual(counts, { baixa: 1000, media: 667, alta: 333 });
  assert.throws(() => createDemoData(2001), RangeError);
});

test("as letras brancas dos marcadores têm contraste WCAG AA de pelo menos 4.5:1", () => {
  const luminance = (hex) => {
    const channels = hex
      .slice(1)
      .match(/../g)
      .map((v) => parseInt(v, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const level of Object.values(VULNERABILITY_LEVELS)) {
    assert.ok(1.05 / (luminance(level.color) + 0.05) >= 4.5, level.label);
    assert.ok(level.letter);
  }
});

test("o exemplo para integração segue o mesmo contrato", async () => {
  const example = JSON.parse(
    await readFile(
      new URL("../docs/pontos-exemplo.geojson", import.meta.url),
      "utf8",
    ),
  );
  const result = parseRiskData(example);
  assert.equal(result.points.length, 3);
  assert.equal(result.rejected, 0);
});
