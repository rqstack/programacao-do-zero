<!-- aula: primeiros-passos-em-python -->
## Por que isso importa

Python é uma das linguagens mais usadas do mundo: automação de tarefas, análise de dados, inteligência artificial, APIs web e scripts do dia a dia. A sintaxe é limpa e lembra inglês, então dá para focar na lógica em vez de brigar com símbolos. Começar bem (instalar, rodar e entender tipos) evita a maior parte das dúvidas que travam iniciantes.

## Conceitos fundamentais

- **Instalação**: baixe em python.org (no Windows, marque *Add python.exe to PATH*). Confira com `python --version` no terminal.
- **Duas formas de rodar**: o **modo interativo** (digite `python` e teste linha por linha) e **arquivos `.py`** (`python programa.py`).
- **Variáveis** não precisam de declaração de tipo: o tipo vem do valor. `nome = "Ana"` cria uma variável de texto.
- **Tipos básicos**: `int` (inteiros), `float` (números com casas decimais), `str` (texto) e `bool` (`True` ou `False`). A função `type()` mostra o tipo.
- **`print()`** mostra valores; vários argumentos saem separados por espaço.
- **f-strings**: `f"Olá, {nome}"` coloca o valor da variável dentro do texto.
- **`input()`** lê o que a pessoa digita e **sempre devolve texto**. Para fazer contas, converta: `int(input("Idade: "))`.
- **Indentação faz parte da linguagem**: blocos são definidos por espaços (4 por nível), não por chaves.
- **Comentários** começam com `#`.

## Exemplo prático

```python
nome = "Ana"
idade = 17
altura = 1.62
estuda = True

print("Olá,", nome)
print(f"{nome} tem {idade} anos e {altura} m de altura.")
print(type(idade), type(altura), type(nome), type(estuda))
print("Ano que vem:", idade + 1)

# input() devolve texto: "17" + 1 daria erro, por isso convertemos
digitado = "17"
print(int(digitado) + 1)
```

Saída:

```texto
Olá, Ana
Ana tem 17 anos e 1.62 m de altura.
<class 'int'> <class 'float'> <class 'str'> <class 'bool'>
Ano que vem: 18
18
```

## Explicando o código

- As quatro primeiras linhas criam variáveis de tipos diferentes. O Python descobre o tipo pelo valor: aspas viram `str`, número com ponto vira `float`.
- `print("Olá,", nome)` junta os argumentos com um espaço.
- A f-string monta a frase com os valores no lugar das chaves.
- `type()` confirma o tipo de cada variável.
- `digitado` imita o que `input()` devolveria: um texto. `int(digitado)` converte para número antes da soma.

## Erros comuns

- **Somar texto com número**: `"17" + 1` causa `TypeError`. Converta com `int()` ou `float()`.
- **Indentação misturada** (espaços e tabs) ou fora do lugar: `IndentationError`.
- **Esquecer as aspas** em textos: o Python acha que é o nome de uma variável e dá `NameError`.
- **Usar vírgula decimal**: em Python é `1.62`, não `1,62`.

## Resumo

- Rode Python no modo interativo ou com `python arquivo.py`.
- Tipos básicos: `int`, `float`, `str`, `bool`; `type()` mostra o tipo.
- `input()` devolve texto; converta antes de calcular. f-strings formatam mensagens.

## Próximo passo

Na próxima aula, você vai trabalhar com **números e textos** em detalhe: operadores, arredondamento e os métodos de string mais usados.

<!-- aula: numeros-e-strings -->
## Por que isso importa

Quase todo programa calcula algo ou manipula texto: somar uma compra, formatar um preço, limpar um nome digitado com espaços sobrando. Conhecer os operadores e os métodos de string do Python poupa dezenas de linhas de código e evita erros clássicos com números decimais.

## Conceitos fundamentais

