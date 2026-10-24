<!-- aula: primeiro-programa-em-java -->
## Por que isso importa

Java é uma das linguagens mais usadas em empresas: sistemas bancários, back-ends de grandes aplicativos, Android e muitas vagas de estágio pedem Java. Ela é **fortemente tipada** e organizada em **classes**, o que obriga a pensar na estrutura do programa desde o começo. Quem já sabe lógica e JavaScript aprende Java rapidamente, e o contrário também vale.

## Conceitos fundamentais

- **JDK** (Java Development Kit): o kit para escrever e rodar Java. Instale uma versão **LTS** (de suporte longo), como 17 ou 21, de uma distribuição gratuita (por exemplo, Eclipse Temurin).
- **Compilar e executar**: `javac Main.java` gera `Main.class` (bytecode); `java Main` executa na **JVM**. Desde o Java 11, `java Main.java` compila e roda de uma vez para programas de um arquivo.
- Todo código fica dentro de uma **classe**. O programa começa pelo método **`public static void main(String[] args)`**.
- **Tipos primitivos**: `int` (inteiros), `long` (inteiros grandes), `double` (decimais), `boolean`, `char` (um caractere). **`String`** é uma classe para textos.
- **Declaração**: `tipo nome = valor;` (`int idade = 20;`). Com `var`, o compilador deduz o tipo de variáveis locais (`var nome = "Ana";`), mas o tipo continua fixo.
- **Ponto e vírgula** no fim de cada instrução e **chaves** delimitando blocos.
- `System.out.println(...)` imprime com quebra de linha; `printf`/`String.format` formatam números.
- Divisão entre inteiros descarta a parte decimal: `7 / 2` dá `3`. Para decimal, use `double`.

## Exemplo prático

```java
public class Main {
    public static void main(String[] args) {
        String nome = "Ana";
        int idade = 20;
        double altura = 1.68;
        boolean estudante = true;

        System.out.println("Olá, " + nome + "!");
        System.out.println("Idade: " + idade + " anos");
        System.out.printf("Altura: %.2f m%n", altura);
        System.out.println("Estudante? " + estudante);

        int a = 7;
        int b = 2;
        System.out.println("7 / 2 = " + (a / b));
        System.out.println("7.0 / 2 = " + (a / 2.0));
        System.out.println("7 % 2 = " + (a % b));

        var cidade = "Recife";
        System.out.println(nome + " mora em " + cidade + " e tem " + cidade.length() + " letras na cidade.");
    }
}
```

Saída:

```texto
Olá, Ana!
Idade: 20 anos
Altura: 1,68 m
Estudante? true
7 / 2 = 3
7.0 / 2 = 3.5
7 % 2 = 1
Ana mora em Recife e tem 6 letras na cidade.
```

## Explicando o código

- A classe se chama `Main` e o arquivo precisa se chamar `Main.java` (classe pública = nome do arquivo).
- Cada variável tem um tipo fixo: tentar `idade = "vinte";` dá **erro de compilação**, antes de rodar.
- `printf("%.2f%n", altura)` formata com 2 casas; `%n` é a quebra de linha. Repare na saída `1,68`: o `printf` usa o formato do idioma do sistema (no Brasil, vírgula decimal). Em outra configuração, pode aparecer `1.68`.
- `a / b` com dois `int` dá `3`; com `2.0` (um `double`), o resultado é `3.5`.
- `%` é o resto da divisão.
- `cidade.length()` mostra que `String` é um objeto com métodos.

## Erros comuns

- **Nome do arquivo diferente da classe pública**: erro de compilação.
- **Esquecer o ponto e vírgula**.
- **Comparar textos com `==`**: use `texto.equals(outro)` (veremos por quê).
- **Esperar decimais de uma divisão entre inteiros**.

## Resumo

- Java é compilada e fortemente tipada; tudo vive em classes; o programa começa no `main`.
- Tipos primitivos (`int`, `double`, `boolean`, `char`) e `String`.
- `println` e `printf` para saída; cuidado com a divisão inteira.

## Próximo passo

Na próxima aula: decisões e repetições em Java (`if`, `switch`, `for`, `while`) e arrays.

<!-- aula: controle-de-fluxo-e-arrays -->
## Por que isso importa

As estruturas de decisão e repetição são as mesmas que você viu em lógica e JavaScript, com a sintaxe de Java. Dominar essa parte (inclusive o `switch` moderno e os arrays) é o que permite resolver exercícios de entrevista e de faculdade com tranquilidade.

