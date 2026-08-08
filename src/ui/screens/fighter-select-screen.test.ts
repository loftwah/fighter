import { describe, expect, it } from "vitest";
import {
  renderFighterSelectScreen,
  type FighterSelectInstance,
  type FighterSelectLineupAccessory,
  type FighterSelectScreenModel,
  type FighterSelectSlot,
} from "./fighter-select-screen";

const viking = (instanceId: string): FighterSelectInstance => ({
  instanceId,
  characterId: "character.viking",
  name: "Viking",
  portraitAssetId: "image.viking.canonical",
  typeLabel: "Brawler",
  traitLabels: ["Historic"],
});

const emptySlots = (): FighterSelectSlot[] => [
  { id: "starter", label: "Starter" },
  { id: "bench-1", label: "Bench 1" },
  { id: "bench-2", label: "Bench 2" },
];

const accessory = (
  selectedId: string | null = "accessory.press-pass",
  overrides: Partial<FighterSelectLineupAccessory> = {},
): FighterSelectLineupAccessory => ({
  selectedId,
  options: [
    {
      id: "accessory.press-pass",
      name: "Second Wind",
      description: "Add Charge to your Lineup's Strip.",
      imageAssetId: "image.accessory.second-wind",
    },
    {
      id: "accessory.dead-air",
      name: "Dead Air",
      description: "Blank the opposing Charge Strip.",
      imageAssetId: "image.accessory.dead-air",
    },
  ],
  ...overrides,
});

const model = (
  overrides: Partial<FighterSelectScreenModel> = {},
): FighterSelectScreenModel => ({
  mode: "quick",
  title: "Choose Fighters",
  activeSide: "player",
  canEditOpponent: true,
  player: {
    label: "Your Lineup",
    slots: emptySlots(),
    accessory: accessory(),
  },
  opponent: {
    label: "Opponent Lineup",
    slots: emptySlots(),
    accessory: accessory("accessory.dead-air"),
  },
  catalogue: [viking("quick-player-viking-1")],
  pagination: {
    page: 1,
    pageCount: 50,
    rangeStart: 1,
    rangeEnd: 6,
    total: 300,
  },
  accessorySide: "player",
  navigation: {
    parentLabel: "Main Menu",
    parentCommand: "quick-parent",
    mainMenuCommand: "go-main-menu",
  },
  continueCommand: "confirm-quick-fighters",
  ...overrides,
});

