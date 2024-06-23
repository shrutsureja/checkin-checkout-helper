import fs from "fs";

export function writeJSONtoFile(fileName, data) {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  console.log("File written successfully");
}

export function writeHTMLtoFile(fileName, data) {
  fs.writeFileSync(fileName, data);
  console.log("File written successfully");
}
