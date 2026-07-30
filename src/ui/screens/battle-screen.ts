import { ICONS } from "../icons";

export interface BattleScreenModel {
  roundLabel: string;
  difficultyOptions: string;
  musicPlaybackEnabled: boolean;
  devToolsEnabled: boolean;
}

export function renderBattleScreen(model: BattleScreenModel): string {
  return `
    <!--
    THESIS: The fight owns the screen; compact controls wait at its edges until a Move turns the whole stage into an attack.
    OWN-WORLD: Full-bleed indigo arena, flat tomato/yellow combat rails, portrait roster tabs, steel-framed Charge tracks, and bold inked type.
    STORY: Read the race, choose a threshold, then watch without interruption as the Move, dodge, status, and impact resolve.
    FIRST VIEWPORT: The arena fills the viewport, health anchors the top corners, rosters hug the sides, and the player Charge rail spans the bottom.
    FORM: User-pinned action-battler reference, stable duel-stage composition, seed user-pinned-reference.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
    -->
    <main class="battle-screen battle-stage" id="main-content" data-battle-phase="loading" aria-busy="true">
      <header class="battle-rail">
        <button
          class="battle-pause-control"
          data-command="pause-battle"
          aria-label="Pause fight"
          disabled
        ><span aria-hidden="true">Ⅱ</span><small>Pause</small></button>
        <span class="round-label">${model.roundLabel}</span>
        <span class="timer-ticket" role="timer" aria-label="Time remaining">
          <span aria-hidden="true">TIME</span><strong data-battle-time>90</strong>
        </span>
        <div class="battle-rail-tools">
          <label>
            <span class="sr-only">Difficulty</span>
            <select name="difficulty">${model.difficultyOptions}</select>
          </label>
          <button
            data-command="toggle-music"
            class="now-playing"
            aria-label="${
              model.musicPlaybackEnabled ? "Turn music off" : "Turn music on"
            }"
            aria-pressed="${model.musicPlaybackEnabled}"
          >
            ${ICONS.music}<span data-now-playing>Red Thread</span>
          </button>
          ${
            model.devToolsEnabled
              ? '<button class="dev-battle-button" data-command="open-dev-inspector">DEV</button>'
              : ""
          }
        </div>
      </header>
      <section class="battle-drawer" aria-label="Battle">
        <aside class="bench-rail player-bench" aria-label="Your Lineup">
          <h2>Your Lineup</h2>
          <div data-player-bench></div>
        </aside>
        <section class="arena-specimen">
          <div class="fighter-readout player-readout" data-player-readout></div>
          <div class="fighter-readout enemy-readout" data-enemy-readout></div>
          <section class="enemy-charge-deck" aria-labelledby="enemy-charge-title">
            <div class="enemy-charge-heading">
              <span id="enemy-charge-title">Opponent Charge</span>
              <strong data-enemy-charge-value>0 / 100</strong>
            </div>
            <div
              class="enemy-accessory-readout"
              data-enemy-accessory
              aria-label="Opponent Accessory"
            ></div>
            <div class="enemy-charge-field">
              <div
                class="enemy-action-tray"
                data-enemy-action-tray
                aria-label="Opponent Move thresholds"
              ></div>
              <div
                class="meter charge-meter enemy-charge-meter"
                role="meter"
                aria-label="Enemy Charge"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="0"
                data-enemy-charge-meter
              >
                <span data-enemy-charge-fill></span>
              </div>
            </div>
          </section>
          <div class="arena-canvas" id="battle-canvas" aria-hidden="true"></div>
          <div
            class="battle-presentation-state"
            data-battle-presentation-state
            role="status"
            aria-live="assertive"
            aria-atomic="true"
            hidden
          >
            <strong data-battle-presentation-title>Move in progress</strong>
            <span>Battle paused during this Move</span>
          </div>
          <div class="matchup-stamp" data-matchup></div>
          <div class="combat-log" aria-live="polite" data-combat-log></div>
          <div
            class="battle-pickup-tray"
            data-player-pickups
            aria-label="Available battle pickups"
            aria-live="polite"
          ></div>
          <div class="battle-loading" data-battle-loading role="status">
            <div class="waiting-spinner" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <strong>Building arena</strong>
          </div>
          <div
            class="battle-countdown"
            data-battle-countdown
            role="status"
            aria-live="assertive"
            aria-atomic="true"
            hidden
          >
            <strong data-countdown-label>3</strong>
            <span>Stand by</span>
          </div>
        </section>
        <aside class="bench-rail enemy-bench" aria-label="Enemy Lineup">
          <h2>Enemy Lineup</h2>
          <div data-enemy-bench></div>
        </aside>
        <section class="command-deck" aria-label="Moves and player Charge">
          <div class="player-charge-deck">
            <button
              class="battle-accessory-control"
              data-command="battle-accessory"
              data-side="player"
              data-player-accessory
              aria-disabled="true"
            >Accessory</button>
            <div class="charge-deck-heading">
              <span>Your Charge</span>
              <strong data-player-charge-value>0 / 100</strong>
            </div>
            <div class="charge-control-field">
              <section
                class="action-tray"
                aria-label="Moves integrated with Charge"
                data-action-tray
              ></section>
              <div
                class="meter charge-meter command-charge-meter"
                role="meter"
                aria-label="Player Charge"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="0"
                data-player-charge-meter
              >
                <span data-player-charge-fill></span>
              </div>
              <div class="charge-scale" aria-hidden="true"><span>Charge</span><span>Full</span></div>
            </div>
          </div>
        </section>
      </section>
      <section
        class="battle-overlay"
        data-battle-overlay
        role="dialog"
        aria-modal="true"
        aria-labelledby="battle-overlay-title"
        hidden
      ></section>
      <section
        class="battle-result"
        data-battle-result
        role="dialog"
        aria-modal="true"
        aria-labelledby="battle-result-title"
        hidden
      ></section>
      <div class="sr-only" aria-live="polite" id="announcer"></div>
    </main>
  `;
}