## Conceitos fundamentais

- **`if / else if / else`** com condições do tipo `boolean`; operadores `&&`, `||`, `!`.
- **`switch` moderno** (Java 14+): `case "A" -> ...;` sem precisar de `break`, e pode **devolver um valor** (expressão `switch`).
- **Laços**: `for (int i = 0; i < n; i++)`, `while (condição)`, `do { } while (condição)` e o **for-each** `for (int x : lista)`.
- **Array**: tamanho fixo e um único tipo. `int[] notas = {8, 7, 10};` ou `new int[5]` (começa com zeros). Índices de `0` a `length - 1`; acessar fora disso lança `ArrayIndexOutOfBoundsException`.
- **Strings comparam com `equals`**: `==` compara se é o **mesmo objeto**, não o mesmo conteúdo.
- `break` sai do laço; `continue` pula para a próxima volta.

## Exemplo prático

```java
public class Main {
    static String conceito(int nota) {
        if (nota >= 90) return "A";
        else if (nota >= 70) return "B";
        else if (nota >= 50) return "C";
        return "D";
    }

    public static void main(String[] args) {
        int[] notas = {95, 72, 48, 88, 63};

        int soma = 0;
        int maior = notas[0];
        for (int nota : notas) {
            soma += nota;
            if (nota > maior) maior = nota;
        }
        double media = (double) soma / notas.length;
        System.out.printf("Média: %.1f | Maior: %d%n", media, maior);

        for (int i = 0; i < notas.length; i++) {
            System.out.println("Aluno " + (i + 1) + ": " + notas[i] + " -> " + conceito(notas[i]));
        }

        String dia = "sab";
        String tipo = switch (dia) {
            case "sab", "dom" -> "fim de semana";
            case "seg", "ter", "qua", "qui", "sex" -> "dia útil";
            default -> "dia inválido";
        };
        System.out.println(dia + " é " + tipo);

        String digitado = new String("java");
        System.out.println("== : " + (digitado == "java"));
        System.out.println("equals : " + digitado.equals("java"));
    }
}
```

Saída:

```texto
Média: 73,2 | Maior: 95
Aluno 1: 95 -> A
Aluno 2: 72 -> B
Aluno 3: 48 -> D
Aluno 4: 88 -> B
Aluno 5: 63 -> C
sab é fim de semana
== : false
equals : true
```

## Explicando o código

- O for-each (`for (int nota : notas)`) percorre o array sem índice; o `for` clássico é usado quando precisamos da posição (`i + 1`).
- `(double) soma / notas.length` converte antes de dividir, para não perder os decimais (366 / 5 = 73,2).
- O `switch` devolve um valor direto para `tipo`; `case "sab", "dom"` junta dois casos.
- `new String("java") == "java"` é `false`: são objetos diferentes com o mesmo texto. `equals` compara o conteúdo e dá `true`.

## Erros comuns

- **`for (int i = 0; i <= notas.length; i++)`**: o `<=` passa do último índice e lança exceção.
- **Comparar `String` com `==`**.
- **Dividir inteiros esperando decimal** (esqueceu o `(double)`).
- **Usar o `switch` antigo sem `break`**: cai nos casos seguintes.

## Resumo

- `if`, `switch` moderno (com `->` e valor), `for`, `while` e for-each.
- Arrays têm tamanho fixo, índices de 0 a `length - 1`.
- Strings comparam com `equals`; converta para `double` antes de dividir.

## Próximo passo

Agora começa a parte mais importante do Java: **classes, objetos e métodos**.

<!-- aula: classes-objetos-e-metodos -->
## Por que isso importa

Java é orientada a objetos: os programas são organizados em **classes** que juntam dados e comportamentos. Pensar em objetos ajuda a modelar o mundo real (uma conta, um produto, um aluno) e a dividir sistemas grandes em partes que conversam entre si. É a base de frameworks como o Spring, muito pedido em vagas.

## Conceitos fundamentais

