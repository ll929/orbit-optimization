/**
 * Created by LiuLei on 2019-04-24
 */
const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')

const argv = process.argv
// console.log(argv.slice(2))

const COMMANDER = {
  INPUT_PATH: '--i',
  // default is input_path
  OUTPUT_DIR_PATH: '--od',
  HELP: '--help',
  VERSION: '--version',
  REMOVE_ORBITAL: '--rmo',
}

function findArgv (cmd) {
  return argv.find(item => item.substr(0, cmd.length) === cmd)
}

//TODO  VERSION HELP

const fReadFilePathArgv = findArgv(COMMANDER.INPUT_PATH)
if (!fReadFilePathArgv) {
  console.log('\033[41;30m FAIL \033[40;31m --i is request \033[0m')
  return
}
const removeOrbitalArgv = findArgv(COMMANDER.REMOVE_ORBITAL)
if (!removeOrbitalArgv) {
  console.log('\033[41;30m FAIL \033[40;31m --rmo is request \033[0m')
  return
}
const fReadFilePath = fReadFilePathArgv.replace(`${COMMANDER.INPUT_PATH}=`, '')
const removeOrbital = removeOrbitalArgv.replace(`${COMMANDER.REMOVE_ORBITAL}=`, '')
const fWriteDirPathArgv = findArgv(COMMANDER.OUTPUT_DIR_PATH)
const defaultFWriteDirPath = path.dirname(fReadFilePath)
let fWriteDirPath = defaultFWriteDirPath
if (fWriteDirPathArgv) {
  fWriteDirPath = fWriteDirPathArgv.replace(`${COMMANDER.OUTPUT_DIR_PATH}=`, '')
}

const fReadNameBasename = path.basename(fReadFilePath)
const fReadNameExtname = path.extname(fReadFilePath)
const fWriteName = fReadNameBasename.replace(fReadNameExtname, '') + '_OPTIMIZATION' + fReadNameExtname
const fWriteFilePath = path.join(fWriteDirPath, fWriteName)

const fRead = fs.createReadStream(fReadFilePath)
const fWrite = fs.createWriteStream(fWriteFilePath)

const rl = readline.createInterface({
  input: fRead,
})

const orbitalReg = new RegExp(removeOrbital.toLocaleUpperCase().split(',').join('|'))
let isStart = false
rl.on('line', line => {
  console.time('used time')
  if (/Molecular Orbital Coefficients/.test(line)) {
    isStart = true
  }
  const isMatching = line.match(orbitalReg)
  if (!!isMatching && isStart) {
    const matchKey = isMatching[0]
    const lineArr = line.split(orbitalReg)
    lineArr[1] = lineArr[1].replace(/\d/g, 0).replace(/-/g, ' ')
    fWrite.write(lineArr.join(matchKey) + os.EOL) // next line
  } else {
    fWrite.write(line + os.EOL) // next line
  }
})
rl.on('close', () => {
  console.log('\033[42;30m DONE \033[40;32m removed orbital is ' + removeOrbital + ' \033[0m')
  console.timeEnd('used time')
})