- **Operadores**: `+ - * /` (a divisão `/` sempre devolve `float`), `//` (divisão inteira), `%` (resto) e `**` (potência).
- **Ponto flutuante**: números decimais são guardados em binário, então `0.1 + 0.2` dá `0.30000000000000004`. Para mostrar, formate (`f"{x:.2f}"`); para dinheiro de verdade, use centavos inteiros ou o módulo `decimal`.
- **`round(x, 2)`** arredonda; **`abs()`**, **`min()`**, **`max()`** e **`sum()`** são funções prontas.
- **Strings são imutáveis**: métodos como `upper()` devolvem um **novo** texto.
- **Métodos úteis**: `strip()` (tira espaços das pontas), `lower()`/`upper()`, `replace()`, `split()` (quebra em lista), `join()` (junta uma lista), `count()`, `startswith()`, `find()`.
- **Fatiamento** (*slicing*): `texto[0:8]` pega do índice 0 até antes do 8; índices negativos contam do fim (`texto[-1]` é o último caractere).
- **`len()`** devolve o tamanho.
- **Formatação**: `f"{valor:.2f}"` (2 casas), `f"{n:>5}"` (alinha à direita em 5 posições), `f"{n:,}"` (separador de milhar).

## Exemplo prático

```python
preco = 49.9
quantidade = 3
total = preco * quantidade
print(total)
print(f"Total: R$ {total:.2f}")
print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
print(7 / 2, 7 // 2, 7 % 2, 2 ** 10)

frase = "  Aprender Python é divertido  "
limpa = frase.strip()
print(limpa.upper())
print(limpa.lower().count("e"))
print(limpa.replace("divertido", "muito útil"))
print(limpa[0:8], "|", limpa[-9:])
print(limpa.split())
print("-".join(["a", "b", "c"]))
print(len(frase), len(limpa))
```

Saída:

```texto
149.7
Total: R$ 149.70
0.30000000000000004
0.3
3.5 3 1 1024
APRENDER PYTHON É DIVERTIDO
3
Aprender Python é muito útil
Aprender | divertido
['Aprender', 'Python', 'é', 'divertido']
a-b-c
31 27
```

## Explicando o código

- `49.9 * 3` dá `149.7`, e a f-string com `:.2f` mostra sempre duas casas (`149.70`), como se espera de um preço.
- `0.1 + 0.2` mostra o efeito do ponto flutuante: aparece uma "sujeira" nas últimas casas. `round(..., 2)` resolve na hora de exibir.
- A linha dos operadores mostra a diferença entre `/` (3.5), `//` (3) e `%` (resto 1).
- `strip()` tira os espaços das pontas; repare que `len(frase)` é maior que `len(limpa)`.
- `limpa.lower().count("e")` encadeia dois métodos: primeiro tudo minúsculo, depois a contagem.
- `limpa[0:8]` pega "Aprender" e `limpa[-9:]` pega os 9 últimos caracteres.
- `split()` sem argumento quebra nos espaços; `"-".join(...)` faz o caminho inverso.

## Erros comuns

- **Comparar decimais com `==`**: `0.1 + 0.2 == 0.3` é `False`. Compare com tolerância (`abs(a - b) < 1e-9`) ou use inteiros.
- **Achar que `upper()` muda a variável**: é preciso guardar o resultado (`nome = nome.upper()`).
- **Índice fora do texto**: `texto[100]` dá `IndexError` (no fatiamento, `texto[0:100]` não dá erro).
- **Esquecer que `/` devolve `float`**: use `//` quando quiser só a parte inteira.

## Resumo

- `/`, `//`, `%` e `**`; decimais têm imprecisão de ponto flutuante.
- Strings são imutáveis; métodos devolvem textos novos.
- Fatiamento com `[início:fim]` e índices negativos; f-strings formatam números.

## Próximo passo

Com variáveis e textos dominados, é hora de fazer o programa **tomar decisões e repetir tarefas**.

<!-- aula: decisoes-e-repeticoes -->
## Por que isso importa

Um programa útil reage aos dados: aprova ou reprova, repete uma tarefa para cada item de uma lista, para quando encontra o que procurava. Condicionais e laços são a base de qualquer algoritmo, e em Python eles são especialmente legíveis.

## Conceitos fundamentais

- **`if` / `elif` / `else`**: testa condições na ordem e executa o primeiro bloco verdadeiro. Não há parênteses obrigatórios nem chaves, só `:` e indentação.
- **Comparações**: `==`, `!=`, `<`, `<=`, `>`, `>=`. **Lógicos**: `and`, `or`, `not`. Dá para encadear: `0 <= nota <= 10`.
- **Valores "falsos"**: `0`, `""`, `[]`, `{}` e `None` contam como falso num `if`.
- **`for`** percorre qualquer sequência (lista, texto, `range`). `range(1, 4)` gera 1, 2 e 3 (o fim não entra).
- **`while`** repete enquanto a condição for verdadeira; cuidado para a condição mudar, senão o laço nunca termina.
- **`break`** sai do laço; **`continue`** pula para a próxima volta.
- **`enumerate()`** dá índice e valor juntos: `for i, item in enumerate(lista)`.
- **`match`** (Python 3.10+) compara um valor com vários padrões, parecido com o `switch` de outras linguagens.

