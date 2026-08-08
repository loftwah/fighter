import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  Circle,
  ChevronLeft,
  ChevronRight,
  Clock,
  GripHorizontal,
  House,
  ListChecks,
  LockKeyhole,
  Medal,
  Minus,
  Music2,
  Plus,
  Search,
  Settings,
  Shuffle,
  SlidersHorizontal,
  Store,
  Swords,
  Trophy,
  UserRound,
  X,
  Zap,
  type IconNode,
} from "lucide";

export interface IconRenderOptions {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const escapeAttribute = (value: string | number): string =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const renderAttributes = (
  attributes: Readonly<Record<string, string | number | undefined>>,
): string =>
  Object.entries(attributes)
    .filter(
      (entry): entry is [string, string | number] => entry[1] !== undefined,
    )
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(" ");

/**
 * Serialises an official Lucide icon definition for the string-rendered UI.
 * Icons are decorative by default; icon-only controls must label the control.
 */
export const renderIcon = (
  icon: IconNode,
  options: IconRenderOptions = {},
): string => {
  const size = options.size ?? 24;
  const children = icon
    .map(([tag, attributes]) => `<${tag} ${renderAttributes(attributes)}/>`)
    .join("");

  return `<svg ${renderAttributes({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": options.strokeWidth ?? 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    class: options.className,
    "aria-hidden": "true",
    focusable: "false",
  })}>${children}</svg>`;
};

const ICON_NODES = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  drag: GripHorizontal,
  remove: X,
  check: Check,
  circle: Circle,
  plus: Plus,
  minus: Minus,
  search: Search,
  shuffle: Shuffle,
  clock: Clock,
  lock: LockKeyhole,
  bolt: Zap,
  sliders: SlidersHorizontal,
  story: BookOpen,
  collection: Boxes,
  store: Store,
  missions: ListChecks,
  tournament: Trophy,
  achievements: Medal,
  quick: Swords,
  profile: UserRound,
  settings: Settings,
  home: House,
  music: Music2,
} as const satisfies Record<string, IconNode>;

export type IconName = keyof typeof ICON_NODES;

export const ICONS = Object.fromEntries(
  Object.entries(ICON_NODES).map(([name, icon]) => [name, renderIcon(icon)]),
) as Readonly<Record<IconName, string>>;