- **Classe**: o molde (como uma planta de casa). Define **atributos** (dados) e **métodos** (ações).
- **Objeto** (instância): algo criado a partir da classe com `new`. Cada objeto tem os próprios valores.
- **Construtor**: método especial com o nome da classe, chamado no `new`, que inicializa o objeto. Pode haver mais de um (sobrecarga).
- **`this`**: referência ao próprio objeto; desfaz a ambiguidade entre parâmetro e atributo (`this.nome = nome`).
- **Métodos de instância** usam os dados do objeto; métodos **`static`** pertencem à classe e não precisam de objeto (como o `main`).
- **`toString()`**: define como o objeto aparece ao ser impresso.
- **Referências**: uma variável de objeto guarda uma **referência**. `Conta b = a;` faz as duas apontarem para o **mesmo** objeto.

## Exemplo prático

```java
class Produto {
    String nome;
    double preco;
    int estoque;

    Produto(String nome, double preco, int estoque) {
        this.nome = nome;
        this.preco = preco;
        this.estoque = estoque;
    }

    Produto(String nome, double preco) {
        this(nome, preco, 0); // chama o outro construtor
    }

    double valorEmEstoque() {
        return preco * estoque;
    }

    void repor(int quantidade) {
        estoque += quantidade;
    }

    @Override
    public String toString() {
        return nome + " (R$ " + String.format("%.2f", preco) + ", " + estoque + " un.)";
    }
}

public class Main {
    public static void main(String[] args) {
        Produto caderno = new Produto("Caderno", 18.90, 10);
        Produto caneta = new Produto("Caneta", 2.50);

        caneta.repor(40);
        System.out.println(caderno);
        System.out.println(caneta);
        System.out.printf("Valor em estoque: %.2f%n", caderno.valorEmEstoque() + caneta.valorEmEstoque());

        Produto mesmo = caderno;   // mesma referência, não uma cópia
        mesmo.repor(5);
        System.out.println("Estoque do caderno: " + caderno.estoque);
    }
}
```

Saída:

```texto
Caderno (R$ 18,90, 10 un.)
Caneta (R$ 2,50, 40 un.)
Valor em estoque: 289,00
Estoque do caderno: 15
```

## Explicando o código

- `Produto` define três atributos e dois construtores. O segundo usa `this(...)` para reaproveitar o primeiro, com estoque 0.
- `caderno` e `caneta` são objetos diferentes, cada um com os próprios valores.
- `valorEmEstoque()` e `repor()` são comportamentos que usam os dados do objeto.
- `toString()` com `@Override` substitui a forma padrão de imprimir (que mostraria algo como `Produto@1b6d3586`).
- `Produto mesmo = caderno;` não copia: as duas variáveis apontam para o mesmo objeto, por isso o estoque do caderno vira 15.
- O valor em estoque: 18,90 × 10 + 2,50 × 40 = 189 + 100 = 289.

## Erros comuns

- **Esquecer o `new`** e tentar usar uma variável nula: `NullPointerException`.
- **Parâmetro com o mesmo nome do atributo sem `this`**: `nome = nome;` não altera o atributo.
- **Achar que `b = a` copia o objeto**.
- **Colocar tudo em métodos `static`** e não usar objetos de verdade.

## Resumo

- Classe é o molde; objeto é a instância criada com `new`.
- Construtores inicializam; `this` aponta para o próprio objeto.
- Variáveis de objeto guardam referências; `toString` define a impressão.

## Próximo passo

Do jeito que está, qualquer parte do código pode deixar o estoque negativo. A próxima aula resolve isso com **encapsulamento**.

<!-- aula: encapsulamento -->
## Por que isso importa

Se qualquer parte do programa pode alterar o saldo de uma conta diretamente, um único erro coloca o sistema num estado impossível (saldo negativo sem limite, por exemplo). **Encapsulamento** esconde os dados e só permite mudá-los por métodos que aplicam as regras. É o primeiro pilar da orientação a objetos e uma das ideias mais úteis em qualquer linguagem.

## Conceitos fundamentais

- **Modificadores de acesso**:
  - `private`: visível só dentro da própria classe.
  - (sem modificador): visível no mesmo pacote.
  - `protected`: pacote e subclasses.
  - `public`: visível em todo lugar.
- Regra prática: **atributos `private`**, métodos que fazem sentido para fora `public`.
- **Getters** expõem a leitura (`getSaldo()`); **setters** só existem quando faz sentido alterar e **validam** a entrada. Muitas vezes, em vez de um setter genérico, é melhor um método com significado de negócio (`depositar`, `sacar`).
- **Invariantes**: regras que o objeto nunca pode quebrar (saldo nunca abaixo do limite). O construtor e os métodos garantem isso.
- **`final`**: um atributo `final` só recebe valor uma vez (no construtor). Objetos **imutáveis** são mais fáceis de entender e seguros para compartilhar.
- **Exceções** sinalizam operações inválidas (`IllegalArgumentException`, `IllegalStateException`).

