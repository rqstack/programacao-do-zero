<!-- aula: csharp-e-dotnet -->
## Por que isso importa

C# é a linguagem principal da plataforma .NET, da Microsoft, e aparece em sistemas de empresas, aplicações desktop para Windows, APIs web, jogos com Unity e aplicativos móveis. É uma linguagem com tipos fixos, ferramentas excelentes e muitas vagas no Brasil. Entender o ambiente (SDK, projeto, tipos) antes de desenhar janelas evita confusão logo no começo.

## Conceitos fundamentais

- **.NET** é a plataforma: o **SDK** compila e roda os programas, e a **biblioteca de classes** traz recursos prontos (arquivos, datas, coleções, rede). É gratuita e funciona em Windows, Linux e macOS.
- **Ferramentas gratuitas**: o **Visual Studio Community** (Windows, com designer visual de janelas) ou o **VS Code** com a extensão C# Dev Kit.
- **Criar e rodar** pelo terminal: `dotnet new console -n MeuApp` cria o projeto e `dotnet run` executa.
- **Instruções de nível superior** (*top-level statements*): nos projetos de console modernos, o código pode começar direto, sem escrever a classe `Program` e o método `Main`.
- **Tipos**: `int` (inteiro), `double` (decimal aproximado), **`decimal`** (decimal exato, use para dinheiro, com o sufixo `m`: `49.90m`), `string`, `bool` e `char`. **`var`** deixa o compilador descobrir o tipo, mas ele continua fixo.
- **Interpolação**: `$"Olá, {nome}"`. Formatos: `{valor:C}` (moeda), `{valor:F2}` (2 casas).
- **Cultura**: números e moedas seguem o idioma configurado. Em português do Brasil, a vírgula é o separador decimal (`1,62`) e a moeda aparece como `R$`.
- **Conversões seguras**: `int.Parse("42")` lança erro com texto inválido; `int.TryParse(texto, out int n)` devolve `true` ou `false` sem quebrar o programa.
- **Divisão entre inteiros** descarta a parte decimal (`7 / 2` dá `3`).

## Exemplo prático

```csharp
using System.Globalization;

CultureInfo.CurrentCulture = new CultureInfo("pt-BR");

string nome = "Ana";
int idade = 17;
double altura = 1.62;
decimal preco = 49.90m;
bool estuda = true;
var cidade = "Recife";

Console.WriteLine($"Olá, {nome}!");
Console.WriteLine($"{nome} tem {idade} anos, {altura} m e mora em {cidade}.");
Console.WriteLine($"Três unidades custam {preco * 3:C}");
Console.WriteLine(estuda);
Console.WriteLine(7 / 2);
Console.WriteLine(7 / 2.0);
Console.WriteLine(17 % 5);

string digitado = "42";
if (int.TryParse(digitado, out int numero))
    Console.WriteLine(numero + 1);
if (!int.TryParse("quarenta", out _))
    Console.WriteLine("\"quarenta\" não é um número");
```

Saída:

```texto
Olá, Ana!
Ana tem 17 anos, 1,62 m e mora em Recife.
Três unidades custam R$ 149,70
True
3
3,5
2
43
"quarenta" não é um número
```

Para criar e rodar um projeto de console no terminal:

```bash
dotnet new console -n PrimeiroApp
cd PrimeiroApp
dotnet run
```

## Explicando o código

- A primeira linha de código define a cultura `pt-BR`, para que decimais e moedas apareçam no padrão brasileiro em qualquer computador.
- Cada variável tem um tipo fixo; `var cidade` vira `string` porque recebeu um texto.
- `{preco * 3:C}` calcula e formata como moeda; `decimal` garante que 49,90 × 3 dá exatamente 149,70.
- `7 / 2` é divisão entre inteiros (`3`); com `2.0`, um dos lados é `double` e o resultado é `3,5`.
- `TryParse` converte quando dá e devolve `false` quando o texto não é número, sem exceção. O `_` descarta o resultado que não interessa.

## Erros comuns

- **Usar `double` para dinheiro**: pequenas imprecisões aparecem. Use `decimal`.
- **Esquecer o `m`** em valores `decimal` (`49.90` sozinho é `double` e não compila numa variável `decimal`).
- **`int.Parse` com entrada do usuário**: qualquer texto inválido derruba o programa. Prefira `TryParse`.
- **Esquecer o ponto e vírgula** no fim das instruções.

## Resumo

- .NET (SDK + biblioteca) roda C# em vários sistemas; `dotnet new` e `dotnet run` criam e executam.
- Tipos fixos; `decimal` para dinheiro; `var` infere o tipo.
- Interpolação com formatos, cultura `pt-BR` e `TryParse` para converter com segurança.

## Próximo passo

Na próxima aula, você vai controlar o fluxo do programa com **decisões, repetições e coleções**.

<!-- aula: decisoes-repeticoes-e-colecoes -->
## Por que isso importa

