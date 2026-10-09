// Fold the Vite build into one self-contained page for publishing as an
// Artifact: the CSS and JS inlined, and no document skeleton, because the
// host wraps the page in its own <!doctype>/<head>/<body>.
//
//   npm run artifact   →  artifact/visualizer-demo.html
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const dist = join(root, "dist");
const html = readFileSync(join(dist, "index.html"), "utf8");

const cssHref = html.match(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"/)?.[1];
const jsSrc = html.match(/<script type="module"[^>]*src="\.\/([^"]+)"/)?.[1];
if (!cssHref || !jsSrc) throw new Error("could not find the built CSS and JS in dist/index.html");
const css = readFileSync(join(dist, cssHref), "utf8");
const js = readFileSync(join(dist, jsSrc), "utf8");
if (/<\/script/i.test(js)) throw new Error("the bundle contains </script and cannot be inlined as is");

const title = html.match(/<title>[^<]*<\/title>/)[0];
const body = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[^>]*src=[^>]*><\/script>\s*/g, "");

const out = `${title}\n<style>\n${css}\n</style>\n${body.trim()}\n<script type="module">\n${js}\n</script>\n`;
mkdirSync(join(root, "artifact"), { recursive: true });
writeFileSync(join(root, "artifact", "visualizer-demo.html"), out);
console.log(`artifact/visualizer-demo.html  ${(out.length / 1024).toFixed(1)} kB`);