## Exemplo prático

```python
notas = [7.5, 4.0, 9.0, 6.0, 10.0]

for nota in notas:
    if nota >= 9:
        conceito = "A"
    elif nota >= 7:
        conceito = "B"
    elif nota >= 5:
        conceito = "C"
    else:
        conceito = "D"
    print(f"{nota:>4} -> {conceito}")

aprovados = 0
for nota in notas:
    if nota >= 6:
        aprovados += 1
print("Aprovados:", aprovados)

for i, nota in enumerate(notas, start=1):
    if nota < 6:
        continue
    print(f"Aluno {i} passou")

palpites = ["java", "c", "python", "go"]
tentativas = 0
while tentativas < len(palpites):
    palpite = palpites[tentativas]
    tentativas += 1
    if palpite == "python":
        print(f"Acertou em {tentativas} tentativas")
        break

comando = "sair"
match comando:
    case "ajuda":
        print("Mostrando a ajuda")
    case "sair" | "fim":
        print("Até logo!")
    case _:
        print("Comando desconhecido")
```

Saída:

```texto
 7.5 -> B
 4.0 -> D
 9.0 -> A
 6.0 -> C
10.0 -> A
Aprovados: 4
Aluno 1 passou
Aluno 3 passou
Aluno 4 passou
Aluno 5 passou
Acertou em 3 tentativas
Até logo!
```

## Explicando o código

- O primeiro `for` classifica cada nota; o `elif` só é testado se os de cima forem falsos, por isso a ordem (do maior para o menor) importa.
- `f"{nota:>4}"` alinha os números à direita, deixando a saída em colunas.
- O contador `aprovados` começa em 0 e soma 1 a cada nota suficiente.
- Com `enumerate(..., start=1)`, os alunos são numerados a partir de 1; o `continue` pula quem não passou.
- O `while` para no `break` assim que encontra o palpite certo, sem testar o resto.
- O `match` compara o comando com cada `case`; `|` aceita mais de uma opção e `_` pega todo o resto.

## Erros comuns

- **Esquecer os dois-pontos** no fim do `if`, `for` ou `while`: `SyntaxError`.
- **Usar `=` em vez de `==`** numa comparação.
- **Laço infinito**: um `while` cuja condição nunca fica falsa (esqueceu de atualizar o contador).
- **Achar que `range(1, 10)` inclui o 10**: o fim nunca entra.

## Resumo

- `if/elif/else` decide; `for` percorre sequências; `while` repete enquanto algo for verdadeiro.
- `break` e `continue` controlam o laço; `enumerate` dá índice e valor.
- `match` organiza muitas comparações de um mesmo valor.

## Próximo passo

Agora você vai guardar muitos valores organizados com as **estruturas de dados** do Python: listas, tuplas, dicionários e conjuntos.

<!-- aula: estruturas-de-dados -->
## Por que isso importa

Programas de verdade lidam com coleções: a lista de produtos de um carrinho, o estoque de cada item, as tags de um post. Escolher a estrutura certa deixa o código mais simples e mais rápido. Python tem quatro estruturas nativas que resolvem quase tudo.

## Conceitos fundamentais

- **Lista** (`list`): sequência ordenada e mutável. `append()` adiciona no fim, `insert()` numa posição, `remove()` tira pelo valor, `pop()` tira pelo índice. `sorted()` devolve uma cópia ordenada; `lista.sort()` ordena a própria lista.
- **Tupla** (`tuple`): sequência **imutável**, boa para dados fixos (coordenadas, datas). Permite **desempacotar**: `x, y = ponto`.
- **Dicionário** (`dict`): pares **chave → valor**, com busca rápida pela chave. `d["chave"]` dá erro se não existir; `d.get("chave", padrão)` não dá. `items()` percorre pares.
- **Conjunto** (`set`): itens **sem repetição** e sem ordem garantida. Ótimo para tirar duplicados e testar se algo pertence (`in`).
- **Compreensões** (*comprehensions*): `[n * n for n in range(5)]` cria uma lista numa linha; aceita filtro com `if`. Existem também para dicionários e conjuntos.
- **Cópia vs. referência**: `b = a` não copia uma lista, só cria outro nome para ela. Use `a.copy()` ou `list(a)`.

