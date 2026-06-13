import fs from "node:fs/promises";
import { resolve } from "node:path";
import prettier from "prettier";

for (const file of process.argv.slice(2)) {
  const filepath = resolve(file);
  const config = await prettier.resolveConfig(filepath);
  const content = await fs.readFile(filepath, "utf8");
  const formatted = await prettier.format(content, { ...config, filepath });
  await fs.writeFile(filepath, formatted);
}
