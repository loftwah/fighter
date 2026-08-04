import { ICONS } from "../icons";
import type { BattlePresentationStyle } from "../../dev/experiments";

export interface BattleScreenModel {
  roundLabel: string;
  difficultyOptions: string;
  musicPlaybackEnabled: boolean;
  devToolsEnabled: boolean;
  presentationStyle: BattlePresentationStyle;
}

export function renderBattleScreen(model: BattleScreenModel): string {
  return `
    <!--
    THESIS: The fight is the interface; permanent chrome is limited to the information needed for the next decision.
    OWN-WORLD: Full-screen rectangular character plates, two information-rich Charge instruments, ringed Move seals, and short graphic state transitions.
    STORY: Read the opponent's threats at the top, choose from your thresholds at the bottom, then let the impact own the stage.
    FIRST VIEWPORT: The arena fills the viewport between a mirrored opponent threat bar and player command bar; both expose three named Moves at their real Charge thresholds.
    FORM: User-pinned Teeny Titans 2 interaction grammar translated into LOFTWAH FIGHTER's rectangular-art system.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
    -->
    <main
      class="battle-screen battle-stage"
      id="main-content"
      data-battle-layout="rail-first"
      data-battle-presentation="${model.presentationStyle}"
      data-battle-phase="loading"
      aria-busy="true"
    >
      <header class="battle-rail">
        <button
          class="battle-pause-control"
          data-command="pause-battle"
          aria-label="Pause fight"
          title="Pause fight · Escape"
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
        <section
            class="enemy-combat-console"
            data-enemy-combat-console
            aria-label="Opponent Health and Charge"
          >
            <div class="combat-vitals-row enemy-vitals-row">
              <div class="fighter-readout enemy-readout" data-enemy-readout></div>
              <div
                class="combat-readiness-marker enemy-decision-cue"
                data-enemy-decision-cue
                data-decision-state="standby"
                role="status"
                aria-live="off"
                aria-atomic="true"
              >
                <i class="readiness-lamp" aria-hidden="true"></i>
                <strong data-enemy-decision-title>OPPONENT</strong>
                <span data-enemy-decision-detail>Waiting for FIGHT</span>
              </div>
            </div>
            <section class="enemy-charge-deck" aria-labelledby="enemy-charge-title">
              <div class="enemy-charge-heading">
                <div>
                  <span id="enemy-charge-title">Opponent Charge</span>
                  <small data-enemy-charge-rate>+0.0 / sec</small>
                </div>
                <strong data-enemy-charge-value>0 / 100</strong>
              </div>
              <button
                type="button"
                class="enemy-accessory-readout"
                data-enemy-accessory
                data-battle-inspectable
                data-command="inspect-battle-detail"
                aria-label="Opponent Accessory"
                aria-expanded="false"
              ></button>
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
        </section>
        <section class="arena-specimen">
          <div class="arena-canvas" id="battle-canvas" aria-hidden="true"></div>
          <div
            class="sr-only battle-presentation-announcement"
            data-battle-presentation-state
            role="status"
            aria-live="assertive"
            aria-atomic="true"
            hidden
          >
            <strong data-battle-presentation-side>Move in progress</strong>
            <span data-battle-presentation-title>Character · Move</span>
            <small data-battle-presentation-instruction>WATCH · controls return after the hit</small>
          </div>
          <div
            class="battle-impact-verdict"
            data-battle-impact-verdict
            data-impact-tone="hit"
            aria-hidden="true"
            hidden
          >
            <strong data-battle-impact-label>HIT</strong>
            <span data-battle-impact-detail>0 DAMAGE</span>
          </div>
          <div class="matchup-stamp" data-matchup></div>
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
            class="battle-versus-intro"
            data-battle-versus-intro
            aria-label="Matchup"
            hidden
          >
            <article data-matchup-player></article>
            <strong aria-hidden="true">VS</strong>
            <article data-matchup-enemy></article>
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
        <section
          class="command-deck"
          data-player-combat-console
          aria-label="Your Health, Moves and Charge"
        >
          <div class="combat-vitals-row player-vitals-row">
            <div class="fighter-readout player-readout" data-player-readout></div>
            <div
              class="combat-readiness-marker battle-decision-cue"
              data-battle-decision-cue
              data-decision-state="standby"
              role="status"
              aria-live="off"
              aria-atomic="true"
            >
              <i class="readiness-lamp" aria-hidden="true"></i>
              <strong data-battle-decision-title>GET READY</strong>
              <span data-battle-decision-detail>Charge starts after FIGHT</span>
            </div>
          </div>
          <div class="player-charge-deck">
            <button
              class="battle-accessory-control"
              data-command="battle-accessory"
              data-side="player"
              data-player-accessory
              data-battle-inspectable
              aria-expanded="false"
              aria-disabled="true"
            >Accessory</button>
            <div class="charge-deck-heading">
              <span>
                Your Charge
                <small data-player-charge-rate>+0.0 / sec</small>
              </span>
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
              <div class="charge-scale" aria-hidden="true">
                <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>
          </div>
          <section
            class="battle-event-feed"
            data-battle-event-feed
            aria-labelledby="battle-event-feed-title"
          >
            <strong id="battle-event-feed-title">Fight feed</strong>
            <div class="combat-log" aria-live="polite" data-combat-log></div>
          </section>
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