## Exemplo prático

```python
frutas = ["maçã", "banana", "uva"]
frutas.append("manga")
frutas.insert(0, "kiwi")
frutas.remove("banana")
print(frutas, len(frutas))
print(sorted(frutas))
print(frutas[1], frutas[-1])

ponto = (3, 4)
x, y = ponto
print(x, y)

estoque = {"caneta": 10, "caderno": 3}
estoque["borracha"] = 7
estoque["caderno"] -= 1
for item, qtd in estoque.items():
    print(f"{item}: {qtd}")
print(estoque.get("lápis", 0))

tags = {"python", "web", "python", "dados"}
print(len(tags), "python" in tags, "java" in tags)

quadrados = [n * n for n in range(1, 6)]
pares = [n for n in quadrados if n % 2 == 0]
precos = {"café": 5.5, "pão": 1.25}
com_desconto = {nome: round(p * 0.9, 2) for nome, p in precos.items()}
print(quadrados, pares)
print(com_desconto)

a = [1, 2, 3]
b = a
c = a.copy()
a.append(4)
print(b, c)
```

Saída:

```texto
['kiwi', 'maçã', 'uva', 'manga'] 4
['kiwi', 'manga', 'maçã', 'uva']
maçã manga
3 4
caneta: 10
caderno: 2
borracha: 7
0
3 True False
[1, 4, 9, 16, 25] [4, 16]
{'café': 4.95, 'pão': 1.12}
[1, 2, 3, 4] [1, 2, 3]
```

## Explicando o código

- A lista muda no lugar: depois do `append`, do `insert` e do `remove`, ela tem 4 frutas. `sorted()` mostra uma cópia ordenada sem alterar a original. Repare que "manga" veio antes de "maçã": a ordenação compara os códigos dos caracteres, e o `ç` vem depois do `n`. Para ordenar em português de verdade, use o módulo `locale`.
- A tupla `ponto` é desempacotada em `x` e `y` numa única linha.
- No dicionário, atribuir a uma chave nova cria o item; `-=` altera um existente. `get("lápis", 0)` devolve 0 em vez de dar erro.
- O conjunto descarta o "python" repetido, então tem 3 itens. A pertinência (`in`) é rápida mesmo com milhões de itens.
- As compreensões criam a lista de quadrados, filtram os pares e montam um dicionário com 10% de desconto (o pão ficou `1.12` porque `1.125` não é guardado exatamente em binário, outro efeito do ponto flutuante).
- `b = a` aponta para a mesma lista (por isso `b` também ganhou o 4), enquanto `c` é uma cópia independente.

## Erros comuns

- **Mudar uma lista enquanto percorre ela** com `for`: itens são pulados. Percorra uma cópia ou crie uma lista nova.
- **`KeyError`** ao acessar `d["chave"]` inexistente: use `get()` ou teste com `in`.
- **Esperar ordem em um `set`**.
- **Achar que `b = a` copia a lista**.

## Resumo

- Lista (ordenada, mutável), tupla (imutável), dicionário (chave → valor) e conjunto (sem repetição).
- Compreensões criam coleções de forma curta e legível.
- Atribuir uma lista a outra variável não copia: use `copy()`.

## Próximo passo

Com dados organizados, o próximo passo é organizar o **código**: funções, módulos e pacotes.

<!-- aula: funcoes-modulos-e-pacotes -->
## Por que isso importa

Copiar e colar o mesmo trecho em vários lugares é a receita para bugs: você corrige em um lugar e esquece do outro. Funções dão nome a uma tarefa e permitem reutilizá-la; módulos e pacotes organizam o projeto em arquivos e trazem o enorme ecossistema de bibliotecas do Python para o seu código.

## Conceitos fundamentais