Toda tela de cadastro, relatório ou cálculo de folha de pagamento precisa decidir (aprovado ou não, reajuste de quanto) e repetir (para cada funcionário, para cada linha do arquivo). C# oferece estruturas clássicas e recursos modernos, como a expressão `switch`, que deixam essas regras curtas e fáceis de ler.

## Conceitos fundamentais

- **`if` / `else if` / `else`** com condições entre parênteses e blocos entre chaves.
- **Expressão `switch`**: `var conceito = nota switch { >= 9 => "A", >= 7 => "B", _ => "D" };` devolve um valor; `_` é o caso padrão.
- **Laços**: `for` (contador), `foreach` (percorre uma coleção), `while` e `do...while`. `break` sai, `continue` pula para a próxima volta.
- **Arrays** têm tamanho fixo: `int[] notas = { 8, 5, 10 };` com `notas.Length`.
- **`List<T>`** cresce e diminui: `Add`, `Insert`, `Remove`, `Contains`, `Count`.
- **`Dictionary<TChave, TValor>`** guarda pares chave → valor com busca rápida; `TryGetValue` lê sem erro se a chave não existir.
- **Genéricos** (`<T>`): a coleção guarda só o tipo indicado, e o compilador avisa se você tentar misturar.
- **`string.Join`** junta os itens de uma coleção num texto.

## Exemplo prático

```csharp
int[] notas = { 8, 5, 10, 6, 3 };
foreach (int nota in notas)
{
    string conceito = nota switch
    {
        >= 9 => "A",
        >= 7 => "B",
        >= 5 => "C",
        _ => "D",
    };
    Console.WriteLine($"{nota,2} -> {conceito}");
}

int aprovados = 0;
for (int i = 0; i < notas.Length; i++)
{
    if (notas[i] < 6) continue;
    aprovados++;
}
Console.WriteLine($"Aprovados: {aprovados} de {notas.Length}");

var compras = new List<string> { "arroz", "feijão" };
compras.Add("café");
compras.Remove("arroz");
compras.Insert(0, "pão");
Console.WriteLine(string.Join(", ", compras));
Console.WriteLine(compras.Contains("café"));

var estoque = new Dictionary<string, int> { ["caneta"] = 10, ["caderno"] = 2 };
estoque["caderno"] += 3;
foreach (var (item, quantidade) in estoque)
    Console.WriteLine($"{item}: {quantidade}");
Console.WriteLine(estoque.TryGetValue("lápis", out int lapis) ? lapis : 0);

int tentativa = 0;
while (true)
{
    tentativa++;
    if (tentativa * tentativa > 50) break;
}
Console.WriteLine($"Parou na tentativa {tentativa}");
```

Saída:

```texto
 8 -> B
 5 -> C
10 -> A
 6 -> C
 3 -> D
Aprovados: 3 de 5
pão, feijão, café
True
caneta: 10
caderno: 5
0
Parou na tentativa 8
```

## Explicando o código

- A expressão `switch` testa os padrões de cima para baixo e devolve o primeiro que combinar. `{nota,2}` alinha o número em 2 posições.
- No `for`, o `continue` pula as notas abaixo de 6, e só as outras incrementam `aprovados`.
- A `List<string>` muda de tamanho com `Add`, `Remove` e `Insert`; `string.Join` monta o texto separado por vírgulas.
- No dicionário, `+= 3` altera um valor existente, e o `foreach` desmonta cada par em `item` e `quantidade`. `TryGetValue` evita o erro da chave inexistente.
- O `while (true)` só termina pelo `break`, quando o quadrado passa de 50 (8 × 8 = 64).

## Erros comuns

- **Acessar índice fora do array** (`notas[notas.Length]`): `IndexOutOfRangeException`.
- **Alterar uma lista dentro do `foreach`** que percorre essa mesma lista: `InvalidOperationException`.
- **Ler `dicionario["x"]` sem a chave existir**: `KeyNotFoundException`. Use `TryGetValue` ou `ContainsKey`.
- **Esquecer o caso padrão `_`** numa expressão `switch`: o compilador avisa que nem todos os valores são tratados.

## Resumo

- `if`/`else`, expressão `switch` e laços `for`, `foreach` e `while`.
- Arrays têm tamanho fixo; `List<T>` e `Dictionary<K, V>` são as coleções do dia a dia.
- Genéricos garantem o tipo dos itens; `TryGetValue` e `TryParse` evitam exceções.

## Próximo passo

Agora vamos organizar dados e regras em **classes e objetos**, a base da orientação a objetos em C#.

<!-- aula: classes-objetos-e-encapsulamento -->
## Por que isso importa

Aplicações desktop de empresas giram em torno de entidades: cliente, fornecedor, produto, nota fiscal. Representar cada uma como classe, com suas regras dentro dela, evita que um formulário qualquer deixe um saldo negativo ou um produto sem nome. C# tem recursos próprios para isso: propriedades, construtores, interfaces e `record`.

## Conceitos fundamentais

