#!/usr/bin/env node
const unitverse = require('../dist/src/')

if (process.argv[2] === undefined) {
  process.exit(1)
}

const runFunction = require('../' + process.argv[2])

const engine = unitverse.buildEngine()


async function main () {
  const results = await engine.run(runFunction)
  await engine.close()
}

main()