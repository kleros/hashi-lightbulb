import fs from "fs";
import path from "path";

const GENERATED_DIR = path.resolve("contracts/broadcast");
const OUTPUT_FILE = path.resolve("src/utils/routes/registry.ts");

const files = fs.readdirSync(GENERATED_DIR).filter((f) => f.endsWith(".json"));

if (files.length === 0) {
  throw new Error("No route files found");
}

let imports = `import type { FlatRouteFile } from "../types";\n\n`;
let entries = "";

files.forEach((file, i) => {
  const varName = `route_${i}`;
  imports += `import ${varName} from "../../../contracts/broadcast/${file}";\n`;
  entries += `  "${file.replace(".json", "")}": ${varName},\n`;
});

const content = `
${imports}
export const ROUTES: Record<string, FlatRouteFile> = {
${entries}
};
`;

fs.writeFileSync(OUTPUT_FILE, content.trim() + "\n");
