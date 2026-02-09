#!/bin/bash

ARTIFACTS_DIR="./contracts/out" 
SDK_ABI_DIR="./sdk/abi"
TYPECHAIN_DIR="./typechain-types"

# Prepare the directories
rm -rf "$SDK_ABI_DIR"
rm -rf "$TYPECHAIN_DIR"
mkdir -p "$SDK_ABI_DIR"

echo "🎯 Extracting specific ABIs to $SDK_ABI_DIR..."

node -e "
const fs = require('fs');
const path = require('path');

const ALLOW_LIST = [
  'VeaReporter.json',
  'VeaAdapter.json',
  'LayerZeroAdapter.json',
  'LayerZeroReporter.json',
  'CCIPAdapter.json',
  'CCIPReporter.json',
  'Yaho.json',
  'Yaru.json',
  'Hashi.json',
  'Adapter.json',
  'Reporter.json'
];

function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else if (ALLOW_LIST.includes(file)) {
            results.push(fullPath);
        }
    });
    return results;
}

const targetFiles = getFiles('$ARTIFACTS_DIR');

targetFiles.forEach(file => {
    try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (content.abi) {
            const name = path.basename(file);
            fs.writeFileSync(path.join('$SDK_ABI_DIR', name), JSON.stringify(content.abi, null, 2));
            console.log('✅ Extracted: ' + name);
        }
    } catch (e) {
        console.error('❌ Error parsing ' + file);
    }
});
"

# Run TypeChain ONLY on the filtered ABIs
echo "🚀 Generating targeted TypeChain types..."
npx typechain --target ethers-v5 "$SDK_ABI_DIR/*.json" --out-dir "$TYPECHAIN_DIR"

echo "✨ Done! Types and ABIs are now lean."