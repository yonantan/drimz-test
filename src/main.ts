import fg from "fast-glob";
import { parseFile } from "@swc/core";
import { TsxVisitor } from "./TsxVisitor";

// parse a single module and return an updated visitor containing components and elements
async function getModuleAst(filePath: string) {
  const visitor = new TsxVisitor();

  try {
    const program = await parseFile(filePath, {
      tsx: true,
      syntax: "typescript",
    });
    visitor.visitProgram(program);
  } catch (error) {
    console.error("Error", filePath, error);
  }

  return visitor;
}

// finds and parses all the relevant modules and prints the results
async function main() {
  const tsxFiles = await fg(process.argv[2]);
  const results = new Map();

  for await (const filePath of tsxFiles) {
    results.set(filePath, await getModuleAst(filePath));
  }

  for (let [filePath, { elements, components }] of results.entries()) {
    console.log("File path:", filePath);
    console.log("Elements:");
    console.table(elements);
    console.log("Components:");
    console.table(components);
  }
}

main();