- **`def`** cria uma função; **`return`** devolve o resultado (sem `return`, a função devolve `None`).
- **Parâmetros com valor padrão**: `def media(notas, minimo=6.0)`. Na chamada, dá para passar por nome: `media(notas, minimo=5)`.
- **Retornar vários valores**: `return media, aprovado` devolve uma tupla, que pode ser desempacotada.
- **`*args`** recebe qualquer quantidade de argumentos posicionais; **`**kwargs`**, argumentos nomeados.
- **Docstring**: o texto entre `"""` logo abaixo do `def` documenta a função.
- **Escopo**: variáveis criadas dentro da função só existem lá dentro.
- **Módulo** é um arquivo `.py`; **pacote** é uma pasta de módulos. `import math` ou `from math import sqrt`.
- **Biblioteca padrão**: `math`, `statistics`, `random`, `datetime`, `json`, `pathlib`, `csv` e muito mais, sem instalar nada.
- **`if __name__ == "__main__":`** marca o código que só roda quando o arquivo é executado diretamente (e não quando é importado).
- **Ambiente virtual e pip**: cada projeto ganha seu próprio ambiente com `python -m venv .venv`, e as bibliotecas externas são instaladas com `pip install nome`.

## Exemplo prático

```python
from math import sqrt
from statistics import mean


def calcular_media(notas, minimo=6.0):
    """Devolve a média (com 2 casas) e se a pessoa foi aprovada."""
    media = mean(notas)
    return round(media, 2), media >= minimo


def hipotenusa(a, b):
    return sqrt(a ** 2 + b ** 2)


def somar(*numeros):
    return sum(numeros)


def descrever(**dados):
    return ", ".join(f"{chave}={valor}" for chave, valor in dados.items())


if __name__ == "__main__":
    media, aprovado = calcular_media([7, 8, 5.5])
    print(media, aprovado)
    print(calcular_media([5, 6], minimo=5))
    print(hipotenusa(3, 4))
    print(somar(1, 2, 3, 4))
    print(descrever(nome="Ana", curso="Python"))
    print(calcular_media.__doc__)
```

Saída:

```texto
6.83 True
(5.5, True)
5.0
10
nome=Ana, curso=Python
Devolve a média (com 2 casas) e se a pessoa foi aprovada.
```

Criando um ambiente virtual e instalando uma biblioteca (no terminal):

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate    Linux/macOS: source .venv/bin/activate
pip install requests
pip freeze > requirements.txt
```

## Explicando o código

- `from math import sqrt` traz só a função `sqrt`; `statistics.mean` calcula a média.
- `calcular_media` devolve dois valores, desempacotados em `media, aprovado`. Com `minimo=5`, a regra muda sem alterar a função.
- `somar(*numeros)` aceita quantos números vierem; `descrever(**dados)` recebe os argumentos nomeados como dicionário.
- O bloco `if __name__ == "__main__":` só roda quando o arquivo é executado; se outro arquivo fizer `import`, só as funções ficam disponíveis.
- `__doc__` mostra a docstring.
- No terminal, o ambiente virtual isola as bibliotecas do projeto, e o `requirements.txt` registra as versões para outra pessoa instalar igual (`pip install -r requirements.txt`).

## Erros comuns

- **Esquecer o `return`** e receber `None`.
- **Usar lista ou dicionário como valor padrão** (`def f(lista=[])`): o mesmo objeto é reaproveitado entre chamadas. Use `None` e crie dentro.
- **Dar a um arquivo o nome de um módulo** (como `random.py`): o `import random` passa a importar o seu arquivo.
- **Instalar bibliotecas fora do ambiente virtual** e misturar versões entre projetos.

## Resumo

- Funções com `def`, parâmetros padrão, retorno múltiplo, `*args` e `**kwargs`.
- Módulos e pacotes organizam o código; a biblioteca padrão já resolve muito.
- `venv` e `pip` isolam e registram as dependências de cada projeto.

## Próximo passo

Funções organizam ações; **classes** juntam dados e comportamento. É o assunto da próxima aula.

<!-- aula: classes-e-objetos -->
## Por que isso importa

Quando o programa cresce, faz sentido agrupar dados e as ações sobre eles: uma conta bancária tem titular e saldo e sabe depositar. Classes fazem isso. Em Python, elas são simples de escrever e combinam com recursos "pythônicos" como propriedades, métodos especiais e `dataclasses`.

## Conceitos fundamentais

- **Classe** é o molde; **objeto** (instância) é algo criado a partir dela: `conta = ContaBancaria("Bia")`.
- **`__init__`** é o método que prepara o objeto; **`self`** é o próprio objeto (sempre o primeiro parâmetro dos métodos).
- **Atributos** guardam dados (`self.titular`); **métodos** são funções da classe.
- **Encapsulamento por convenção**: um nome começando com `_` (como `_saldo`) indica "uso interno". Uma **`@property`** expõe o valor só para leitura.
- **Métodos especiais** (*dunder*): `__str__` define como o objeto aparece no `print`; `__len__`, `__eq__` e outros integram a classe com a linguagem.
- **Herança**: `class ContaPoupanca(ContaBancaria)` reaproveita tudo da classe-mãe e acrescenta o que for específico.
- **`@dataclass`** gera `__init__`, `__repr__` e `__eq__` automaticamente para classes que guardam dados.
- **`isinstance(obj, Classe)`** testa o tipo, considerando a herança.

## Exemplo prático

```python
from dataclasses import dataclass


