# Integrar o RF03

O componente fica em `src/map/GoianaRiskMap.jsx`. Copie a pasta `src/map` para o projeto React do grupo.

Instale as bibliotecas:

```bash
npm install leaflet@1.9.4 leaflet.markercluster@1.5.3
```

Passe uma coleção GeoJSON na propriedade `data`:

```jsx
import GoianaRiskMap from './map/GoianaRiskMap.jsx';

<GoianaRiskMap
  data={pontosGeoJSON}
  onPointSelect={(ponto) => console.log(ponto)}
  onReady={({ total, rejected, renderingMs }) => console.log(total, rejected, renderingMs)}
/>
```

Cada ponto precisa de `geometry.type: "Point"`, coordenadas **[longitude, latitude]** e `properties.vulnerabilidade` (`baixa`, `media` ou `alta`). O título e a descrição são opcionais. `id` pode ficar na Feature ou em `properties.id`; mantenha IDs únicos. Há um exemplo em `pontos-exemplo.geojson`.

As cores ficam em `src/map/riskModel.js`. Os pontos fictícios ficam em `src/data/demoData.js`; substitua a coleção por dados da API quando estiver pronta. A classificação é recebida nos dados, não calculada pelo mapa.

O `ref` expõe `resetView()`, `fitPoints()` e `focusPoint(id)`. `onPointSelect` entrega `{ id, title, description, vulnerability, position }`, com `position` no formato **[latitude, longitude]**. Esse retorno pode alimentar outras partes do painel depois.

O componente usa Leaflet 1.9.4 com MarkerCluster 1.5.3. Os pontos entram em lotes de 100 por quadro, com agrupamento e retirada dos elementos fora da área visível. A referência de validação é uma coleção de 2.000 pontos.

Não inclui mapa de calor, Data Grid ou filtros de data/tipo de risco. Esses são outros cartões do projeto.

O mapa base precisa de internet. Por padrão, usa os tiles do OpenStreetMap e mantém os créditos visíveis. `tileUrl` e `attribution` permitem trocar o provedor. Consulte a [política de uso](https://operations.osmfoundation.org/policies/tiles/) antes de usar em produção.

O visual da demonstração segue o [portal de Goiana](https://www.goiana.pe.gov.br/), com Montserrat, azul `#0e6dd8`, fundo `#f0f2f5` e o logotipo institucional. O componente do mapa funciona sem o cabeçalho da demo.
