// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts"

await emptyDir("./npm")

await build({
  entryPoints: [
    "./src/index.ts",
    {
      name: "./openai",
      path: "./src/openai.ts",
    },
  ],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    // deno: true,
  },
  package: {
    // package.json properties
    name: "llmonitor",
    version: "0.5.0",
    description:
      "llmonitor is an open-source monitoring and analytics platform for AI apps.",
    author: "llmonitor",
    license: "Apache",
    repository: {
      type: "git",
      url: "git+https://github.com/llmonitor/llmonitor-js.git",
    },
    bugs: {
      url: "https://github.com/llmonitor/llmonitor-js/issues",
    },
    dependencies: {
      unctx: "^2.3.1",
    },
    peerDependencies: {
      openai: "^4.3.0",
    },
    peerDependenciesMeta: {
      openai: {
        optional: true,
      },
    },
    typesVersions: {
      "*": {
        openai: ["./esm/openai.d.ts"],
      },
    },
  },
  typeCheck: false,
  test: false,
  postBuild() {
    // steps to run after building and before running the tests
    // Deno.copyFileSync("LICENSE", "npm/LICENSE")
    Deno.copyFileSync("README.md", "npm/README.md")
  },
})