- **Classe** define atributos e comportamentos; **objeto** é uma instância criada com `new`.
- **Propriedades** (`public decimal Saldo { get; private set; }`) expõem dados controlando quem pode alterar.
- **Construtor** prepara o objeto; pode ter parâmetros com valor padrão.
- **Encapsulamento**: os dados mudam só por métodos com regras (`Depositar`, `Sacar`), que lançam exceções em casos inválidos.
- **Herança** com `:` e `base(...)`; **`protected`** deixa um membro visível para as subclasses; **`override`** substitui um comportamento (como `ToString`).
- **Interface** define um contrato que várias classes podem cumprir; uma classe pode implementar várias.
- **`record`** cria tipos de dados imutáveis com comparação por valor, `ToString` pronto e cópia com `with`.
- **Membros com corpo de expressão** (`=>`) deixam métodos e propriedades simples em uma linha.

## Exemplo prático

```csharp
using System.Globalization;

CultureInfo.CurrentCulture = new CultureInfo("pt-BR");

var conta = new ContaPoupanca("Bia", 100m);
conta.Depositar(50m);
conta.Render(0.01m);
Console.WriteLine(conta);
Console.WriteLine(conta.Saldo);

try
{
    conta.Sacar(1000m);
}
catch (InvalidOperationException erro)
{
    Console.WriteLine($"Recusado: {erro.Message}");
}

var p1 = new Produto("Caderno", 18.5m);
var p2 = p1 with { Preco = 20m };
Console.WriteLine(p1);
Console.WriteLine(p2);
Console.WriteLine(p1 == new Produto("Caderno", 18.5m));

IContaRemunerada remunerada = conta;
Console.WriteLine($"Taxa sugerida: {remunerada.TaxaSugerida:P1}");

interface IContaRemunerada
{
    decimal TaxaSugerida { get; }
}

class ContaBancaria
{
    public string Titular { get; }
    public decimal Saldo { get; protected set; }

    public ContaBancaria(string titular, decimal saldoInicial = 0)
    {
        Titular = titular;
        Saldo = saldoInicial;
    }

    public void Depositar(decimal valor)
    {
        if (valor <= 0) throw new ArgumentException("O depósito precisa ser positivo");
        Saldo += valor;
    }

    public void Sacar(decimal valor)
    {
        if (valor > Saldo) throw new InvalidOperationException("Saldo insuficiente");
        Saldo -= valor;
    }

    public override string ToString() => $"Conta de {Titular}: {Saldo:C}";
}

class ContaPoupanca : ContaBancaria, IContaRemunerada
{
    public ContaPoupanca(string titular, decimal saldoInicial) : base(titular, saldoInicial) { }

    public decimal TaxaSugerida => 0.005m;

    public void Render(decimal taxa) => Saldo = Math.Round(Saldo * (1 + taxa), 2);
}

record Produto(string Nome, decimal Preco);
```

Saída:

```texto
Conta de Bia: R$ 151,50
151,50
Recusado: Saldo insuficiente
Produto { Nome = Caderno, Preco = 18,5 }
Produto { Nome = Caderno, Preco = 20 }
True
Taxa sugerida: 0,5%
```

## Explicando o código

- `Titular` só tem `get`: depois do construtor, ninguém muda. `Saldo` tem `protected set`: só a própria classe e as subclasses alteram, e só pelas regras de `Depositar`, `Sacar` e `Render`.
- `ContaPoupanca` herda tudo de `ContaBancaria` (repassando os dados com `base(...)`) e acrescenta o rendimento, arredondado para centavos.
- O saque acima do saldo lança `InvalidOperationException`, capturada no `try/catch` com a mensagem da regra.
- `override ToString()` define o texto mostrado no `WriteLine`.
- O `record Produto` é comparado por valor (`==` dá `True` para os mesmos dados) e `with` cria uma cópia alterando só o preço.
- A interface `IContaRemunerada` permite tratar a conta pelo contrato, sem saber a classe exata; `{...:P1}` formata como porcentagem.

## Erros comuns

- **Deixar `set` público** em tudo: qualquer parte do código altera o objeto sem regras.
- **Validar dados no formulário e não na classe**: outra tela ou importação passa por cima. A regra mora na classe.
- **Usar herança quando a relação não é "é um"**: prefira composição (um pedido **tem** itens).
- **Comparar classes comuns com `==`** esperando comparar dados: sem `record` (ou `Equals` próprio), compara-se a referência.

## Resumo

- Classes com propriedades, construtores e métodos que aplicam as regras.
- Herança, `protected`, `override` e interfaces para reaproveitar e definir contratos.
- `record` para dados imutáveis com comparação por valor e cópia com `with`.

## Próximo passo

Com as classes prontas, chegou a hora de construir a interface gráfica: **aplicações desktop com Windows Forms e WPF**.

<!-- aula: aplicacoes-desktop-winforms-e-wpf -->
## Por que isso importa

