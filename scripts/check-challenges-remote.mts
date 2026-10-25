/**
 * Confere, no Judge0 real, que os desafios de código funcionam nas linguagens compiladas:
 * monta o programa (função + leitura dos casos), insere uma solução conhecida e compara
 * cada resposta com a referência. Cobre todos os tipos: decimal, texto com espaços,
 * texto → texto e lista + número → lista. Também confere que o código inicial é recusado.
 * Uso: npx tsx scripts/check-challenges-remote.mts [linguagem]
 */
import { codeChallenges } from "../content/challenges.ts";
import { buildCases, sameValue, starterCode } from "../src/lib/challenges/core.ts";
import { REMOTE_LANGS, runRemote, type RemoteLang } from "../src/lib/challenges/remote.ts";

const r = String.raw;
const SOLUCOES: Record<string, Record<RemoteLang, string>> = {
  "media-das-notas": {
    java: r`        if (notas.length == 0) return 0;
        double soma = 0;
        for (int n : notas) soma += n;
        return soma / notas.length;`,
    c: r`    if (n_notas == 0) return 0;
    double soma = 0;
    for (int i = 0; i < n_notas; i++) soma += notas[i];
    return soma / n_notas;`,
    cpp: r`    if (notas.empty()) return 0;
    double soma = 0;
    for (int n : notas) soma += n;
    return soma / notas.size();`,
    csharp: r`        if (notas.Length == 0) return 0;
        double soma = 0;
        foreach (int n in notas) soma += n;
        return soma / notas.Length;`,
    go: r`	if len(notas) == 0 {
		return 0
	}
	soma := 0.0
	for _, n := range notas {
		soma += float64(n)
	}
	return soma / float64(len(notas))`,
    rust: r`    if notas.is_empty() { return 0.0; }
    notas.iter().sum::<i64>() as f64 / notas.len() as f64`,
    php: r`    if (count($notas) == 0) return 0;
    return array_sum($notas) / count($notas);`,
  },
  "inverter-texto": {
    java: r`        return new StringBuilder(texto).reverse().toString();`,
    c: r`    int n = strlen(texto);
    for (int i = 0; i < n; i++) resposta[i] = texto[n - 1 - i];
    resposta[n] = '\0';`,
    cpp: r`    return string(texto.rbegin(), texto.rend());`,
    csharp: r`        char[] a = texto.ToCharArray();
        Array.Reverse(a);
        return new string(a);`,
    go: r`	b := []byte(texto)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)`,
    rust: r`    texto.chars().rev().collect()`,
    php: r`    return strrev($texto);`,
  },
  "contar-palavras": {
    java: r`        int c = 0;
        for (String p : frase.split(" ")) if (!p.isEmpty()) c++;
        return c;`,
    c: r`    int c = 0, dentro = 0;
    for (int i = 0; frase[i]; i++) {
        if (frase[i] != ' ' && !dentro) { c++; dentro = 1; }
        else if (frase[i] == ' ') dentro = 0;
    }
    return c;`,
    cpp: r`    istringstream in(frase);
    string p;
    int c = 0;
    while (in >> p) c++;
    return c;`,
    csharp: r`        return frase.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length;`,
    go: r`	return len(strings.Fields(frase))`,
    rust: r`    frase.split_whitespace().count() as i64`,
    php: r`    return count(array_filter(explode(" ", $frase), fn($p) => $p !== ""));`,
  },
  "rotacionar-lista": {
    java: r`        int n = numeros.length;
        int[] r = new int[n];
        if (n == 0) return r;
        int p = k % n;
        for (int i = 0; i < n; i++) r[(i + p) % n] = numeros[i];
        return r;`,
    c: r`    if (n_numeros == 0) return 0;
    int p = k % n_numeros;
    for (int i = 0; i < n_numeros; i++) resposta[(i + p) % n_numeros] = numeros[i];
    return n_numeros;`,
    cpp: r`    int n = numeros.size();
    vector<int> r(n);
    if (n == 0) return r;
    int p = k % n;
    for (int i = 0; i < n; i++) r[(i + p) % n] = numeros[i];
    return r;`,
    csharp: r`        int n = numeros.Length;
        int[] r = new int[n];
        if (n == 0) return r;
        int p = k % n;
        for (int i = 0; i < n; i++) r[(i + p) % n] = numeros[i];
        return r;`,
    go: r`	n := len(numeros)
	r := make([]int, n)
	if n == 0 {
		return r
	}
	p := k % n
	for i, x := range numeros {
		r[(i+p)%n] = x
	}
	return r`,
    rust: r`    let n = numeros.len();
    if n == 0 { return Vec::new(); }
    let p = (k as usize) % n;
    let mut r = vec![0i64; n];
    for i in 0..n { r[(i + p) % n] = numeros[i]; }
    r`,
    php: r`    $n = count($numeros);
    if ($n == 0) return [];
    $p = $k % $n;
    $r = array_fill(0, $n, 0);
    for ($i = 0; $i < $n; $i++) $r[($i + $p) % $n] = $numeros[$i];
    return $r;`,
  },
};

/** Troca o marcador "escreva sua solução aqui" (e o return padrão logo abaixo) pela solução. */
function comSolucao(code: string, body: string): string {
  const lines = code.split("\n");
  const i = lines.findIndex((l) => l.includes("escreva sua solução aqui"));
  const skip = /^\s*return\b/.test(lines[i + 1] ?? "") ? 2 : 1;
  lines.splice(i, skip, ...body.split("\n"));
  return lines.join("\n");
}

const only = process.argv[2];
let falhas = 0;
for (const [id, porLang] of Object.entries(SOLUCOES)) {
  const ch = codeChallenges.find((c) => c.id === id)!;
  for (const lang of REMOTE_LANGS.filter((l) => !only || l === only)) {
    const cases = buildCases(ch, Math.floor(Math.random() * 2 ** 31), "submit");
    const args = cases.map((c) => c.args);
    const inicial = starterCode(ch, lang);
    const out = await runRemote(ch, lang, comSolucao(inicial, porLang[lang]), args);
    const ruim = await runRemote(ch, lang, inicial, args);
    const ok = out.ok && cases.every((c, i) => out.results[i]?.ok && sameValue((out.results[i] as { value: unknown }).value, c.expected));
    const recusado = !ruim.ok || cases.some((c, i) => !ruim.results[i]?.ok || !sameValue((ruim.results[i] as { value: unknown }).value, c.expected));
    if (!ok || !recusado) falhas++;
    const detalhe = !out.ok ? out.error.slice(0, 300) : ok ? "" : JSON.stringify(cases.map((c, i) => [c.expected, out.results[i]]).find(([e, g]) => !(g as { ok: boolean }).ok || !sameValue((g as { value: unknown }).value, e)));
    console.log(`${ok && recusado ? "OK   " : "FALHA"} ${id.padEnd(18)} ${lang.padEnd(7)} solução=${ok ? "aceita" : "recusada"} inicial=${recusado ? "recusado" : "ACEITO?"} ${detalhe}`);
  }
}
console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} problema(s)`);
process.exit(falhas === 0 ? 0 : 1);
