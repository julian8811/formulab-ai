/** @type {import('lint-staged').Configuration} */
function quotePath(f) {
  return `"${f.replace(/\\/g, "/").replace(/"/g, '\\"')}"`;
}

const config = {
  "*.{ts,tsx}": (files) => {
    const quoted = files.map((f) => quotePath(f)).join(" ");
    const prettierArgs = files.map((f) => quotePath(f)).join(" ");
    return [
      `eslint --fix ${quoted}`,
      `node scripts/prettier-write.mjs ${prettierArgs}`,
    ];
  },
  "*.{json,md,css}": (files) => {
    const prettierArgs = files.map((f) => quotePath(f)).join(" ");
    return [`node scripts/prettier-write.mjs ${prettierArgs}`];
  },
};

export default config;