class ContaBancaria:
    def __init__(self, titular, saldo=0.0):
        self.titular = titular
        self._saldo = saldo

    @property
    def saldo(self):
        return self._saldo

    def depositar(self, valor):
        if valor <= 0:
            raise ValueError("O depósito precisa ser positivo")
        self._saldo += valor

    def __str__(self):
        return f"Conta de {self.titular}: R$ {self._saldo:.2f}"


class ContaPoupanca(ContaBancaria):
    def render(self, taxa):
        self._saldo = round(self._saldo * (1 + taxa), 2)


@dataclass
class Produto:
    nome: str
    preco: float
    quantidade: int = 0

    def total(self):
        return self.preco * self.quantidade


conta = ContaPoupanca("Bia", 100)
conta.depositar(50)
conta.render(0.01)
print(conta)
print(conta.saldo)
print(isinstance(conta, ContaBancaria))

try:
    conta.depositar(-10)
except ValueError as erro:
    print("Recusado:", erro)

p = Produto("Caderno", 18.5, 2)
print(p)
print(p.total())
print(p == Produto("Caderno", 18.5, 2))
```

Saída:

```texto
Conta de Bia: R$ 151.50
151.5
True
Recusado: O depósito precisa ser positivo
Produto(nome='Caderno', preco=18.5, quantidade=2)
37.0
True
```

## Explicando o código

- `ContaBancaria` guarda o saldo em `_saldo` e só deixa alterá-lo pelo método `depositar`, que recusa valores inválidos.
- A `@property saldo` permite ler `conta.saldo` como se fosse um atributo, mas sem um jeito direto de escrever nele.
- `ContaPoupanca` herda tudo e adiciona `render`, que aplica a taxa e arredonda para centavos.
- `__str__` controla o que o `print(conta)` mostra.
- O `try/except` captura o erro do depósito negativo (exceções são o assunto da próxima aula).
- A `dataclass Produto` ganhou `__init__`, uma representação legível no `print` e comparação por valor (`==`) sem escrever nada disso.

## Erros comuns

- **Esquecer o `self`** como primeiro parâmetro do método, ou ao acessar atributos (`saldo` em vez de `self._saldo`).
- **Criar atributos fora do `__init__`** sem necessidade, deixando objetos com formatos diferentes.
- **Herança para tudo**: se não existe uma relação "é um", prefira composição (um objeto guarda outro).
- **Comparar objetos comuns com `==`** esperando comparar os dados: sem `__eq__` (ou `dataclass`), compara-se a identidade.

## Resumo

- Classes juntam dados e comportamento; `__init__` prepara o objeto e `self` é ele mesmo.
- `_nome` e `@property` protegem dados; métodos especiais integram a classe à linguagem.
- Herança reaproveita código; `@dataclass` elimina repetição em classes de dados.

## Próximo passo

Programas encontram erros: arquivo que não existe, texto que não vira número. A próxima aula mostra como lidar com **exceções e arquivos**.

<!-- aula: excecoes-e-arquivos -->
## Por que isso importa

Um programa que quebra na primeira entrada estranha passa insegurança. Tratar erros com exceções deixa o código robusto: ele avisa o problema e continua. E quase todo projeto real lê ou grava arquivos (configurações, relatórios, dados em JSON ou CSV), algo que o Python faz com poucas linhas.

## Conceitos fundamentais

- **Exceção** é um erro em tempo de execução (`ValueError`, `KeyError`, `FileNotFoundError`, `ZeroDivisionError`...).
- **`try` / `except`**: tenta executar; se acontecer a exceção indicada, trata no `except`. Capture **tipos específicos**, não tudo.
- **`else`** roda se não houve erro; **`finally`** roda sempre (bom para liberar recursos).
- **`raise`** lança uma exceção sua, com mensagem clara: `raise ValueError("idade negativa")`.
- **Exceções próprias**: `class SaldoInsuficiente(Exception): pass`.
- **`with open(...) as f:`** abre um arquivo e garante que ele será fechado, mesmo se der erro. Modos: `"r"` (ler), `"w"` (sobrescrever), `"a"` (acrescentar). Informe sempre `encoding="utf-8"`.
- **`pathlib.Path`** representa caminhos de forma moderna: `Path("dados") / "arquivo.json"`, `exists()`, `read_text()`, `write_text()`.
- **`json`**: `json.dumps`/`json.loads` (texto) e `json.dump`/`json.load` (arquivo). **`csv`** lê e grava planilhas simples.

## Exemplo prático

```python
import csv
import json
from pathlib import Path


