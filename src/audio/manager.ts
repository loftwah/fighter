import { findMusic, resolveAudioPath } from "./registry";
import type { Preferences } from "../persistence/save";

export class AudioManager {
  readonly #music = new Audio();
  readonly #sfx = new Audio();
  readonly #dialogue = new Audio();
  #currentTrackId = "";
  #preferences: Preferences;

  constructor(preferences: Preferences) {
    this.#preferences = preferences;
    this.#music.loop = true;
    this.applyPreferences(preferences);
  }

  applyPreferences(preferences: Preferences): void {
    this.#preferences = preferences;
    this.#music.volume = preferences.musicMuted
      ? 0
      : Math.min(1, Math.max(0, preferences.musicVolume));
    this.#sfx.volume = preferences.sfxMuted
      ? 0
      : Math.min(1, Math.max(0, preferences.sfxVolume));
    this.#dialogue.volume = preferences.dialogueMuted
      ? 0
      : Math.min(1, Math.max(0, preferences.dialogueVolume));
  }

  playSfx(id: string): void {
    if (this.#preferences.sfxMuted) {
      return;
    }
    this.#sfx.src = resolveAudioPath(id, "sfx");
    void this.#sfx.play().catch(() => undefined);
  }

  playDialogue(id: string): void {
    if (this.#preferences.dialogueMuted) {
      return;
    }
    this.#dialogue.src = resolveAudioPath(id, "dialogue");
    void this.#dialogue.play().catch(() => undefined);
  }

  async playTrack(id: string): Promise<void> {
    const track = findMusic(id);
    if (this.#currentTrackId !== track.id) {
      this.#music.src = track.path;
      this.#currentTrackId = track.id;
    }
    if (this.#preferences.musicMuted) {
      return;
    }
    try {
      await this.#music.play();
    } catch {
      // Browser autoplay rules are expected until a deliberate player gesture.
    }
  }

  toggle(): boolean {
    if (this.#music.paused) {
      void this.playTrack(this.#currentTrackId || "music.red-thread");
      return true;
    }
    this.#music.pause();
    return false;
  }

  get currentTrackId(): string {
    return this.#currentTrackId;
  }

  get isPlaying(): boolean {
    return !this.#music.paused && !this.#music.ended;
  }

  destroy(): void {
    for (const channel of [this.#music, this.#sfx, this.#dialogue]) {
      channel.pause();
      channel.removeAttribute("src");
      channel.load();
    }
  }
}
