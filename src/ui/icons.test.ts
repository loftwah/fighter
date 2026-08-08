import { describe, expect, it } from "vitest";
import { Search } from "lucide";

import { ICONS, renderIcon } from "./icons";

describe("interface icon registry", () => {
  it("renders Lucide definitions with consistent decorative defaults", () => {
    const icon = renderIcon(Search);

    expect(icon).toContain('viewBox="0 0 24 24"');
    expect(icon).toContain('width="24"');
    expect(icon).toContain('height="24"');
    expect(icon).toContain('stroke="currentColor"');
    expect(icon).toContain('stroke-width="2"');
    expect(icon).toContain('stroke-linecap="round"');
    expect(icon).toContain('stroke-linejoin="round"');
    expect(icon).toContain('aria-hidden="true"');
    expect(icon).toContain('focusable="false"');
  });

  it("supports bounded presentation overrides without changing icon geometry", () => {
    const icon = renderIcon(Search, {
      className: 'search-icon" data-injected="true',
      size: 18,
      strokeWidth: 1.5,
    });

    expect(icon).toContain(
      'class="search-icon&quot; data-injected=&quot;true"',
    );
    expect(icon).toContain('width="18"');
    expect(icon).toContain('height="18"');
    expect(icon).toContain('stroke-width="1.5"');
    expect(icon).not.toContain('class="search-icon" data-injected="true"');
  });

  it("keeps the complete shared string API available to screens", () => {
    expect(Object.keys(ICONS)).toEqual([
      "arrowLeft",
      "arrowRight",
      "chevronLeft",
      "chevronRight",
      "drag",
      "remove",
      "check",
      "circle",
      "plus",
      "minus",
      "search",
      "shuffle",
      "clock",
      "lock",
      "bolt",
      "sliders",
      "story",
      "collection",
      "store",
      "missions",
      "tournament",
      "achievements",
      "quick",
      "profile",
      "settings",
      "home",
      "music",
    ]);
    expect(Object.values(ICONS).every((icon) => icon.startsWith("<svg "))).toBe(
      true,
    );
  });
});