Muitas empresas ainda dependem de sistemas desktop: frente de caixa, controle de estoque, cadastro de clientes. Saber como uma janela funciona (controles, eventos, validação e ligação com os dados) abre portas para manter e evoluir esses sistemas, e as mesmas ideias aparecem em aplicativos móveis e web.

## Conceitos fundamentais

- **Windows Forms (WinForms)**: a tecnologia mais simples para janelas no Windows. Você arrasta **controles** (`TextBox`, `Button`, `Label`, `DataGridView`, `ComboBox`) no **designer** do Visual Studio, e o código fica separado em `Form1.cs` (seu código) e `Form1.Designer.cs` (gerado pelo designer, não edite à mão).
- **Programação orientada a eventos**: o código roda quando algo acontece, como o clique em um botão (`Click`), o texto que muda (`TextChanged`) ou a janela que abre (`Load`).
- **Validação na interface** dá retorno rápido (`MessageBox`, `ErrorProvider`), mas a regra de verdade continua nas classes (aula anterior).
- **WPF** (Windows Presentation Foundation): interfaces descritas em **XAML** (um XML), com layout flexível, estilos e **data binding**: o controle se liga a uma propriedade e atualiza sozinho.
- **MVVM** é o padrão mais usado no WPF: a *View* (XAML) se liga a um *ViewModel* (classe com os dados da tela), que usa o *Model* (as regras).
- **Multiplataforma**: WinForms e WPF rodam só no Windows. Para Windows, Linux e macOS, existem **.NET MAUI** (oficial, também para celular) e **Avalonia** (comunidade, parecido com o WPF).
- **Criar pelo terminal**: `dotnet new winforms` ou `dotnet new wpf` (no Windows). Também dá para criar pelo Visual Studio.

## Exemplo prático

Um formulário WinForms que calcula a conta de um restaurante com gorjeta (`Form1.cs`). Os controles `txtValor`, `numGorjeta`, `btnCalcular` e `lblTotal` foram colocados pelo designer:

```csharp
using System.Globalization;

namespace Restaurante;

public partial class Form1 : Form
{
    private static readonly CultureInfo Brasil = new("pt-BR");

    public Form1()
    {
        InitializeComponent(); // monta os controles desenhados no designer
    }

    private void btnCalcular_Click(object sender, EventArgs e)
    {
        if (!decimal.TryParse(txtValor.Text, NumberStyles.Number, Brasil, out decimal valor) || valor <= 0)
        {
            MessageBox.Show("Digite um valor válido, por exemplo 87,50.", "Valor inválido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            txtValor.Focus();
            return;
        }

        decimal gorjeta = valor * numGorjeta.Value / 100m;
        lblTotal.Text = $"Total: {(valor + gorjeta).ToString("C", Brasil)} (gorjeta de {gorjeta.ToString("C", Brasil)})";
    }
}
```

A mesma tela em WPF, com data binding (`MainWindow.xaml`):

```xaml
<Window x:Class="Restaurante.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Conta do restaurante" Width="360" Height="220">
    <StackPanel Margin="16">
        <TextBlock Text="Valor da conta" />
        <TextBox Text="{Binding Valor, UpdateSourceTrigger=PropertyChanged}" />
        <TextBlock Text="Gorjeta (%)" Margin="0,8,0,0" />
        <Slider Minimum="0" Maximum="20" Value="{Binding Gorjeta}" />
        <TextBlock Text="{Binding Total}" FontSize="18" FontWeight="Bold" Margin="0,12,0,0" />
    </StackPanel>
</Window>
```

Estes dois exemplos dependem de janelas do Windows e do designer, então **não são executados automaticamente pelo site** (a conferência automática roda programas de console). Para testar, crie um projeto com `dotnet new winforms` ou pelo Visual Studio no Windows.

## Explicando o código

- `InitializeComponent()` (gerado pelo designer) cria os controles e liga o evento `Click` do botão ao método `btnCalcular_Click`.
- O método valida a entrada com `decimal.TryParse` usando a cultura brasileira (aceita `87,50`). Se for inválida, mostra um aviso, devolve o foco ao campo e para.
- `numGorjeta.Value` é um `NumericUpDown` (já devolve `decimal`), então o cálculo é exato; o total aparece formatado como moeda.
- No WPF, não há código no botão: o `TextBox`, o `Slider` e o `TextBlock` estão ligados a propriedades de um ViewModel (`Valor`, `Gorjeta`, `Total`). Quando o valor muda, o total é recalculado e a tela atualiza sozinha (o ViewModel avisa a mudança implementando `INotifyPropertyChanged`).

## Erros comuns

- **Colocar toda a regra de negócio dentro do evento do botão**: fica impossível testar e reaproveitar. O evento só lê a tela, chama a classe e mostra o resultado.
- **Editar o `Form1.Designer.cs` à mão** e ver a alteração sumir na próxima vez que o designer salvar.
- **Converter texto com `decimal.Parse`** sem tratar entrada inválida ou sem considerar a vírgula brasileira.
- **Travar a janela** com operações longas (ler arquivo grande, acessar a rede) direto no evento. Use `async`/`await` para manter a tela respondendo.

