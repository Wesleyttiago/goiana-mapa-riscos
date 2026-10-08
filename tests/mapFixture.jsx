import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import GoianaRiskMap from "../src/map/GoianaRiskMap.jsx";
import { createDemoData } from "../src/data/demoData.js";

function Fixture() {
  const ref = useRef(null);
  const [data, setData] = useState(() => createDemoData(2000));
  const [ready, setReady] = useState({ total: 0 });
  const [selected, setSelected] = useState("");
  return (
    <>
      <button onClick={() => setData(createDemoData(2000))}>
        Recarregar 2000
      </button>
      <button onClick={() => setData(createDemoData(20))}>Carregar 20</button>
      <button onClick={() => setData(createDemoData(0))}>Esvaziar</button>
      <button onClick={() => setData(null)}>Contrato inválido</button>
      <button
        onClick={() => {
          const next = createDemoData(1);
          next.features[0].properties.titulo =
            '<img src=x onerror="document.body.dataset.injected=1">';
          setData(next);
        }}
      >
        Testar texto inseguro
      </button>
      <button onClick={() => ref.current.focusPoint("DEMO-0001")}>
        Focar primeiro ponto
      </button>
      <output id="fixture-ready">{JSON.stringify(ready)}</output>
      <output id="fixture-selection">{selected}</output>
      <GoianaRiskMap
        ref={ref}
        data={data}
        onReady={setReady}
        onPointSelect={(point) => setSelected(point.id)}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Fixture />
  </React.StrictMode>,
);
