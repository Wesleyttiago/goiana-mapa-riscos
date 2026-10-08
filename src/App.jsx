import { useCallback, useMemo, useRef, useState } from "react";
import logo from "./assets/goiana-logo.png";
import GoianaRiskMap from "./map/GoianaRiskMap.jsx";
import {
  VULNERABILITY_LEVELS,
  countLevels,
  parseRiskData,
} from "./map/riskModel.js";
import { createDemoData } from "./data/demoData.js";

const REPOSITORY = "https://github.com/Wesleyttiago/goiana-mapa-riscos";
const PORTAL = "https://www.goiana.pe.gov.br/";

function Icon({ name, size = 18 }) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9M9 21v-7h6v7" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    reset: (
      <>
        <path d="M3 11a9 9 0 1 1 2 7M3 4v7h7" />
      </>
    ),
    bounds: (
      <>
        <path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
    arrow: (
      <>
        <path d="M7 17 17 7M7 7h10v10" />
      </>
    ),
    code: (
      <>
        <path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 20" />
      </>
    ),
    contrast: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function App() {
  const mapRef = useRef(null);
  const [fontScale, setFontScale] = useState(1);
  const [contrast, setContrast] = useState(false);
  const [ready, setReady] = useState(false);
  const data = useMemo(() => createDemoData(2000), []);
  const counts = useMemo(() => countLevels(parseRiskData(data).points), [data]);
  const handleReady = useCallback(() => setReady(true), []);

  return (
    <div
      className="app"
      data-contrast={contrast}
      style={{ "--font-scale": fontScale }}
    >
      <a className="skip-link" href="#conteudo">
        Ir para o mapa
      </a>
      <header className="site-header">
        <div className="topbar">
          <div className="header-width topbar-inner">
            <span>
              PROJETO ACADÊMICO <span className="topbar-divider">/</span> RF03
            </span>
            <a href={REPOSITORY} target="_blank" rel="noopener noreferrer">
              <Icon name="code" size={14} /> CÓDIGO-FONTE
            </a>
          </div>
        </div>
        <nav className="header-width main-nav" aria-label="Navegação principal">
          <a href={PORTAL} target="_blank" rel="noopener noreferrer">
            A PREFEITURA <Icon name="arrow" size={13} />
          </a>
          <a href="#conteudo" className="active" aria-current="page">
            MAPA DE RISCOS
          </a>
          <a href="#legenda">LEGENDA</a>
          <a href="#orientacoes">ORIENTAÇÕES</a>
        </nav>
        <div className="header-width brand-row">
          <a
            href={PORTAL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir o portal oficial da Prefeitura de Goiana"
            className="logo-frame"
          >
            <img
              src={logo}
              width="147"
              height="76"
              alt="Goiana — Crescendo juntos, cuidando da gente"
            />
          </a>
          <div
            className="accessibility"
            role="group"
            aria-label="Acessibilidade"
          >
            <div className="accessibility-buttons">
              <button
                type="button"
                aria-label="Aumentar fonte"
                onClick={() =>
                  setFontScale((value) => Math.min(1.3, value + 0.1))
                }
                disabled={fontScale >= 1.29}
              >
                A<span>+</span>
              </button>
              <button
                type="button"
                aria-label="Diminuir fonte"
                onClick={() =>
                  setFontScale((value) => Math.max(1, value - 0.1))
                }
                disabled={fontScale <= 1}
              >
                A<span>−</span>
              </button>
              <button
                type="button"
                aria-label="Alto contraste"
                aria-pressed={contrast}
                onClick={() => setContrast((value) => !value)}
              >
                <Icon name="contrast" size={18} />
              </button>
              <button
                type="button"
                aria-label="Restaurar acessibilidade"
                onClick={() => {
                  setFontScale(1);
                  setContrast(false);
                }}
              >
                <Icon name="reset" size={17} />
              </button>
            </div>
            <span>ACESSIBILIDADE</span>
          </div>
          <div className="header-module">
            <Icon name="pin" size={21} />
            <div>
              <strong>Mapa de riscos</strong>
              <span>GOIANA · PERNAMBUCO</span>
            </div>
          </div>
        </div>
      </header>

      <main id="conteudo" className="page-width" tabIndex={-1}>
        <nav className="breadcrumb" aria-label="Você está em">
          <a href={PORTAL} target="_blank" rel="noopener noreferrer">
            <Icon name="home" size={15} />
            <span>Prefeitura de Goiana</span>
          </a>
          <span aria-hidden="true">›</span>
          <span>Mapa de riscos</span>
        </nav>
        <div className="page-heading">
          <h1>Mapa de riscos</h1>
          <p>Visualização de pontos por nível de vulnerabilidade.</p>
        </div>
        <div className="demo-notice">
          <Icon name="info" size={18} />
          <p>
            <strong>Dados de demonstração.</strong> Os pontos e níveis de
            vulnerabilidade são fictícios.
          </p>
        </div>

        <section className="map-panel" aria-labelledby="map-title">
          <header className="map-panel-header">
            <div>
              <h2 id="map-title">
                <Icon name="pin" size={20} />
                Goiana <span>PE</span>
              </h2>
              <p role="status">
                {ready
                  ? "2.000 pontos de demonstração no mapa"
                  : "Preparando os pontos de demonstração…"}
              </p>
            </div>
            <div className="map-actions">
              <button
                type="button"
                onClick={() => mapRef.current?.fitPoints()}
                disabled={!ready}
              >
                <Icon name="bounds" size={16} />
                <span>Ver todos os pontos</span>
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => mapRef.current?.resetView()}
              >
                <Icon name="reset" size={16} />
                <span>Centralizar em Goiana</span>
              </button>
            </div>
          </header>
          <GoianaRiskMap ref={mapRef} data={data} onReady={handleReady} />
          <div id="legenda" className="legend">
            <div className="legend-heading">
              <h3>Níveis de vulnerabilidade</h3>
              <p>Cor e letra identificam cada nível.</p>
            </div>
            <ul>
              {Object.entries(VULNERABILITY_LEVELS).map(([key, level]) => (
                <li key={key}>
                  <span
                    className="legend-marker"
                    style={{ backgroundColor: level.color }}
                    aria-hidden="true"
                  >
                    {level.letter}
                  </span>
                  <div>
                    <strong>{level.label}</strong>
                    <span>{counts[key].toLocaleString("pt-BR")} pontos</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="cluster-note">
            <span className="cluster-example" aria-hidden="true">
              12
            </span>
            <span>
              Os números azuis indicam pontos agrupados. Clique para aproximar e
              visualizar os marcadores.
            </span>
          </p>
        </section>

        <details id="orientacoes" className="instructions">
          <summary>
            <Icon name="info" size={17} />
            Como usar o mapa<span aria-hidden="true">+</span>
          </summary>
          <ol>
            <li>
              Arraste o mapa para navegar. Use os botões + e − para mudar o
              zoom.
            </li>
            <li>
              Clique em um grupo azul para ver seus pontos. Na maior
              aproximação, pontos sobrepostos se abrem ao redor do grupo.
            </li>
            <li>
              Clique em um marcador para consultar seu nível de vulnerabilidade.
              Pelo teclado, use Tab, Enter e as setas.
            </li>
          </ol>
        </details>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-inner">
          <div>
            <strong>Mapa de riscos de Goiana</strong>
            <p>
              Projeto acadêmico · RF03 · Sem vínculo oficial com a prefeitura.
            </p>
          </div>
          <a href={REPOSITORY} target="_blank" rel="noopener noreferrer">
            Ver o projeto no GitHub <Icon name="arrow" size={17} />
          </a>
        </div>
      </footer>
    </div>
  );
}
