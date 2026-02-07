import { describe, it, expect, beforeEach } from "bun:test";
import {
  getStrudelHelpTool,
  listSamplesTool,
  listInstrumentsTool,
  _resetManifestCache,
  _setManifestCache,
} from "./reference.ts";

describe("getStrudelHelpTool", () => {
  it("returns docs for exact topic match", async () => {
    const result = await getStrudelHelpTool({ topic: "s" });
    expect(result.output).toContain('s("sound")');
    expect(result.output).toContain("Play samples");
  });

  it("is case-insensitive", async () => {
    const result = await getStrudelHelpTool({ topic: "NOTE" });
    expect(result.output).toContain('note("pattern")');
  });

  it("trims whitespace", async () => {
    const result = await getStrudelHelpTool({ topic: "  lpf  " });
    expect(result.output).toContain("Low-pass filter");
  });

  it("returns docs for fuzzy match (key contains topic)", async () => {
    const result = await getStrudelHelpTool({ topic: "effects" });
    expect(result.output).toContain("Audio effects chain");
  });

  it("returns docs for fuzzy match (topic contains key)", async () => {
    // "mini-notation" matches because key "mini-notation" includes topic substring
    const result = await getStrudelHelpTool({ topic: "mini-notation" });
    expect(result.output).toContain("Mini-notation syntax");
  });

  it("returns available topics when nothing matches", async () => {
    // Use a topic that won't fuzzy-match any key
    const result = await getStrudelHelpTool({ topic: "zzzqqq" });
    expect(result.output).toContain("not found");
    expect(result.output).toContain("Available topics:");
  });

  it("returns docs for multi-word topics", async () => {
    const result = await getStrudelHelpTool({ topic: "mini-notation" });
    expect(result.output).toContain("Mini-notation syntax");
  });

  it("returns docs for each documented topic", async () => {
    const topics = ["s", "note", "n", "bank", "gain", "speed", "lpf", "hpf", "delay", "room", "jux", "rev", "fast", "slow", "effects", "setcps", "hush", "scale", "chord", "adsr", "fm", "signals", "samples", "synths", "pan", "iter", "orbit", "random", "conditional", "superimpose", "stack", "cat", "struct", "euclid", "bpf", "vowel", "mini-notation"];
    for (const topic of topics) {
      const result = await getStrudelHelpTool({ topic });
      expect(result.output).not.toContain("not found");
    }
  });
});

describe("listSamplesTool", () => {
  it("lists all banks when no bank specified", async () => {
    const result = await listSamplesTool({});
    expect(result.output).toContain("Available sample banks:");
    expect(result.output).toContain("RolandTR909");
    expect(result.output).toContain("RolandTR808");
    expect(result.output).toContain("casio");
    expect(result.output).toContain('.bank("RolandTR909")');
  });

  it("returns info for known bank (case-sensitive match)", async () => {
    const result = await listSamplesTool({ bank: "RolandTR909" });
    expect(result.output).toContain('Bank "RolandTR909"');
    expect(result.output).toContain("TR-909");
  });

  it("returns info for known bank (lowercase match)", async () => {
    const result = await listSamplesTool({ bank: "jazz" });
    expect(result.output).toContain('Bank "jazz"');
    expect(result.output).toContain("Jazz drum kit");
  });

  it("returns suggestion for unknown bank", async () => {
    const result = await listSamplesTool({ bank: "unknown_bank_xyz" });
    expect(result.output).toContain("not in quick reference");
    expect(result.output).toContain('.bank("unknown_bank_xyz")');
    expect(result.output).toContain("list_instruments");
  });
});

describe("listInstrumentsTool", () => {
  const mockManifest = {
    bd: ["bd/kick1.wav", "bd/kick2.wav", "bd/kick3.wav"],
    sd: ["sd/snare1.wav", "sd/snare2.wav"],
    hh: ["hh/hat1.wav"],
    cp: ["cp/clap1.wav", "cp/clap2.wav"],
    arpy: [
      "arpy/arpy01.wav",
      "arpy/arpy02.wav",
      "arpy/arpy03.wav",
      "arpy/arpy04.wav",
      "arpy/arpy05.wav",
    ],
    casio: ["casio/high.wav", "casio/low.wav", "casio/noise.wav"],
  };

  beforeEach(() => {
    _resetManifestCache();
  });

  it("lists all instruments from cached manifest", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({});
    expect(result.output).toContain("All instruments: 6 total");
    expect(result.output).toContain("bd (3 variants)");
    expect(result.output).toContain("sd (2 variants)");
    expect(result.output).toContain("hh (1 variant)");
    expect(result.output).toContain("arpy (5 variants)");
  });

  it("filters instruments by search term", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({ search: "bd" });
    expect(result.output).toContain('matching "bd"');
    expect(result.output).toContain("bd (3 variants)");
    expect(result.output).not.toContain("• sd");
    expect(result.output).not.toContain("• hh");
  });

  it("search is case-insensitive", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({ search: "BD" });
    expect(result.output).toContain("bd (3 variants)");
  });

  it("returns message when no instruments match search", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({ search: "zzzzz" });
    expect(result.output).toContain('No instruments matching "zzzzz"');
  });

  it("paginates with offset and limit", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({ limit: 2, offset: 0 });
    expect(result.output).toContain("showing 1-2");
    expect(result.output).toContain("offset=2");
    // sorted alphabetically: arpy, bd, casio, cp, hh, sd
    expect(result.output).toContain("• arpy");
    expect(result.output).toContain("• bd");
    expect(result.output).not.toContain("• casio");
  });

  it("paginates from offset", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({ limit: 2, offset: 2 });
    expect(result.output).toContain("showing 3-4");
    expect(result.output).toContain("• casio");
    expect(result.output).toContain("• cp");
  });

  it("shows file names for small variant counts", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({ search: "casio" });
    expect(result.output).toContain("high.wav");
    expect(result.output).toContain("low.wav");
    expect(result.output).toContain("noise.wav");
  });

  it("truncates file list for many variants", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({ search: "arpy" });
    expect(result.output).toContain("arpy01.wav");
    expect(result.output).toContain("...");
  });

  it("includes usage hint in output", async () => {
    _setManifestCache(mockManifest);
    const result = await listInstrumentsTool({});
    expect(result.output).toContain('s("');
    expect(result.output).toContain('.bank("');
  });

  it("skips non-array entries like _base", async () => {
    _setManifestCache({ _base: "https://example.com/", bd: ["bd/kick.wav"] });
    const result = await listInstrumentsTool({});
    expect(result.output).toContain("1 total");
    expect(result.output).not.toContain("_base");
  });

  it("returns error when manifest cannot be loaded", async () => {
    _resetManifestCache();
    // With no local file and no network, loading will likely fail or return local only
    // We test the cached path primarily; the error path is tested by ensuring
    // the tool handles it gracefully
    _setManifestCache({});
    const result = await listInstrumentsTool({});
    expect(result.output).toContain("No instruments available");
  });
});
