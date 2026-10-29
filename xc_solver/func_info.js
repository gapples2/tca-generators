import { readFileSync } from "node:fs"

let funcList = readFileSync("./func_list.txt").toString("utf8")
funcList = funcList.split("\r\n").slice(1).filter(x => x.length > 10)
let wiped = {}
let corrupted = {}
let unlocked = {}
for(let str of funcList) {
    let arr = str.split("\t")
    let id = arr[0]
    wiped[id] = arr.at(-2) == "TRUE"
    corrupted[id] = arr.at(-1) == "TRUE"
    unlocked[id] = arr[1] == "TRUE"
}

export {wiped, corrupted, unlocked}