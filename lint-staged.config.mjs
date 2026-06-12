/** @type {import('lint-staged').Configuration} */
const config = {
  "*.{ts,tsx}": (files) => {
    const quoted = files.map((f) => `"${f.replace(/"/g, '\\"')}"`).join(" ");
    const prettier = files.map(
      (f) => `prettier --write -- "${f.replace(/"/g, '\\"')}"`,
    );
    return [`eslint --fix ${quoted}`, ...prettier];
  },
  "*.{json,md,css}": (files) => {
    const prettier = files.map(
      (f) => `prettier --write -- "${f.replace(/"/g, '\\"')}"`,
    );
    return prettier;
  },
};

export default config;