## Exemplo prático

```java
class ContaBancaria {
    private final String titular;
    private double saldo;
    private final double limite;

    ContaBancaria(String titular, double limite) {
        if (titular == null || titular.isBlank()) throw new IllegalArgumentException("Titular obrigatório");
        if (limite < 0) throw new IllegalArgumentException("Limite não pode ser negativo");
        this.titular = titular;
        this.limite = limite;
        this.saldo = 0;
    }

    public String getTitular() {
        return titular;
    }

    public double getSaldo() {
        return saldo;
    }

    public void depositar(double valor) {
        if (valor <= 0) throw new IllegalArgumentException("Depósito deve ser positivo");
        saldo += valor;
    }

    public void sacar(double valor) {
        if (valor <= 0) throw new IllegalArgumentException("Saque deve ser positivo");
        if (saldo - valor < -limite) throw new IllegalStateException("Saldo insuficiente (limite de " + limite + ")");
        saldo -= valor;
    }
}

public class Main {
    public static void main(String[] args) {
        ContaBancaria conta = new ContaBancaria("Bruno", 100);
        conta.depositar(250);
        conta.sacar(300);
        System.out.println(conta.getTitular() + ": saldo " + conta.getSaldo());

        try {
            conta.sacar(80);
        } catch (IllegalStateException e) {
            System.out.println("Recusado: " + e.getMessage());
        }
        System.out.println("Saldo continua: " + conta.getSaldo());
        // conta.saldo = 1000000;  // não compila: saldo é private
    }
}
```

Saída:

```texto
Bruno: saldo -50.0
Recusado: Saldo insuficiente (limite de 100.0)
Saldo continua: -50.0
```

## Explicando o código

- `saldo` é `private`: a única forma de mudar é por `depositar` e `sacar`, que aplicam as regras.
- `titular` e `limite` são `final`: definidos no construtor e nunca mais alterados. Não há setter para eles.
- O construtor recusa titular vazio e limite negativo: nenhum objeto nasce inválido.
- Sacar 300 com saldo 250 e limite 100 é permitido (fica −50). Sacar mais 80 daria −130, além do limite: o método lança exceção e o saldo não muda.
- A linha comentada `conta.saldo = 1000000;` não compila: o encapsulamento é garantido pelo compilador.

## Erros comuns

- **Gerar getters e setters para tudo** automaticamente, inclusive para o que não deveria mudar.
- **Setters sem validação**: o encapsulamento vira enfeite.
- **Atributos `public`** em classes com regras.
- **Usar `double` para dinheiro em sistemas reais**: prefira `BigDecimal` (o `double` aqui é para simplificar o exemplo).

## Resumo

- Atributos `private`; acesso por métodos que aplicam as regras.
- Construtores e métodos garantem as invariantes; `final` para o que não muda.
- Exceções recusam operações inválidas sem corromper o estado.

## Próximo passo

Quando vários tipos de objeto compartilham comportamento, entram **herança e polimorfismo**.

<!-- aula: heranca-e-polimorfismo -->
## Por que isso importa

Em muitos sistemas há "famílias" de objetos: tipos de funcionário, formas de pagamento, formas geométricas. Herança e polimorfismo permitem tratar todos de um jeito uniforme ("calcule o salário", "processe o pagamento") enquanto cada tipo faz do seu jeito. Isso deixa o código extensível: um tipo novo entra sem mexer no resto.

## Conceitos fundamentais

- **Herança** (`extends`): a subclasse herda atributos e métodos da superclasse e pode acrescentar ou **sobrescrever** (`@Override`) comportamentos. Em Java, uma classe herda de **uma** só classe.
- **`super`**: chama o construtor ou um método da superclasse.
- **Classe abstrata** (`abstract`): não pode ser instanciada; serve de base e pode ter **métodos abstratos** (sem corpo), que as subclasses são obrigadas a implementar.
- **Polimorfismo**: uma variável do tipo da superclasse pode guardar qualquer subclasse, e o método chamado é o **da classe real do objeto**, decidido em tempo de execução.
- **"É um"**: use herança só quando a subclasse realmente **é um** tipo da superclasse (um Gerente é um Funcionário). Para reaproveitar código sem essa relação, prefira **composição** (um objeto que tem outro).