## Resumo

- WinForms: controles no designer e código orientado a eventos.
- WPF: XAML, data binding e o padrão MVVM.
- A interface valida e mostra; as regras ficam nas classes. Para multiplataforma, MAUI ou Avalonia.

## Próximo passo

Com a tela separada das regras, o próximo passo é organizar o projeto inteiro em **camadas e projetos de uma solução**.

<!-- aula: organizando-em-camadas -->
## Por que isso importa

Quando tudo fica dentro do formulário, cada mudança vira um risco: trocar o banco de dados obriga a mexer nas telas, e não dá para testar uma regra sem abrir a janela. Separar o sistema em camadas (modelo, regras, dados e apresentação) é o que permite crescer, testar e trocar partes sem quebrar o resto.

## Conceitos fundamentais

- **Solução** (`.sln`) agrupa vários **projetos**; cada projeto gera um componente (biblioteca ou aplicativo) e declara de quais outros depende.
- **Camadas comuns**:
  - **Modelo** (entidades como `Fornecedor` e `Produto`);
  - **Dados** (como salvar e buscar: banco, arquivo, memória);
  - **Regras/Serviços** (validações e casos de uso);
  - **Apresentação** (WinForms, WPF, API ou console).
- **Dependências apontam para dentro**: a apresentação conhece as regras, as regras conhecem o modelo, e o modelo não conhece ninguém.
- **Interfaces entre camadas**: o serviço depende de `IRepositorioDeFornecedores`, não de uma classe concreta. Assim dá para trocar o banco real por uma versão em memória nos testes.
- **Injeção de dependência**: o objeto recebe no construtor aquilo de que precisa, em vez de criar sozinho.
- **MVC e MVVM** são formas de separar a apresentação: o *Model* (dados e regras), a *View* (tela) e quem faz a ponte (*Controller* ou *ViewModel*).
- **Associações**: um objeto se relaciona com outros (uma nota de compra **tem** um fornecedor e **tem** vários itens), normalmente com propriedades e coleções (`List<ItemDaNota>`).

## Exemplo prático

Criando a solução com três projetos e as dependências entre eles (terminal):

```bash
dotnet new sln -n Loja
dotnet new classlib -n Loja.Modelo
dotnet new classlib -n Loja.Dados
dotnet new winforms -n Loja.Desktop
dotnet sln add Loja.Modelo Loja.Dados Loja.Desktop
dotnet add Loja.Dados reference Loja.Modelo
dotnet add Loja.Desktop reference Loja.Modelo Loja.Dados
```

As camadas em ação, num programa de console (no projeto real, cada parte fica no seu projeto):

```csharp
using System.Globalization;

CultureInfo.CurrentCulture = new CultureInfo("pt-BR");

var repositorio = new RepositorioEmMemoria();
var servico = new ServicoDeFornecedores(repositorio);

Console.WriteLine(servico.Cadastrar("Papelaria Central", "11222333000181"));
Console.WriteLine(servico.Cadastrar("Gráfica Rápida", "44555666000199"));
Console.WriteLine(servico.Cadastrar("Papelaria Central (cópia)", "11222333000181"));
Console.WriteLine(servico.Cadastrar("", "77888999000100"));

foreach (var f in repositorio.Todos())
    Console.WriteLine($"#{f.Id} {f.Nome} ({f.Cnpj})");

var nota = new NotaDeCompra(repositorio.Todos()[0]);
nota.Itens.Add(new ItemDaNota("Caderno", 10, 12.5m));
nota.Itens.Add(new ItemDaNota("Caneta", 50, 1.2m));
Console.WriteLine($"Nota de {nota.Fornecedor.Nome}: {nota.Itens.Count} itens, total {nota.Total():C}");

// ---------- Modelo ----------
class Fornecedor
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Cnpj { get; set; } = "";
}

record ItemDaNota(string Produto, int Quantidade, decimal PrecoUnitario);

class NotaDeCompra
{
    public NotaDeCompra(Fornecedor fornecedor) => Fornecedor = fornecedor;
    public Fornecedor Fornecedor { get; }
    public List<ItemDaNota> Itens { get; } = new();
    public decimal Total() => Itens.Sum(i => i.Quantidade * i.PrecoUnitario);
}

// ---------- Dados ----------
interface IRepositorioDeFornecedores
{
    void Adicionar(Fornecedor fornecedor);
    bool ExisteCnpj(string cnpj);
    IReadOnlyList<Fornecedor> Todos();
}

class RepositorioEmMemoria : IRepositorioDeFornecedores
{
    private readonly List<Fornecedor> _itens = new();
    private int _proximoId = 1;

    public void Adicionar(Fornecedor fornecedor)
    {
        fornecedor.Id = _proximoId++;
        _itens.Add(fornecedor);
    }

    public bool ExisteCnpj(string cnpj) => _itens.Any(f => f.Cnpj == cnpj);
    public IReadOnlyList<Fornecedor> Todos() => _itens;
}

// ---------- Regras ----------
class ServicoDeFornecedores
{
    private readonly IRepositorioDeFornecedores _repositorio;
    public ServicoDeFornecedores(IRepositorioDeFornecedores repositorio) => _repositorio = repositorio;

    public string Cadastrar(string nome, string cnpj)
    {
        if (string.IsNullOrWhiteSpace(nome)) return "Erro: informe o nome";
        if (cnpj.Length != 14 || !cnpj.All(char.IsDigit)) return "Erro: CNPJ deve ter 14 dígitos";
        if (_repositorio.ExisteCnpj(cnpj)) return $"Erro: CNPJ {cnpj} já cadastrado";
        _repositorio.Adicionar(new Fornecedor { Nome = nome.Trim(), Cnpj = cnpj });
        return $"Fornecedor \"{nome}\" cadastrado";
    }
}
```

