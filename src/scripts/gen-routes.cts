import fs from "fs";
import path from "path";

const GENERATED_DIR = path.resolve("contracts/broadcast");
const OUTPUT_FILE = path.resolve("src/utils/routes/registry.ts");
const OUTPUT_SDK = path.resolve("sdk/registry.ts");
const ADDRESSES_SDK = path.resolve("sdk/addresses");

const files = fs.readdirSync(GENERATED_DIR).filter((f) => f.endsWith(".json"));

if (files.length === 0) {
  throw new Error("No route files found");
}

let imports = `import type { FlatRouteFile } from "../types";\n\n`;
let sdkImports = `import type { FlatRouteFile } from "./types";\n\n`;
let entries = "";

files.forEach((file, i) => {
  const varName = `route_${i}`;
  const sourcePath = path.join(GENERATED_DIR, file);
  const destPath = path.join(ADDRESSES_SDK, file);
  fs.copyFileSync(sourcePath, destPath);


  imports += `import ${varName} from "../../../contracts/broadcast/${file}";\n`;
  sdkImports += `import ${varName} from "./addresses/${file}";\n`;
  entries += `  "${file.replace(".json", "")}": ${varName},\n`;

});

const content = `
${imports}
export const ROUTES: Record<string, FlatRouteFile> = {
${entries}
};
`;
const sdkContent = `${sdkImports}
export const ROUTES: Record<string, FlatRouteFile> = {
${entries}
};
`;

const writeFileSafe = (targetPath: string, data: string): void => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, data.trim() + "\n");
  console.log(`✅ Generated: ${targetPath}`);
};

writeFileSafe(OUTPUT_FILE, content);
writeFileSafe(OUTPUT_SDK, sdkContent);