## Exemplo prático

```java
import java.util.List;

abstract class Funcionario {
    protected final String nome;
    protected final double salarioBase;

    Funcionario(String nome, double salarioBase) {
        this.nome = nome;
        this.salarioBase = salarioBase;
    }

    abstract double salario(); // cada tipo calcula do seu jeito

    String resumo() {
        return String.format("%-8s %-12s R$ %8.2f", nome, getClass().getSimpleName(), salario());
    }
}

class Analista extends Funcionario {
    Analista(String nome, double salarioBase) {
        super(nome, salarioBase);
    }

    @Override
    double salario() {
        return salarioBase;
    }
}

class Gerente extends Funcionario {
    private final double bonus;

    Gerente(String nome, double salarioBase, double bonus) {
        super(nome, salarioBase);
        this.bonus = bonus;
    }

    @Override
    double salario() {
        return salarioBase + bonus;
    }
}

class Estagiario extends Funcionario {
    Estagiario(String nome, double bolsa) {
        super(nome, bolsa);
    }

    @Override
    double salario() {
        return salarioBase;
    }

    @Override
    String resumo() {
        return super.resumo() + " (bolsa)";
    }
}

public class Main {
    public static void main(String[] args) {
        List<Funcionario> equipe = List.of(
            new Analista("Ana", 5000),
            new Gerente("Bruno", 8000, 2500),
            new Estagiario("Carla", 1800)
        );

        double folha = 0;
        for (Funcionario f : equipe) {
            System.out.println(f.resumo()); // polimorfismo: cada um usa o próprio salario()
            folha += f.salario();
        }
        System.out.printf("Folha total: R$ %.2f%n", folha);
    }
}
```

Saída:

```texto
Ana      Analista     R$  5000,00
Bruno    Gerente      R$ 10500,00
Carla    Estagiario   R$  1800,00 (bolsa)
Folha total: R$ 17300,00
```

## Explicando o código

- `Funcionario` é abstrata: não existe "funcionário genérico"; o método `salario()` é abstrato e cada subclasse implementa.
- `super(nome, salarioBase)` repassa os dados para o construtor da superclasse.
- A lista é do tipo `Funcionario`, mas guarda objetos de três classes diferentes. No `for`, `f.salario()` chama a versão certa de cada um: isso é **polimorfismo**.
- `Estagiario` também sobrescreve `resumo()` e usa `super.resumo()` para acrescentar texto ao formato da superclasse.
- Para criar um novo tipo (por exemplo, `Terceirizado`), basta uma nova subclasse: o laço da folha não muda.

## Erros comuns

- **Herança só para reaproveitar código**, sem relação "é um" (ex.: `Carro extends Motor`). Use composição.
- **Esquecer o `@Override`**: um erro de digitação no nome cria um método novo em vez de sobrescrever, e o compilador não avisa.
- **Usar `instanceof` e `if` para cada tipo** em vez de polimorfismo.
- **Hierarquias muito profundas**, difíceis de entender.

## Resumo

- `extends` herda; `@Override` sobrescreve; `super` acessa a superclasse.
- Classes abstratas definem o que as subclasses devem implementar.
- Polimorfismo: o mesmo chamado, o comportamento de cada tipo real.

## Próximo passo

Na próxima aula: **interfaces**, que definem contratos, e as **coleções** do Java (`List`, `Map`).

<!-- aula: interfaces-e-colecoes -->
## Por que isso importa

Interfaces são a forma mais flexível de polimorfismo em Java: definem **o que** um objeto sabe fazer, sem dizer **como**. E as coleções (`List`, `Set`, `Map`) estão em praticamente todo programa Java. Juntas, aparecem em todo código profissional e em perguntas de entrevista.

## Conceitos fundamentais

- **Interface**: um contrato com assinaturas de métodos. Uma classe **implementa** (`implements`) uma ou várias interfaces e precisa fornecer os métodos.
- Diferente da herança de classe, uma classe pode implementar **várias** interfaces.
- **Programar para a interface**: declare variáveis com o tipo da interface (`List<String> nomes = new ArrayList<>();`). Assim dá para trocar a implementação sem mexer no resto.
- **Generics**: `List<String>` diz o tipo dos elementos; o compilador impede colocar outro tipo. Primitivos usam as classes "embrulho" (`Integer`, `Double`).
- **Coleções principais**:
  - `List` (ordem, aceita repetidos): `ArrayList`.
  - `Set` (sem repetidos): `HashSet`, `TreeSet` (ordenado).
  - `Map` (chave → valor): `HashMap`, `TreeMap` (chaves ordenadas).
