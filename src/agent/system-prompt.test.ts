import { describe, it, expect } from "bun:test";
import { getSystemPrompt } from "./system-prompt.ts";

describe("getSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = getSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("includes all tool names", () => {
    const prompt = getSystemPrompt();
    const expectedTools = [
      "get_pattern",
      "set_pattern",
      "modify_pattern",
      "play_music",
      "stop_music",
      "strudel_evaluate",
      "set_tempo",
      "get_strudel_help",
      "list_samples",
      "manage_todo",
    ];
    for (const tool of expectedTools) {
      expect(prompt).toContain(tool);
    }
  });

  it("includes strudel documentation", () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain("Mini-Notation");
    expect(prompt).toContain("s(");
    expect(prompt).toContain(".gain");
  });

  it("includes role description", () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain("music assistant");
    expect(prompt).toContain("Strudel");
  });
});
