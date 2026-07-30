import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/league-gothic/400.css";
import { App } from "./app/App";
import { accessories, actions, characters } from "./content/initial-content";
import { validateContent } from "./content/schema";
import "./styles.css";

validateContent(actions, characters, accessories);

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error("Fighter could not find its application mount.");
}

const app = new App(root);
app.mount();

if (import.meta.hot) {
  import.meta.hot.dispose(() => app.destroy());
}