- **Ordenação**: `lista.sort(Comparator.comparing(...))`.
- **Lambdas** (`x -> x * 2`) implementam interfaces de um método só, de forma curta.

## Exemplo prático

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

interface FormaDePagamento {
    double taxa(double valor);
    String nome();
}

class Pix implements FormaDePagamento {
    public double taxa(double valor) { return 0; }
    public String nome() { return "Pix"; }
}

class Cartao implements FormaDePagamento {
    private final int parcelas;
    Cartao(int parcelas) { this.parcelas = parcelas; }
    public double taxa(double valor) { return valor * (parcelas == 1 ? 0.03 : 0.05); }
    public String nome() { return "Cartão " + parcelas + "x"; }
}

public class Main {
    public static void main(String[] args) {
        List<FormaDePagamento> formas = new ArrayList<>();
        formas.add(new Pix());
        formas.add(new Cartao(1));
        formas.add(new Cartao(6));

        double compra = 200.0;
        formas.sort(Comparator.comparingDouble(f -> f.taxa(compra)));
        for (FormaDePagamento f : formas) {
            System.out.printf("%-12s taxa R$ %5.2f%n", f.nome(), f.taxa(compra));
        }

        // Contando palavras com um Map
        String frase = "java é legal e java é muito usado";
        Map<String, Integer> contagem = new TreeMap<>();
        for (String palavra : frase.split(" ")) {
            contagem.merge(palavra, 1, Integer::sum);
        }
        System.out.println(contagem);
        System.out.println("Vezes que 'java' aparece: " + contagem.get("java"));
    }
}
```

Saída:

```texto
Pix          taxa R$  0,00
Cartão 1x    taxa R$  6,00
Cartão 6x    taxa R$ 10,00
{e=1, java=2, legal=1, muito=1, usado=1, é=2}
Vezes que 'java' aparece: 2
```

## Explicando o código

- `FormaDePagamento` é o contrato; `Pix` e `Cartao` cumprem do seu jeito. O código que lista as formas não sabe nem precisa saber qual é qual.
- `List<FormaDePagamento> formas = new ArrayList<>()` declara pela interface (`List`) e cria a implementação (`ArrayList`).
- `Comparator.comparingDouble(f -> f.taxa(compra))` ordena pela taxa usando uma lambda.
- `TreeMap` guarda as chaves em ordem; `merge(palavra, 1, Integer::sum)` soma 1 se a palavra já existe ou começa com 1.
- Repare que `é` aparece no fim: a ordem do `TreeMap` segue os códigos dos caracteres, e letras acentuadas vêm depois das sem acento.

## Erros comuns

- **Declarar tudo com a classe concreta** (`ArrayList<String> x = ...`) e dificultar trocas.
- **Usar `List` quando precisa de busca por chave** (`Map`) ou sem repetidos (`Set`).
- **Modificar uma lista enquanto percorre com for-each**: `ConcurrentModificationException`.
- **`List.of(...)` é imutável**: `add` lança exceção. Use `new ArrayList<>(...)` se precisar alterar.

## Resumo

- Interfaces são contratos; uma classe pode implementar várias.
- Programe para a interface (`List`, `Map`) e use generics.
- `ArrayList`, `HashSet`/`TreeSet`, `HashMap`/`TreeMap`, ordenação com `Comparator` e lambdas.

## Próximo passo

Para fechar: **exceções** e boas práticas para escrever Java robusto e legível.

<!-- aula: excecoes-e-boas-praticas -->
## Por que isso importa

Programas reais lidam com entradas inválidas, arquivos que não existem e serviços fora do ar. Em Java, isso é tratado com **exceções**. Saber quando lançar, quando capturar e como criar exceções próprias faz a diferença entre um sistema que falha com uma mensagem clara e um que trava sem explicação.

## Conceitos fundamentais

- **Exceção**: um objeto que sinaliza um problema e interrompe o fluxo normal até ser **capturado**.
- **`try { } catch (Tipo e) { } finally { }`**: `catch` trata tipos específicos; `finally` roda sempre (fechar recursos).
- **Verificadas (checked)** × **não verificadas (unchecked)**:
  - checked (como `IOException`) precisam ser tratadas ou declaradas com `throws`;
  - unchecked (`RuntimeException` e filhas, como `IllegalArgumentException`) indicam erros de programação ou regras violadas.
- **Exceções próprias**: `class SaldoInsuficienteException extends RuntimeException` deixa claro o que aconteceu.
- **try-with-resources** (`try (var leitor = ...)`) fecha recursos automaticamente.
- **Boas práticas**:
  - capture só o que sabe tratar; não engula exceções com `catch` vazio;
  - mensagens de erro úteis;
  - **`record`** (Java 16+) para objetos de dados imutáveis, com `equals`, `hashCode` e `toString` prontos;
  - nomes claros, métodos curtos, uma responsabilidade por classe.

## Exemplo prático

```java
import java.util.ArrayList;
import java.util.List;