def ler_idade(texto):
    try:
        idade = int(texto)
    except ValueError:
        print(f"'{texto}' não é um número inteiro")
        return None
    if idade < 0:
        raise ValueError("idade não pode ser negativa")
    return idade


print(ler_idade("42"))
print(ler_idade("quarenta"))
try:
    ler_idade("-3")
except ValueError as erro:
    print("Erro:", erro)

tarefas = [
    {"titulo": "Estudar Python", "feita": True},
    {"titulo": "Fazer exercícios", "feita": False},
]
arquivo = Path("tarefas.json")
arquivo.write_text(json.dumps(tarefas, ensure_ascii=False, indent=2), encoding="utf-8")

with open(arquivo, encoding="utf-8") as f:
    carregadas = json.load(f)
pendentes = [t["titulo"] for t in carregadas if not t["feita"]]
print("Pendentes:", pendentes)

with open("notas.csv", "w", newline="", encoding="utf-8") as f:
    escritor = csv.writer(f)
    escritor.writerow(["aluno", "nota"])
    escritor.writerows([["Ana", 8.5], ["Caio", 6.0]])

with open("notas.csv", encoding="utf-8") as f:
    for linha in csv.DictReader(f):
        print(linha["aluno"], float(linha["nota"]) >= 7)

try:
    Path("nao-existe.txt").read_text(encoding="utf-8")
except FileNotFoundError:
    print("Arquivo não encontrado")
finally:
    arquivo.unlink()
    Path("notas.csv").unlink()
```

Saída:

```texto
42
'quarenta' não é um número inteiro
None
Erro: idade não pode ser negativa
Pendentes: ['Fazer exercícios']
Ana True
Caio False
Arquivo não encontrado
```

## Explicando o código

- `ler_idade` trata o caso "não é número" com `except ValueError` e devolve `None`; já a idade negativa é um erro de regra, lançado com `raise` para quem chamou decidir.
- `json.dumps(..., ensure_ascii=False, indent=2)` grava o JSON legível e com acentos; `json.load` lê de volta como lista de dicionários.
- O módulo `csv` escreve linhas e o `DictReader` lê cada linha como dicionário, usando o cabeçalho.
- `read_text` de um arquivo inexistente gera `FileNotFoundError`, tratado com uma mensagem amigável.
- O `finally` apaga os arquivos de exemplo aconteça o que acontecer.

## Erros comuns

- **`except:` sem tipo** ou `except Exception` em tudo: esconde bugs reais. Capture o erro que você sabe tratar.
- **Abrir arquivos sem `with`** e esquecer de fechar.
- **Não informar `encoding="utf-8"`**: no Windows, acentos podem virar caracteres estranhos.
- **Usar o modo `"w"` sem querer** e apagar o conteúdo do arquivo.

## Resumo

- `try/except/else/finally` tratam erros; `raise` lança os seus.
- `with open(...)` e `pathlib` lidam com arquivos com segurança.
- `json` e `csv` resolvem os formatos mais comuns.

## Próximo passo

Para fechar a trilha: **testes e boas práticas**, que garantem que o seu código continua funcionando quando você muda alguma coisa.

<!-- aula: testes-e-boas-praticas -->
## Por que isso importa

Testar "na mão" a cada mudança cansa e falha. Testes automatizados conferem em segundos se tudo continua funcionando. Junto com boas práticas de estilo, eles deixam o código fácil de ler, de manter e de mostrar no portfólio.

## Conceitos fundamentais

- **`assert condição`** para o programa com `AssertionError` se a condição for falsa: é a forma mais simples de teste.
- **pytest**: a ferramenta de testes mais usada. Arquivos `test_*.py`, funções `test_*` com `assert`, e o comando `pytest` roda tudo. Instale com `pip install pytest` dentro do ambiente virtual.
- **Bons testes** cobrem o caso comum, os **casos de borda** (vazio, zero, negativo) e os erros esperados (`pytest.raises`).
- **PEP 8** é o guia de estilo: 4 espaços, `snake_case` para funções e variáveis, `PascalCase` para classes, linhas não muito longas. Ferramentas como **Ruff** e **Black** conferem e formatam sozinhas.
- **Type hints**: `def soma(a: int, b: int) -> int:` documentam os tipos e ajudam o editor a achar erros (o Python não obriga, mas ferramentas como mypy conferem).
- **Código pythônico**: compreensões, `with`, `enumerate`, desempacotamento, f-strings e nomes claros.
- **README e requirements.txt**: explicam como rodar e quais bibliotecas instalar.

## Exemplo prático

```python
def eh_palindromo(texto: str) -> bool:
    """Ignora espaços, pontuação e maiúsculas."""
    limpo = "".join(c.lower() for c in texto if c.isalnum())
    return limpo == limpo[::-1]