Saída:

```texto
Fornecedor "Papelaria Central" cadastrado
Fornecedor "Gráfica Rápida" cadastrado
Erro: CNPJ 11222333000181 já cadastrado
Erro: informe o nome
#1 Papelaria Central (11222333000181)
#2 Gráfica Rápida (44555666000199)
Nota de Papelaria Central: 2 itens, total R$ 185,00
```

## Explicando o código

- Os comandos `dotnet` criam a solução, três projetos e as referências: a camada de dados conhece o modelo, e o desktop conhece os dois.
- `ServicoDeFornecedores` recebe o repositório pelo construtor (**injeção de dependência**) e depende só da interface. No aplicativo real, o mesmo serviço pode usar um repositório com banco de dados.
- As regras (nome obrigatório, CNPJ com 14 dígitos, CNPJ sem repetir) ficam no serviço. Qualquer tela que cadastrar fornecedores passa por elas.
- `NotaDeCompra` mostra duas associações: **tem um** fornecedor e **tem vários** itens (composição com `List<ItemDaNota>`). O total é calculado pela própria nota.
- Os CNPJs do exemplo são fictícios.

## Erros comuns

- **Referências circulares** entre projetos (A depende de B, que depende de A): o .NET nem compila.
- **O modelo conhecendo a tela ou o banco**: mudar qualquer um dos dois passa a afetar tudo.
- **Criar o repositório concreto dentro do serviço** (`new RepositorioSql()`): impossível testar com dados em memória.
- **Camadas demais** para um sistema pequeno: separe o necessário e evolua quando precisar.

## Resumo

- Solução com projetos por camada e dependências apontando para dentro.
- Interfaces e injeção de dependência permitem trocar o banco e testar as regras.
- Associações e composição representam relações como nota → fornecedor → itens.

## Próximo passo

Antes de falar com o banco de dados, você vai conhecer o **LINQ** e as **expressões lambda**, a forma do C# de consultar coleções e bancos com a mesma sintaxe.

<!-- aula: linq-e-lambdas -->
## Por que isso importa

Filtrar, ordenar, agrupar e somar dados é rotina em qualquer sistema: produtos sem estoque, vendas por mês, média por categoria. O LINQ permite escrever essas consultas em C#, com tipos verificados pelo compilador, e a mesma sintaxe funciona em listas na memória e em bancos de dados (com o Entity Framework, na próxima aula).

## Conceitos fundamentais

- **Expressão lambda**: uma função curta e sem nome, como `p => p.Preco < 20` ("dado `p`, devolva se o preço é menor que 20").
- **`Func<T, TResultado>`** guarda uma lambda numa variável; **`Action<T>`**, uma que não devolve valor.
- **Operadores do LINQ** (sintaxe de métodos): `Where` (filtra), `Select` (transforma), `OrderBy`/`OrderByDescending`, `GroupBy`, `Sum`, `Average`, `Count`, `Any`, `All`, `First`/`FirstOrDefault`, `MaxBy`/`MinBy`, `Take`/`Skip`.
- **Sintaxe de consulta**: `from p in produtos where ... orderby ... select ...`, parecida com SQL. As duas sintaxes geram o mesmo resultado; use a que ficar mais legível.
- **Tipos anônimos**: `select new { Nome = p.Nome, Total = ... }` cria um objeto só para aquela consulta.
- **Execução adiada**: a consulta só é executada quando você percorre o resultado (`foreach`, `ToList()`, `Count()`). Se a lista mudar antes, o resultado muda. Use `ToList()` para "congelar".

## Exemplo prático

