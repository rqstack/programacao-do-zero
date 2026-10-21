import { describe, expect, it } from "vitest";
import { normalizeGithub, normalizeLinkedin, normalizeUsername, normalizeWebsite } from "@/lib/profiles/fields";

const val = (r: { ok: boolean; value?: string | null }) => (r.ok ? r.value : "ERRO");

describe("campos do perfil", () => {
  it("usuário: minúsculas, números e _", () => {
    expect(val(normalizeUsername("@Ana_Dev"))).toBe("ana_dev");
    expect(val(normalizeUsername("ab"))).toBe("ERRO");
    expect(val(normalizeUsername("com espaço"))).toBe("ERRO");
  });
  it("GitHub aceita usuário, @usuário ou link", () => {
    expect(val(normalizeGithub("https://github.com/octocat?tab=repositories"))).toBe("octocat");
    expect(val(normalizeGithub("@octo-cat"))).toBe("octo-cat");
    expect(val(normalizeGithub(""))).toBeNull();
    expect(val(normalizeGithub("-comeca-com-hifen"))).toBe("ERRO");
  });
  it("LinkedIn aceita o link do perfil", () => {
    expect(val(normalizeLinkedin("https://www.linkedin.com/in/ana-souza-123/"))).toBe("ana-souza-123");
    expect(val(normalizeLinkedin("ana-souza-123"))).toBe("ana-souza-123");
    expect(val(normalizeLinkedin("https://evil.test/<script>"))).toBe("ERRO");
  });
  it("site só com https e sem truques", () => {
    expect(val(normalizeWebsite("ana.dev"))).toBe("https://ana.dev/");
    expect(val(normalizeWebsite("http://ana.dev"))).toBe("ERRO");
    expect(val(normalizeWebsite("javascript:alert(1)"))).toBe("ERRO");
  });
});
