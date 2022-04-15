const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { minify } = require("html-minifier-terser");
const { extname, join } = require("path");
const { execSync } = require("child_process");

const OUT_PATH = "out";

const HTML_MINIFIER_CONFIG = {
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  decodeEntities: true,
  includeAutoGeneratedTags: false,
  minifyJS: true,
  minifyURLs: true,
  processConditionalComments: true,
  processScripts: ["text/html"],
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortAttributes: true,
  sortClassName: true,
  trimCustomFragments: true,
  useShortDoctype: true,
};

let commit = process.env.npm_package_gitHead?.slice(0, 7);

if (!commit) {
  try {
    commit = execSync("git rev-parse --short HEAD", { cwd: __dirname })
      .toString()
      .trim();
  } catch {
    commit = new Date().toISOString().slice(0, 10);
  }
}

const CODE_REPLACE_FUNCTIONS = [
  (html) => html.replace(/<noscript (.*)><\/noscript>/, ""),
  (html) => html.replace(/><\/path>/, "/>"),
  (html) => html.replace(/<script (.*) nomodule=""><\/script>/, ""),
  (html) =>
    html.replace(
      /<style data-styled="" data-styled-version=(.*)>/,
      '<style data-styled="">'
    ),
  (html) =>
    html.replace(
      /<script id=__NEXT_DATA__ type=application\/json>(.*)<\/script>/,
      `<script id=__NEXT_DATA__ type=application/json>{"buildId":"${commit}","page":"/","props":{}}</script>`
    ),
];

readdirSync(OUT_PATH).forEach(async (entry) => {
  if (extname(entry) === ".html") {
    const filPath = join(OUT_PATH, entry);
    const html = readFileSync(filPath);
    let minifiedHtml = await minify(html.toString(), HTML_MINIFIER_CONFIG);

    CODE_REPLACE_FUNCTIONS.forEach((codeFunction) => {
      minifiedHtml = codeFunction(minifiedHtml);
    });

    writeFileSync(filPath, minifiedHtml);
  }
});
