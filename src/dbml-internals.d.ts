// The pinned package exposes runtime DBML-only modules under lib/.
// Reuse its public declarations to type those imports without bundling SQL parsers.
declare module "*/@dbml/core/lib/parse/deprecated/dbmlParser.mjs" {
  import type { Parser } from "@dbml/core";
  export function require_dbmlParser(): {
    parse: typeof Parser.parseDBMLToJSON;
  };
}

declare module "*/@dbml/core/lib/model_structure/database.mjs" {
  import { Database } from "@dbml/core";
  export default Database;
}
