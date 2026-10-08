# Verificação do RF03

Verificado em 08/10/2026:

- 7 testes de dados passaram; build e publicação no GitHub Pages passaram.
- 2.000 pontos carregados com agrupamento. Ao enquadrar todos, a soma dos grupos e pontos individuais permaneceu em 2.000.
- Zoom, agrupamentos por teclado, centralização e seleção de pontos funcionaram.
- As letras B/M/A acompanham as cores. O contraste de texto branco nos três marcadores atende 4,5:1.
- Sem rolagem horizontal nas larguras 320, 360, 390, 600, 768, 1.024 e 1.440 px, incluindo fonte aumentada.
- Troca de dados, coleção vazia, dados inválidos e texto inseguro foram verificados no componente.
- HTML, JavaScript, CSS, fonte e logotipo da página publicada responderam com status 200; os arquivos conferidos correspondem ao build local.

Os testes funcionais usaram tiles simulados para isolar o componente. Na máquina de teste, a carga de 2.000 pontos levou 406 ms e a maior tarefa inicial levou 107 ms; esses valores não são garantia de desempenho em qualquer dispositivo.

A prévia [mapa-demonstracao.jpg](mapa-demonstracao.jpg) foi capturada no build local com os 15 tiles originais do OpenStreetMap solicitados pela área visível, 65 grupos e 50 marcadores individuais. Os PNGs foram obtidos por HTTP e entregues ao navegador de teste por um proxy local, pois a conexão direta desse navegador não completou as imagens. Os arquivos do build foram comparados com os publicados no Pages. A sessão do navegador público abriu a aplicação, mas perdeu a conexão durante a conferência final.
