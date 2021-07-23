#!/usr/bin/env node
const unitverse = require('../dist/src/')

if (process.argv[2] === undefined) {
  console.log('Please specify input file')
  process.exit(1)
}

const runFunction = require('../' + process.argv[2])

const engine = unitverse.buildEngine()
// console.log(engine)
// const engine = new unitverse.Engine()

async function main () {
  const results = await engine.run(runFunction)
  console.log('Result:', results)
  await engine.close()
}

main()