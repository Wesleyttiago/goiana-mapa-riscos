import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import {
  GOIANA_CENTER,
  VULNERABILITY_LEVELS,
  parseRiskData,
} from "./riskModel.js";
import "./map.css";

const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

function createPointIcon(level) {
  const { color, letter } = VULNERABILITY_LEVELS[level];
  return L.divIcon({
    className: "risk-point-icon",
    html: `<svg viewBox="0 0 36 44" aria-hidden="true"><path d="M18 2C9.2 2 2 9.2 2 18c0 12 16 24 16 24s16-12 16-24C34 9.2 26.8 2 18 2Z" fill="${color}" stroke="#fff" stroke-width="3"/><circle cx="18" cy="18" r="16" fill="none" stroke="#1b2737" stroke-width="1.2"/><text x="18" y="23" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="15" font-weight="700">${letter}</text></svg>`,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -36],
  });
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  const icon = L.divIcon({
    html: `<span class="risk-cluster-number">${count}</span>`,
    className: "risk-cluster-icon",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
  const createIcon = icon.createIcon.bind(icon);
  // O rótulo é recriado junto com o ícone quando o grupo muda de tamanho.
  icon.createIcon = (oldIcon) => {
    const element = createIcon(oldIcon);
    element.setAttribute("role", "button");
    element.setAttribute(
      "aria-label",
      `${count} pontos agrupados. Ative para aproximar o mapa.`,
    );
    return element;
  };
  return icon;
}

function createPopup(point) {
  const definition = VULNERABILITY_LEVELS[point.vulnerability];
  const element = document.createElement("article");
  element.className = "risk-popup";
  const label = document.createElement("span");
  label.className = "risk-popup-id";
  label.textContent = point.id;
  const title = document.createElement("h3");
  title.textContent = point.title;
  const level = document.createElement("p");
  level.className = "risk-popup-level";
  const badge = document.createElement("span");
  badge.className = "risk-popup-letter";
  badge.style.backgroundColor = definition.color;
  badge.textContent = definition.letter;
  level.append(
    badge,
    document.createTextNode(
      `Vulnerabilidade ${definition.label.toLowerCase()}`,
    ),
  );
  const description = document.createElement("p");
  description.textContent = point.description;
  const coordinates = document.createElement("small");
  coordinates.textContent = `${point.position[0].toFixed(5)}, ${point.position[1].toFixed(5)}`;
  element.append(label, title, level, description, coordinates);
  return element;
}

const GoianaRiskMap = forwardRef(function GoianaRiskMap(
  {
    data,
    center = GOIANA_CENTER,
    initialZoom = 13,
    tileUrl = DEFAULT_TILE_URL,
    attribution = DEFAULT_ATTRIBUTION,
    onPointSelect,
    onReady,
  },
  ref,
) {
  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const groupRef = useRef(null);
  const markersRef = useRef(new Map());
  const callbacksRef = useRef({ onPointSelect, onReady });
  const parsed = useMemo(() => parseRiskData(data), [data]);
  const [status, setStatus] = useState({ loading: true, loaded: 0 });
  const [tileError, setTileError] = useState(false);
  const [latitude, longitude] = center;

  useEffect(() => {
    callbacksRef.current = { onPointSelect, onReady };
  }, [onPointSelect, onReady]);

  useImperativeHandle(
    ref,
    () => ({
      resetView: () =>
        mapRef.current?.setView([latitude, longitude], initialZoom),
      fitPoints: () => {
        const bounds = groupRef.current?.getBounds();
        if (bounds?.isValid())
          mapRef.current?.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
      },
      focusPoint: (id) => {
        const marker = markersRef.current.get(String(id));
        if (!marker || !groupRef.current) return false;
        groupRef.current.zoomToShowLayer(marker, () => {
          marker.openPopup();
          marker.getElement()?.focus();
        });
        return true;
      },
    }),
    [latitude, longitude, initialZoom],
  );

  useEffect(() => {
    const map = L.map(hostRef.current, {
      zoomControl: false,
      minZoom: 3,
      maxZoom: 19,
      scrollWheelZoom: false,
      keyboard: true,
      fadeAnimation: false,
      zoomAnimation: !window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
      markerZoomAnimation: !window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches,
    }).setView([latitude, longitude], initialZoom);
    mapRef.current = map;
    const failedTiles = new Set();
    setTileError(false);
    const tiles = L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
    tiles.on("tileerror", ({ tile }) => {
      failedTiles.add(tile.src);
      setTileError(true);
    });
    const forgetFailure = ({ tile }) => {
      failedTiles.delete(tile.src);
      setTileError(failedTiles.size > 0);
    };
    tiles.on("tileload", forgetFailure);
    tiles.on("tileunload", forgetFailure);
    L.control
      .zoom({
        position: "topright",
        zoomInTitle: "Aumentar zoom",
        zoomOutTitle: "Diminuir zoom",
        zoomInText:
          '<span aria-hidden="true">+</span><span class="map-sr-only">Aumentar zoom</span>',
        zoomOutText:
          '<span aria-hidden="true">−</span><span class="map-sr-only">Diminuir zoom</span>',
      })
      .addTo(map);
    const group = L.markerClusterGroup({
      maxClusterRadius: 42,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      animate: false,
      iconCreateFunction: createClusterIcon,
    }).addTo(map);
    groupRef.current = group;
    map.on("layeradd", ({ layer }) => {
      const element = layer.getElement?.();
      if (
        !element ||
        (!layer.options?.title && typeof layer.getChildCount !== "function")
      )
        return;
      const label =
        typeof layer.getChildCount === "function"
          ? `${layer.getChildCount()} pontos agrupados. Ative para aproximar o mapa.`
          : layer.options.title;
      element.setAttribute("aria-label", label);
      element.setAttribute("role", "button");
    });
    const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resize.observe(hostRef.current);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
      groupRef.current = null;
      markersRef.current.clear();
    };
  }, [latitude, longitude, initialZoom, tileUrl, attribution]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    markersRef.current.clear();
    setStatus({ loading: parsed.points.length > 0, loaded: 0 });
    const icons = Object.fromEntries(
      Object.keys(VULNERABILITY_LEVELS).map((level) => [
        level,
        createPointIcon(level),
      ]),
    );
    const started = performance.now();
    let offset = 0;
    let frame;
    let active = true;
    // Lotes pequenos liberam o navegador entre as etapas e podem ser cancelados.
    const addBatch = () => {
      if (!active) return;
      const batch = parsed.points.slice(offset, offset + 100).map((point) => {
        const definition = VULNERABILITY_LEVELS[point.vulnerability];
        const marker = L.marker(point.position, {
          icon: icons[point.vulnerability],
          title: `${point.title}. Vulnerabilidade ${definition.label.toLowerCase()}.`,
          keyboard: true,
          riseOnHover: true,
        });
        marker.bindPopup(() => createPopup(point), {
          maxWidth: 280,
          minWidth: 180,
        });
        marker.on("click", () => callbacksRef.current.onPointSelect?.(point));
        markersRef.current.set(point.id, marker);
        return marker;
      });
      group.addLayers(batch);
      offset += batch.length;
      const loading = offset < parsed.points.length;
      setStatus({ loading, loaded: offset });
      if (loading) frame = requestAnimationFrame(addBatch);
      else
        callbacksRef.current.onReady?.({
          total: offset,
          rejected: parsed.rejected,
          renderingMs: performance.now() - started,
        });
    };
    frame = requestAnimationFrame(addBatch);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      group.clearLayers();
      markersRef.current.clear();
    };
  }, [parsed, latitude, longitude, initialZoom, tileUrl, attribution]);

  return (
    <div
      className="risk-map-shell"
      data-ready={!status.loading}
      data-point-count={status.loaded}
    >
      <div
        ref={hostRef}
        className="risk-map"
        role="region"
        aria-label="Mapa interativo de Goiana. Use as setas para mover e as teclas mais e menos para aproximar."
        tabIndex={0}
      />
      {status.loading && (
        <p className="map-message" role="status">
          Carregando pontos… {status.loaded.toLocaleString("pt-BR")}
        </p>
      )}
      {parsed.issue && (
        <p className="map-message map-error" role="alert">
          {parsed.issue}
        </p>
      )}
      {!parsed.issue && !status.loading && parsed.points.length === 0 && (
        <p className="map-message" role="status">
          Nenhum ponto informado.
        </p>
      )}
      {tileError && (
        <p className="map-tile-error" role="status">
          O mapa base não carregou por completo. Confira sua conexão.
        </p>
      )}
      {parsed.rejected > 0 && (
        <p className="map-data-note" role="status">
          {parsed.rejected} registro(s) inválido(s) ignorado(s).
        </p>
      )}
    </div>
  );
});

export default GoianaRiskMap;