def dividir(a: float, b: float) -> float:
    if b == 0:
        raise ZeroDivisionError("divisão por zero")
    return a / b


def testar():
    assert eh_palindromo("arara")
    assert eh_palindromo("Ame a ema!")
    assert not eh_palindromo("python")
    assert eh_palindromo("")
    assert dividir(9, 3) == 3
    try:
        dividir(1, 0)
    except ZeroDivisionError:
        pass
    else:
        raise AssertionError("deveria ter dado erro")
    print("Todos os testes passaram")


testar()
```

Saída:

```texto
Todos os testes passaram
```

Os mesmos testes no formato do pytest (arquivo `test_textos.py`, rodando `pytest` no terminal):

```python
import pytest

from textos import dividir, eh_palindromo


@pytest.mark.parametrize("texto", ["arara", "Ame a ema!", ""])
def test_reconhece_palindromos(texto):
    assert eh_palindromo(texto)


def test_recusa_texto_comum():
    assert not eh_palindromo("python")


def test_divisao_por_zero():
    with pytest.raises(ZeroDivisionError):
        dividir(1, 0)
```

## Explicando o código

- `eh_palindromo` usa uma expressão geradora para manter só letras e números, em minúsculas, e compara o texto com ele mesmo invertido (`[::-1]`).
- Os type hints (`str`, `bool`, `float`) documentam o que entra e sai.
- `testar()` reúne asserções do caso comum e dos casos de borda (texto vazio). O `try/except/else` confere que a divisão por zero **realmente** lança o erro.
- No pytest, `parametrize` roda o mesmo teste com vários valores e `pytest.raises` confere a exceção com menos código. Quando um teste falha, o pytest mostra exatamente os valores comparados.

## Erros comuns

- **Testar só o caminho feliz** e esquecer vazio, zero e entradas inválidas.
- **Testes que dependem uns dos outros** ou da ordem em que rodam.
- **Usar `assert` para validar entrada de usuário em produção**: ele pode ser desligado com `python -O`. Para regras de negócio, use `if` e `raise`.
- **Ignorar o estilo**: código sem padrão é difícil de revisar. Deixe o Ruff/Black trabalhar por você.

## Resumo

- `assert` e pytest automatizam a conferência do código, incluindo casos de borda e erros.
- PEP 8, type hints e recursos pythônicos deixam o código claro.
- README e `requirements.txt` permitem que outras pessoas rodem o projeto.

## Próximo passo

Você concluiu a trilha de Python. Pratique nos **Desafios de código** em Python, enfrente alguém na **Batalha de Código** e transforme um script seu (um organizador de arquivos ou um leitor de planilhas) em projeto de portfólio, com testes e README.