describe("Fighter Select screen", () => {
  it("renders the paginated portrait catalogue and both Quick Fight sides", () => {
    const markup = renderFighterSelectScreen(model());

    expect(markup).toContain("data-fighter-select");
    expect(markup).toContain('data-asset-id="image.viking.canonical"');
    expect(markup).toContain("Your Lineup");
    expect(markup).toContain("Opponent Lineup");
    expect(markup).toContain("1/50");
    expect(markup).toContain('aria-label="Previous fighter page"');
    expect(markup).toContain('data-command="go-to-fighter-page"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('type="search"');
    expect(markup).not.toContain("<select");
    expect(markup).not.toContain("1–6 of 300 fighters");
    expect(markup).not.toContain("Page 1 of 50");
  });

  it("renders explicit Parent and Main Menu navigation without generic Back copy", () => {
    const markup = renderFighterSelectScreen(
      model({
        navigation: {
          parentLabel: "Tournament Lobby",
          parentCommand: "return-to-tournament-lobby",
          mainMenuCommand: "quit-to-main-menu",
        },
      }),
    );

    expect(markup).toContain('data-command="return-to-tournament-lobby"');
    expect(markup).toContain("Tournament Lobby");
    expect(markup).toContain('data-command="quit-to-main-menu"');
    expect(markup).toContain(">Main Menu</button>");
    expect(markup).not.toContain('aria-label="Back"');
    expect(markup).not.toContain(">Back</span>");
  });

  it("renders Lineup-owned Accessory rails and a bounded visual tray", () => {
    const markup = renderFighterSelectScreen(model());

    expect(markup).toContain('data-command="open-lineup-accessories"');
    expect(markup).toContain('data-command="close-lineup-accessories"');
    expect(markup).toContain('data-command="set-lineup-accessory"');
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('data-side="player"');
    expect(markup).toContain('data-accessory-id=""');
    expect(markup).toContain('data-accessory-id="accessory.press-pass"');
    expect(markup).toContain('data-asset-id="image.accessory.second-wind"');
    expect(markup).toContain("No Accessory");
    expect(markup).toContain("Lineup Accessory");
    expect(markup).not.toContain("set-match-accessory");
    expect(markup).not.toContain("<select");
  });

  it("hides pagination when every fighter fits on one page", () => {
    const markup = renderFighterSelectScreen(
      model({
        pagination: {
          page: 1,
          pageCount: 1,
          rangeStart: 1,
          rangeEnd: 6,
          total: 6,
        },
      }),
    );

    expect(markup).not.toContain("fighter-pagination");
    expect(markup).not.toContain("1/1");
  });

  it("keeps exact duplicate Characters selectable through unique instance IDs", () => {
    const markup = renderFighterSelectScreen(
      model({
        catalogue: [
          viking("quick-player-viking-1"),
          viking("quick-player-viking-2"),
        ],
      }),
    );

    expect(markup).toContain('data-instance-id="quick-player-viking-1"');
    expect(markup).toContain('data-instance-id="quick-player-viking-2"');
    expect(markup.match(/data-character-id="character\.viking"/g)).toHaveLength(
      2,
    );
  });

  it("renders an ordered Starter and bench dock without redundant counts", () => {
    const fighter = viking("story-viking-owned-2");
    const markup = renderFighterSelectScreen(
      model({
        mode: "story",
        canEditOpponent: false,
        player: {
          label: "Your Lineup",
          slots: [
            { id: "starter", label: "Starter", fighter },
            { id: "bench-1", label: "Bench 1" },
            { id: "bench-2", label: "Bench 2" },
          ],
        },
        opponent: {
          label: "Opponent Lineup",
          locked: true,
          slots: emptySlots(),
          accessory: accessory("accessory.dead-air", {
            locked: true,
            status: "Authored",
          }),
        },
      }),
    );

    expect(markup).toContain("Starter");
    expect(markup).toContain("Bench 1");
    expect(markup).toContain("Bench 2");
    expect(markup).toContain('data-command="remove-fighter"');
    expect(markup).toContain('data-side="player"');
    expect(markup).toContain("Locked");
    expect(markup).toContain("Lineup Accessory · Authored");
    expect(markup).toMatch(
      /data-lineup-accessory data-side="opponent"[\s\S]*?Dead Air[\s\S]*?Locked/,
    );
    expect(markup).not.toMatch(
      /<button(?=[^>]*data-command="open-lineup-accessories")(?=[^>]*data-side="opponent")[^>]*>/,
    );
    expect(markup).not.toContain(">1/3<");
    expect(markup).not.toContain("change-fighter-side");
  });

  it("makes lineup order editable without a separate Starter command", () => {
    const markup = renderFighterSelectScreen(
      model({
        targetSlot: { side: "player", slotId: "bench-1" },
        player: {
          label: "Your Lineup",
          slots: [
            { id: "starter", label: "Starter", fighter: viking("copy-1") },
            { id: "bench-1", label: "Bench 1", fighter: viking("copy-2") },
            { id: "bench-2", label: "Bench 2" },
          ],
        },
      }),
    );

    expect(markup).toContain('data-command="move-fighter"');
    expect(markup).toMatch(
      /data-command="move-fighter"[\s\S]*?data-instance-id="copy-2"[\s\S]*?data-side="player"/,
    );
    expect(markup).toContain('data-fighter-drag="selected"');
    expect(markup).toContain('data-command="target-fighter-slot"');
    expect(markup).not.toContain("Make Starter");
    expect(markup).not.toContain("set-fighter-starter");
  });

  it("turns an empty-slot target into a clear catalogue instruction", () => {
    const markup = renderFighterSelectScreen(
      model({
        targetSlot: { side: "player", slotId: "bench-1" },
      }),
    );

    expect(markup).toContain("fighter-catalogue is-targeting");
    expect(markup).toContain("fighter-target-prompt is-active");
    expect(markup).toContain("Choose a fighter for Bench 1 in Your Lineup.");
    expect(markup).toContain('role="status"');
    expect(markup).not.toContain("Select the Starter first");
  });

  it("reserves the target prompt without showing an instruction prematurely", () => {
    const markup = renderFighterSelectScreen(model({ targetSlot: undefined }));

    expect(markup).toContain('class="fighter-target-prompt "');
    expect(markup).not.toContain("fighter-catalogue is-targeting");
    expect(markup).not.toContain(
      "Choose a fighter for Bench 1 in Your Lineup.",
    );
  });

  it("exposes unavailable state in text and disables defeated fighters", () => {
    const markup = renderFighterSelectScreen(
      model({
        catalogue: [
          {
            ...viking("tournament-viking-1"),
            availability: "defeated",
            unavailableReason: "Defeated in Round 1",
            healthPercent: 0,
          },
        ],
      }),
    );

    expect(markup).toContain("Defeated");
    expect(markup).toContain("Defeated in Round 1");
    expect(markup).toContain('aria-valuenow="0"');
    expect(markup).toMatch(/data-command="select-fighter"[\s\S]*?disabled/);
  });

  it("escapes controller-owned text and omits rejected setup copy", () => {
    const markup = renderFighterSelectScreen(
      model({
        title: '<img src=x onerror="alert(1)">',
        context: "Round <script>bad()</script>",
      }),
    );

    expect(markup).toContain("&lt;img");
    expect(markup).not.toContain("<script>");
    expect(markup).not.toContain("Ready to Fight");
    expect(markup).not.toContain("Builds: Standard");
    expect(markup).not.toContain("Progression");
    expect(markup).not.toContain("Select the Starter first");
    expect(markup).not.toContain(">Previous<");
    expect(markup).not.toContain(">Next<");
  });
});