```csharp
using System.Globalization;

CultureInfo.CurrentCulture = new CultureInfo("pt-BR");

var produtos = new List<Produto>
{
    new("Caderno", "Papelaria", 18.5m, 40),
    new("Caneta", "Papelaria", 3.2m, 300),
    new("Mochila", "Acessórios", 129.9m, 12),
    new("Garrafa", "Acessórios", 45m, 0),
    new("Lápis", "Papelaria", 1.5m, 500),
};

var baratos = produtos.Where(p => p.Preco < 20).OrderBy(p => p.Preco).Select(p => p.Nome);
Console.WriteLine(string.Join(", ", baratos));

Console.WriteLine(produtos.Any(p => p.Estoque == 0));
Console.WriteLine(produtos.Sum(p => p.Preco * p.Estoque).ToString("C"));
Console.WriteLine(produtos.MaxBy(p => p.Preco)!.Nome);

var porCategoria = from p in produtos
                   group p by p.Categoria into g
                   orderby g.Key
                   select new { Categoria = g.Key, Quantidade = g.Count(), Media = g.Average(p => p.Preco) };
foreach (var c in porCategoria)
    Console.WriteLine($"{c.Categoria}: {c.Quantidade} itens, média {c.Media:C}");

Func<decimal, decimal> comDesconto = preco => Math.Round(preco * 0.9m, 2);
Console.WriteLine(comDesconto(129.9m));

var muitoEstoque = produtos.Where(p => p.Estoque > 100);
var congelada = muitoEstoque.ToList();
produtos.Add(new("Borracha", "Papelaria", 2m, 150));
Console.WriteLine($"{muitoEstoque.Count()} x {congelada.Count}");

record Produto(string Nome, string Categoria, decimal Preco, int Estoque);
```

Saída:

```texto
Lápis, Caneta, Caderno
True
R$ 4.008,80
Mochila
Acessórios: 2 itens, média R$ 87,45
Papelaria: 3 itens, média R$ 7,73
116,91
3 x 2
```

## Explicando o código

- `Where`, `OrderBy` e `Select` formam um "encanamento": filtra os baratos, ordena pelo preço e pega só os nomes.
- `Any` responde se existe produto sem estoque; `Sum` multiplica preço por estoque e soma tudo (o valor total em estoque), formatado como moeda.
- `MaxBy` devolve o produto inteiro de maior preço (o `!` diz ao compilador que a lista não está vazia).
- A consulta com `group ... by` agrupa por categoria e cria um tipo anônimo com quantidade e média.
- `comDesconto` é uma lambda guardada num `Func<decimal, decimal>`.
- A última linha mostra a **execução adiada**: `muitoEstoque` foi recalculada depois que a borracha entrou (3 itens), enquanto `congelada` guardou o resultado do momento do `ToList()` (2 itens).

## Erros comuns

- **Percorrer a mesma consulta várias vezes** sem `ToList()`, refazendo o trabalho (no banco de dados, isso vira várias consultas).
- **`First()` em lista que pode estar vazia**: lança exceção. Use `FirstOrDefault()` e trate o `null`.
- **Esquecer que a consulta é adiada** e se surpreender com o resultado depois de mudar a lista.
- **Lógica pesada dentro de lambdas**: extraia para um método com nome claro.

## Resumo

- Lambdas são funções curtas; `Func` e `Action` as guardam em variáveis.
- LINQ filtra, transforma, ordena, agrupa e agrega coleções, em sintaxe de métodos ou de consulta.
- A execução é adiada até o resultado ser usado; `ToList()` congela o resultado.

## Próximo passo

Para fechar a trilha: **acesso a dados com ADO.NET e Entity Framework Core**, gravando e lendo as entidades em um banco de verdade.

<!-- aula: acesso-a-dados-com-ef-core -->
## Por que isso importa

Um sistema de estoque ou de compras precisa guardar os dados entre uma execução e outra. Em .NET, há dois caminhos: o **ADO.NET**, que executa SQL diretamente, e o **Entity Framework Core (EF Core)**, que mapeia suas classes para tabelas e transforma consultas LINQ em SQL. Saber os dois, e principalmente como evitar injeção de SQL, é exigido em praticamente toda vaga de .NET.

## Conceitos fundamentais

- **ADO.NET**: você abre uma conexão (`SqlConnection`, `SqliteConnection`), cria um comando com SQL e lê o resultado (`DataReader`). Dá controle total e exige escrever o SQL.
- **Parâmetros sempre**: valores vindos do usuário entram como parâmetros (`@nome`), nunca concatenados no texto do SQL. Concatenar permite **injeção de SQL**.
- **EF Core** é um **ORM** (mapeamento objeto-relacional): um `DbContext` com `DbSet<Fornecedor>` representa as tabelas; `Add`, `Remove` e `SaveChanges` gravam; consultas LINQ viram SQL.
- **Provedores**: o mesmo código funciona com SQLite (arquivo local, ótimo para estudar e para apps desktop), SQL Server, PostgreSQL e outros, trocando só o pacote e a conexão.
- **Relacionamentos**: propriedades de navegação (`fornecedor.Produtos`) e chaves estrangeiras (`FornecedorId`); `Include` carrega os relacionados junto.
- **Migrations**: `dotnet ef migrations add Inicial` gera o script que cria e evolui as tabelas; `dotnet ef database update` aplica. Em exemplos rápidos, `EnsureCreated()` cria o banco direto.
- **`AsNoTracking()`** em consultas só de leitura deixa mais rápido.
- **Strings de conexão e senhas** ficam fora do código-fonte (configuração, variáveis de ambiente ou *user secrets*), nunca no repositório.