record Item(String nome, int quantidade, double preco) {
    Item {
        if (quantidade <= 0) throw new IllegalArgumentException("Quantidade inválida para " + nome);
    }

    double subtotal() {
        return quantidade * preco;
    }
}

class EstoqueInsuficienteException extends RuntimeException {
    EstoqueInsuficienteException(String produto, int pedido, int disponivel) {
        super("Estoque insuficiente de " + produto + ": pedido " + pedido + ", disponível " + disponivel);
    }
}

public class Main {
    static int estoqueDe(String produto) {
        return produto.equals("Mouse") ? 3 : 10;
    }

    static void reservar(Item item) {
        int disponivel = estoqueDe(item.nome());
        if (item.quantidade() > disponivel) {
            throw new EstoqueInsuficienteException(item.nome(), item.quantidade(), disponivel);
        }
    }

    public static void main(String[] args) {
        List<Item> pedido = new ArrayList<>();
        pedido.add(new Item("Teclado", 1, 150.0));
        pedido.add(new Item("Mouse", 5, 80.0));

        try {
            pedido.add(new Item("Monitor", 0, 900.0));
        } catch (IllegalArgumentException e) {
            System.out.println("Item ignorado: " + e.getMessage());
        }

        double total = 0;
        for (Item item : pedido) {
            try {
                reservar(item);
                total += item.subtotal();
                System.out.println("Reservado: " + item);
            } catch (EstoqueInsuficienteException e) {
                System.out.println("Não reservado: " + e.getMessage());
            }
        }
        System.out.printf("Total reservado: R$ %.2f%n", total);
        System.out.println(new Item("Cabo", 2, 10.0).equals(new Item("Cabo", 2, 10.0)));
    }
}
```

Saída:

```texto
Item ignorado: Quantidade inválida para Monitor
Reservado: Item[nome=Teclado, quantidade=1, preco=150.0]
Não reservado: Estoque insuficiente de Mouse: pedido 5, disponível 3
Total reservado: R$ 150,00
true
```

## Explicando o código

- `record Item(...)` cria uma classe imutável com construtor, getters (`nome()`, `quantidade()`), `toString`, `equals` e `hashCode` automáticos.
- O bloco `Item { ... }` é um **construtor compacto**: valida antes de criar. Por isso o Monitor com quantidade 0 é recusado.
- `EstoqueInsuficienteException` carrega uma mensagem completa, montada a partir dos dados.
- Cada item é reservado dentro do seu próprio `try`: o problema com o Mouse não impede o resto do pedido.
- O último `println` mostra que dois records com os mesmos valores são `equals`.

## Erros comuns

- **`catch (Exception e) { }` vazio**: o erro some e o bug fica invisível.
- **Usar exceções para fluxo normal** (em vez de um `if`).
- **Mensagens genéricas** ("erro").
- **Esquecer de fechar recursos** (arquivos, conexões): use try-with-resources.

## Resumo

- `try/catch/finally`; checked × unchecked; exceções próprias com mensagens claras.
- Trate o que sabe tratar; não engula erros.
- `record` para dados imutáveis; nomes claros e classes com uma responsabilidade.

## Próximo passo

Você completou a trilha de Java e Orientação a Objetos. Para praticar, use a **Batalha de Código** em Java e, depois, explore o **Spring Boot** para criar APIs (o equivalente Java do Express).
