import { describe, expect, it } from "vitest";
import { pauseKeyCommand } from "./pause-input";

describe("pause keyboard input", () => {
  it("pauses on P keydown and resumes on P keyup in hold mode", () => {
    expect(
      pauseKeyCommand({
        key: "p",
        phase: "keydown",
        repeat: false,
        mode: "hold",
        holdActive: false,
      }),
    ).toBe("pause");
    expect(
      pauseKeyCommand({
        key: "p",
        phase: "keyup",
        repeat: false,
        mode: "hold",
        holdActive: true,
      }),
    ).toBe("resume");
  });

  it("toggles once per P press in toggle mode", () => {
    expect(
      pauseKeyCommand({
        key: "P",
        phase: "keydown",
        repeat: false,
        mode: "toggle",
        holdActive: false,
      }),
    ).toBe("toggle");
    expect(
      pauseKeyCommand({
        key: "p",
        phase: "keydown",
        repeat: true,
        mode: "toggle",
        holdActive: false,
      }),
    ).toBeNull();
    expect(
      pauseKeyCommand({
        key: "p",
        phase: "keyup",
        repeat: false,
        mode: "toggle",
        holdActive: false,
      }),
    ).toBeNull();
  });

  it("leaves unrelated keys alone", () => {
    expect(
      pauseKeyCommand({
        key: "Escape",
        phase: "keydown",
        repeat: false,
        mode: "hold",
        holdActive: false,
      }),
    ).toBeNull();
  });
});