## Exemplo prático

Por que parâmetros importam. Este trecho só monta textos, sem banco, e mostra o que um campo de busca malicioso faria com SQL concatenado:

```csharp
string busca = "x' OR '1'='1";

string concatenado = "SELECT * FROM Fornecedores WHERE Nome = '" + busca + "'";
Console.WriteLine(concatenado);

const string comParametro = "SELECT * FROM Fornecedores WHERE Nome = @nome";
Console.WriteLine(comParametro);
Console.WriteLine($"@nome = {busca}");
```

Saída:

```texto
SELECT * FROM Fornecedores WHERE Nome = 'x' OR '1'='1'
SELECT * FROM Fornecedores WHERE Nome = @nome
@nome = x' OR '1'='1
```

Um cadastro com EF Core e SQLite. Antes, instale o pacote no projeto:

```bash
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
```

```csharp
using Microsoft.EntityFrameworkCore;

using var db = new LojaContext();
db.Database.EnsureCreated();

var fornecedor = new Fornecedor { Nome = "Papelaria Central" };
fornecedor.Produtos.Add(new Produto { Nome = "Caderno", Preco = 18.5m, Estoque = 40 });
fornecedor.Produtos.Add(new Produto { Nome = "Caneta", Preco = 3.2m, Estoque = 0 });
db.Fornecedores.Add(fornecedor);
db.SaveChanges();

var semEstoque = db.Produtos
    .AsNoTracking()
    .Include(p => p.Fornecedor)
    .Where(p => p.Estoque == 0)
    .OrderBy(p => p.Nome)
    .ToList();

foreach (var p in semEstoque)
    Console.WriteLine($"{p.Nome} (de {p.Fornecedor!.Nome}) está sem estoque");

var caderno = db.Produtos.First(p => p.Nome == "Caderno");
caderno.Preco = 19.9m;
db.SaveChanges();

class Fornecedor
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public List<Produto> Produtos { get; } = new();
}

class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
    public int FornecedorId { get; set; }
    public Fornecedor? Fornecedor { get; set; }
}

class LojaContext : DbContext
{
    public DbSet<Fornecedor> Fornecedores => Set<Fornecedor>();
    public DbSet<Produto> Produtos => Set<Produto>();

    protected override void OnConfiguring(DbContextOptionsBuilder options) =>
        options.UseSqlite("Data Source=loja.db");
}
```

O exemplo com EF Core depende de um pacote baixado do NuGet. Por isso **não foi executado na conferência automática do site**, que roda sem acesso à internet. Ele usa a API pública e estável do EF Core; para testar, crie um projeto de console, instale o pacote e cole o código.

## Explicando o código

- No primeiro trecho, o texto digitado fecha a aspa e acrescenta `OR '1'='1'`, uma condição sempre verdadeira: o SQL concatenado devolveria **todos** os fornecedores. Com `@nome`, o banco trata o valor inteiro como um nome comum, sem executar nada.
- No EF Core, `LojaContext` representa o banco; cada `DbSet` vira uma tabela, e `UseSqlite` grava tudo no arquivo `loja.db`.
- `EnsureCreated()` cria as tabelas se não existirem. Em projetos reais, prefira migrations.
- Adicionar produtos à lista do fornecedor e chamar `SaveChanges()` grava os três registros, já com a chave estrangeira `FornecedorId` preenchida.
- A consulta LINQ vira um `SELECT` com `JOIN` (por causa do `Include`) e `WHERE Estoque = 0`. O EF Core sempre usa parâmetros, o que protege contra injeção.
- Alterar `caderno.Preco` e chamar `SaveChanges()` gera um `UPDATE`, porque o objeto foi lido com rastreamento de mudanças.

## Erros comuns

- **Concatenar valores no SQL** em vez de usar parâmetros.
- **Esquecer o `SaveChanges()`**: nada é gravado.
- **Problema N+1**: carregar uma lista e acessar os relacionados um a um, gerando uma consulta por item. Use `Include` ou uma projeção com `Select`.
- **Senha do banco no código ou no Git**: use configuração fora do repositório.
- **`EnsureCreated()` em produção** junto com migrations: os dois não combinam. Escolha migrations.

## Resumo

- ADO.NET executa SQL direto; EF Core mapeia classes para tabelas e consultas LINQ para SQL.
- Parâmetros sempre: nunca concatene entrada do usuário em SQL.
- `DbContext`, `DbSet`, `SaveChanges`, `Include`, `AsNoTracking` e migrations são o dia a dia com EF Core.

## Próximo passo

Você concluiu a trilha de C#. Pratique nos **Desafios de código** em C#, enfrente alguém na **Batalha de Código** e monte um projeto de portfólio: um controle de estoque desktop (WinForms ou WPF) com camadas, EF Core e SQLite, com README explicando como rodar.
