## Visão geral

Um jogo pequeno e completo chama atenção num portfólio porque qualquer pessoa entende em 10 segundos: abre o link e joga. Por trás, ele exercita orientação a objetos, laço de atualização, entrada do teclado, colisão e organização de estado.

Pré-requisitos: trilha de **JavaScript** e, de preferência, a trilha **Jogos com HTML5 Canvas**.

## Requisitos

- Laço com `requestAnimationFrame` usando o tempo entre quadros (`dt`) no movimento.
- Classes para jogador, inimigos e itens, cada uma com `update(dt)` e `draw(ctx)`.
- Colisão por retângulos (AABB).
- Pontuação, vidas, pausa com a tecla P e tela de game over com "jogar de novo".
- Recorde salvo no `localStorage`.
- Controles na tela para celular.

## Etapas

1. Desenhe um retângulo que anda com as setas. Só isso, mas com `dt`.
2. Transforme o jogador numa classe e crie um inimigo que cai do topo.
3. Adicione colisão, vidas e pontuação.
4. Crie os estados do jogo: `menu`, `jogando`, `pausado`, `fim`.
5. Troque os retângulos por sprites (use artes gratuitas com licença livre, como as do Kenney).
6. Ajuste a dificuldade com alguém jogando do seu lado e publique.

## Código de partida

```js
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const teclas = new Set();
addEventListener("keydown", (e) => teclas.add(e.key));
addEventListener("keyup", (e) => teclas.delete(e.key));

class Jogador {
  constructor() {
    this.x = 50;
    this.y = canvas.height - 60;
    this.w = 40;
    this.h = 40;
    this.velocidade = 260; // pixels por segundo
  }
  update(dt) {
    if (teclas.has("ArrowLeft")) this.x -= this.velocidade * dt;
    if (teclas.has("ArrowRight")) this.x += this.velocidade * dt;
    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
  }
  draw() {
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

const colide = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const jogador = new Jogador();
let anterior = performance.now();

function quadro(agora) {
  const dt = Math.min(0.05, (agora - anterior) / 1000);
  anterior = agora;
  jogador.update(dt);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  jogador.draw();
  requestAnimationFrame(quadro);
}
requestAnimationFrame(quadro);

export { colide };
```

## Melhorias opcionais

- Fases com dificuldade crescente.
- Efeitos sonoros com Web Audio e opção de silenciar.
- Placar online com o Supabase.

## Como apresentar no currículo

Jogos mostram lógica e capricho. Coloque o link no topo do README com um GIF.

> **[Nome do jogo] (JavaScript + Canvas)** — jogo 2D publicado com game loop independente da taxa de quadros, colisão AABB, estados de jogo e controles para teclado e toque. [jogar] · [repositório]

Mesmo para vagas que não têm nada a ver com jogos, ele é um ótimo assunto de entrevista: explique o `dt` e por que o jogo roda igual em monitores de 60 Hz e 144 Hz.
