/**
 * Revisão educativa de cada desafio da Batalha, mostrada SÓ depois do fim da partida
 * (o banco devolve review_data apenas quando a partida terminou). Explica a ideia e os
 * erros comuns, sem código pronto: a solução de referência continua privada.
 * `study` são termos usados para sugerir aulas da plataforma.
 */
export interface ChallengeReview {
  idea: string;
  steps: string[];
  pitfalls: string[];
  study: string[];
}

export const BATTLE_REVIEWS: Record<string, ChallengeReview> = {
  "maior-de-dois": {
    idea: "Uma única comparação decide: se a for maior que b, a resposta é a; senão, é b.",
    steps: ["Compare a com b usando >.", "Devolva o vencedor da comparação (no empate, qualquer um serve)."],
    pitfalls: ["Esquecer o return e só imprimir o valor.", "Comparar textos em vez de números em linguagens que leem tudo como texto."],
    study: ["condicionais", "operadores"],
  },
  "par-ou-impar": {
    idea: "Um número é par quando o resto da divisão por 2 é zero.",
    steps: ["Calcule n % 2.", "Resto 0 → \"par\"; caso contrário → \"impar\"."],
    pitfalls: ["Negativos: em algumas linguagens -3 % 2 dá -1, então teste se o resto é zero, não se é 1.", "Escrever \"ímpar\" com acento."],
    study: ["condicionais", "operadores"],
  },
  "calcular-troco": {
    idea: "Troco é pago menos preço, desde que o pagamento cubra o preço.",
    steps: ["Se pago < preco, devolva -1.", "Senão, devolva pago - preco."],
    pitfalls: ["Inverter a subtração.", "Tratar pagamento exato como insuficiente (troco 0 é válido)."],
    study: ["condicionais", "variáveis"],
  },
  "conceito-da-nota": {
    idea: "Faixas de valores: teste da maior para a menor e pare na primeira que servir.",
    steps: ["nota >= 90 → A.", "senão nota >= 70 → B.", "senão nota >= 50 → C.", "senão → D."],
    pitfalls: ["Testar as faixas fora de ordem, fazendo 95 cair em B.", "Usar > no lugar de >= nos limites (90, 70, 50)."],
    study: ["condicionais", "else if"],
  },
  "soma-ate-n": {
    idea: "Um acumulador que começa em 0 e recebe cada número de 1 até n (ou a fórmula n × (n + 1) / 2).",
    steps: ["soma = 0.", "Para i de 1 até n, some i.", "Devolva soma."],
    pitfalls: ["Laço que para em n - 1.", "Começar a soma em 1 e errar o caso n = 0."],
    study: ["laços", "acumulador"],
  },
  "contar-letra": {
    idea: "Percorra o texto caractere por caractere e conte as igualdades.",
    steps: ["contador = 0.", "Para cada caractere do texto, se for igual à letra, some 1.", "Devolva o contador."],
    pitfalls: ["Comparar maiúscula com minúscula como se fossem iguais.", "Contar fora do laço."],
    study: ["strings", "laços"],
  },
  "quantos-digitos": {
    idea: "Cada divisão inteira por 10 remove um dígito; conte quantas divisões até chegar a 0.",
    steps: ["Trate n = 0 como 1 dígito.", "Enquanto n > 0: n = n / 10 (inteiro) e conte.", "Devolva a contagem."],
    pitfalls: ["Divisão com vírgula (use divisão inteira).", "Esquecer o caso zero."],
    study: ["while", "divisão inteira"],
  },
  "palavra-ao-contrario": {
    idea: "Monte um texto novo lendo a palavra do último caractere para o primeiro.",
    steps: ["Comece com um texto vazio.", "Percorra do índice tamanho - 1 até 0, juntando cada caractere.", "Devolva o resultado."],
    pitfalls: ["Começar no índice tamanho (fora da palavra).", "Parar antes do índice 0."],
    study: ["strings", "índices"],
  },
  "soma-dos-pares": {
    idea: "Filtrar e acumular: some só os itens com resto 0 na divisão por 2.",
    steps: ["soma = 0.", "Para cada x da lista, se x % 2 == 0, some x.", "Devolva soma."],
    pitfalls: ["Negativos pares (-4 % 2 é 0, mas teste igualdade com zero).", "Somar as posições pares em vez dos valores pares."],
    study: ["arrays", "filter", "laços"],
  },
  "menor-e-maior": {
    idea: "Uma passada pela lista guardando o menor e o maior vistos até agora.",
    steps: ["Comece menor e maior com o primeiro item.", "Para cada item, atualize menor e maior.", "Devolva [menor, maior]."],
    pitfalls: ["Começar com 0, o que quebra listas só de negativos (ou só de positivos grandes).", "Inverter a ordem do resultado."],
    study: ["arrays", "laços"],
  },
  "acima-da-media": {
    idea: "Duas passadas: primeiro a soma, depois conte quem passa da média.",
    steps: ["Some todos os itens.", "Conte os x em que x × tamanho > soma (evita números com vírgula).", "Devolva a contagem."],
    pitfalls: ["Usar >= quando o enunciado pede estritamente maior.", "Divisão inteira na média arredondando errado."],
    study: ["arrays", "média"],
  },
  "segundo-maior-distinto": {
    idea: "Guarde o maior e o segundo maior, ignorando repetições do maior.",
    steps: ["Ache o maior valor.", "Ache o maior entre os valores menores que ele.", "Devolva esse segundo."],
    pitfalls: ["Ordenar e pegar o penúltimo sem tirar repetidos ([5, 9, 9] daria 9).", "Começar o segundo maior com 0 quando há negativos."],
    study: ["arrays", "ordenação"],
  },
  "palavra-mais-longa": {
    idea: "Separe a frase em palavras e guarde a mais longa, trocando só quando aparecer uma estritamente maior.",
    steps: ["Divida a frase pelo espaço.", "Percorra as palavras guardando a mais longa (troque só com >).", "Devolva a guardada."],
    pitfalls: ["Usar >= e devolver a última em caso de empate.", "Esquecer a última palavra ao montar manualmente."],
    study: ["strings", "split"],
  },
  "girar-lista": {
    idea: "Girar k vezes é o mesmo que girar k % tamanho; o novo início é a parte do fim.",
    steps: ["k = k % tamanho (cuidado com lista vazia).", "Resultado = últimos k itens + os primeiros tamanho - k."],
    pitfalls: ["k maior que o tamanho.", "Girar para a esquerda em vez da direita."],
    study: ["arrays", "resto da divisão"],
  },
  "colchetes-balanceados": {
    idea: "Uma pilha: quem abre entra; quem fecha precisa combinar com o topo.",
    steps: ["Para cada símbolo de abertura, empilhe.", "Para cada fechamento, a pilha não pode estar vazia e o topo precisa ser o par correspondente.", "No fim, a pilha precisa estar vazia."],
    pitfalls: ["Só contar aberturas e fechamentos (aceitaria \"([)]\").", "Não checar a pilha vazia no final (aceitaria \"((\")."],
    study: ["pilha", "estruturas de dados"],
  },
  "busca-na-lista-ordenada": {
    idea: "Busca binária: compare com o meio e descarte a metade em que o alvo não pode estar.",
    steps: ["inicio = 0, fim = tamanho - 1.", "Enquanto inicio <= fim: compare v[meio] com o alvo e mova inicio ou fim.", "Sem achar, devolva -1."],
    pitfalls: ["Laço infinito por não mover inicio/fim além do meio.", "Condição < em vez de <= e perder listas de um item."],
    study: ["busca binária", "algoritmos"],
  },
  "compactar-texto": {
    idea: "Conte sequências: enquanto a letra se repete, aumente o contador; quando muda, escreva letra + contagem.",
    steps: ["Percorra o texto comparando cada letra com a anterior.", "Ao mudar (e no fim), adicione a letra e a contagem.", "Devolva o texto montado."],
    pitfalls: ["Esquecer de escrever a última sequência.", "Texto vazio."],
    study: ["strings", "laços"],
  },
  "pares-que-somam": {
    idea: "Para cada número x, o par que falta é alvo - x. Um conjunto (Set/dicionário) diz na hora se ele já apareceu.",
    steps: ["Percorra a lista uma vez.", "Se alvo - x já está no conjunto, conte um par.", "Adicione x ao conjunto."],
    pitfalls: ["Dois laços aninhados: O(n²) estoura o tempo com 100 mil números.", "Contar o mesmo par duas vezes."],
    study: ["dicionário", "conjunto", "complexidade"],
  },
  "melhor-sequencia": {
    idea: "Algoritmo de Kadane: o melhor trecho que termina aqui é o item sozinho ou o item somado ao melhor trecho anterior.",
    steps: ["atual = melhor = primeiro item.", "Para cada item: atual = max(item, atual + item); melhor = max(melhor, atual).", "Devolva melhor."],
    pitfalls: ["Começar em 0 e errar listas só de negativos.", "Testar todos os trechos (O(n²))."],
    study: ["algoritmos", "complexidade"],
  },
  "contar-primos": {
    idea: "Crivo de Eratóstenes: marque os múltiplos de cada primo como não primos, de uma vez.",
    steps: ["Crie uma lista de verdadeiro até n.", "Para cada i a partir de 2 com i × i <= n, se i é primo, marque i×i, i×i+i, ... como falso.", "Conte os verdadeiros de 2 até n."],
    pitfalls: ["Testar divisores um por um para cada número (lento para 2 milhões).", "Contar 0 e 1 como primos."],
    study: ["algoritmos", "laços"],
  },
  "menor-caminho-no-labirinto": {
    idea: "Busca em largura (BFS): explora o labirinto em camadas de distância; a primeira vez que chega à saída é o menor caminho.",
    steps: ["Fila começando na entrada, com distância 1.", "Tire da fila, visite os vizinhos livres ainda não visitados com distância + 1.", "Ao chegar na saída, devolva a distância; fila vazia → sem caminho."],
    pitfalls: ["Busca em profundidade (DFS) não garante o menor caminho.", "Não marcar visitados e entrar em ciclo."],
    study: ["grafos", "fila", "busca em largura"],
  },
  "contar-ilhas": {
    idea: "Cada vez que encontrar terra não visitada, é uma ilha nova: visite toda a ilha (BFS/DFS) para não contá-la de novo.",
    steps: ["Percorra todas as casas.", "Terra não visitada: conte 1 e marque a ilha inteira como visitada.", "Devolva a contagem."],
    pitfalls: ["Considerar diagonais como ligação.", "Recursão profunda demais em mapas grandes (prefira uma fila)."],
    study: ["grafos", "busca em largura"],
  },
  "grupos-de-amigos": {
    idea: "União de conjuntos (union-find) ou busca em grafo: cada componente conectado é um grupo.",
    steps: ["Cada pessoa começa no próprio grupo.", "Para cada amizade, una os grupos das duas pessoas.", "Conte quantos representantes distintos sobraram."],
    pitfalls: ["Esquecer pessoas sem nenhuma amizade (cada uma é um grupo).", "Union-find sem compressão de caminho em entradas grandes."],
    study: ["grafos", "estruturas de dados"],
  },
  "formas-de-dar-troco": {
    idea: "Programação dinâmica: formas[v] acumula as formas de montar v usando as moedas vistas até agora (moeda por fora, valor por dentro, para não contar a ordem).",
    steps: ["formas[0] = 1, o resto 0.", "Para cada moeda, para v de moeda até valor: formas[v] += formas[v - moeda].", "Devolva formas[valor]."],
    pitfalls: ["Inverter os laços conta 1+2 e 2+1 como formas diferentes.", "Recursão sem memória (lenta)."],
    study: ["programação dinâmica", "arrays"],
  },
  "maior-subsequencia-comum": {
    idea: "Tabela dp[i][j] = tamanho da maior subsequência comum dos prefixos a[0..i) e b[0..j).",
    steps: ["Se a[i-1] == b[j-1]: dp[i][j] = dp[i-1][j-1] + 1.", "Senão: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).", "A resposta é dp[tamanho a][tamanho b]."],
    pitfalls: ["Confundir subsequência com trecho contínuo.", "Índices deslocados ao montar a tabela."],
    study: ["programação dinâmica", "strings"],
  },
  "mochila": {
    idea: "Mochila 0/1: melhor[c] = maior valor com capacidade c; cada item é considerado uma vez, percorrendo c de trás para frente.",
    steps: ["melhor = lista de zeros até a capacidade.", "Para cada item, para c da capacidade até o peso do item: melhor[c] = max(melhor[c], melhor[c - peso] + valor).", "Devolva melhor[capacidade]."],
    pitfalls: ["Percorrer c para frente usa o mesmo item várias vezes.", "Escolher só pelo maior valor por peso (guloso não funciona aqui)."],
    study: ["programação dinâmica"],
  },
  "maior-subsequencia-crescente": {
    idea: "Guarde, para cada tamanho, o menor final possível de uma subsequência crescente; a busca binária acha onde cada número entra (O(n log n)).",
    steps: ["Lista de finais vazia.", "Para cada x: ache a primeira posição com final >= x (busca binária); substitua ou adicione no fim.", "O tamanho da lista é a resposta."],
    pitfalls: ["Usar > em vez de >= e aceitar números iguais (precisa ser estritamente crescente).", "Solução O(n²) estoura o tempo nas entradas grandes."],
    study: ["busca binária", "programação dinâmica"],
  },
  "salas-de-reuniao": {
    idea: "Ordene inícios e fins separadamente e varra o tempo: cada início ocupa uma sala, cada fim libera uma; o pico é a resposta.",
    steps: ["Ordene os inícios e os fins.", "Avance com dois ponteiros: se o próximo início é menor que o próximo fim, mais uma sala; senão, libere uma.", "Guarde o maior número de salas ocupadas."],
    pitfalls: ["Tratar fim e início no mesmo instante como conflito (o enunciado diz que libera).", "Comparar cada par de reuniões (O(n²))."],
    study: ["ordenação", "algoritmos"],
  },
  "subarrays-com-soma-k": {
    idea: "Somas de prefixo: um trecho soma k quando prefixo_atual - prefixo_anterior = k. Um dicionário conta quantas vezes cada prefixo já apareceu.",
    steps: ["contagem = {0: 1}, soma = 0, resposta = 0.", "Para cada x: soma += x; resposta += contagem[soma - k]; contagem[soma] += 1.", "Devolva resposta."],
    pitfalls: ["Janela deslizante não funciona com números negativos.", "Esquecer o prefixo vazio (contagem[0] = 1)."],
    study: ["dicionário", "somas de prefixo", "algoritmos"],
  },
};
