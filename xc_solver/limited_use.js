import { UNIQUE_FUNCTION_LIMIT, FUNCTION_PER_LIMIT, SOLUTION_MIN, SOLUTION_MAX, CONSTANT_FUNCTIONS, SOLUTION_INPUTS } from "./const.js"
import { unary } from "./unary.js"
import { binary } from "./binary.js"
import {wiped, corrupted} from "./func_info.js"
import {numbers, numberWords} from "./const_funcs.js"
import {identity} from "./identity_funcs.js"

import { writeFile } from "node:fs"

const usableNumbers = numbers.filter(x => !wiped[numberWords[x].toUpperCase()] && !corrupted[numberWords[x].toUpperCase()])

const COMBO_AMT = UNIQUE_FUNCTION_LIMIT - 1
const COMBO_LEN = COMBO_AMT * FUNCTION_PER_LIMIT

function validCombination(n, len) {
	let count = []
	for (let i = 0; i < COMBO_AMT; i++) {
		count[i] = 0
	}
	while (n > 0) {
		count[n % COMBO_AMT]++
		n = Math.floor(n / COMBO_AMT)
	}
	count[0] += len - count.reduce((p, v) => p + v, 0)
	for (let c of count) {
		if (c > FUNCTION_PER_LIMIT) return false
	}
	return true
}

function generateCombinationsLen(len) {
	let arr = []
	let max = COMBO_AMT ** len
	for (let x = 0; x < max; x++) {
		if (validCombination(x, len)) {
			let a = []
			let n = x
			for (let i = 0; i < len; i++) {
				a.push(n % COMBO_AMT)
				n = Math.floor(n / COMBO_AMT)
			}
			arr.push(a)
		}
	}
	return arr
}

function generateCombinations() {
	let arr = []
	for (let i = 0; i <= COMBO_LEN; i++) {
		arr.push(generateCombinationsLen(i))
		/*for(let a of arr.at(-1)) {
			console.log(a.join(", "))
		}*/
	}
	return arr.flat()
}

const BINARY_COMBOS = [
	[0, 0, 0],
	[1, 0, 0], [0, 1, 0], [0, 0, 1],
	[2, 0, 0], [0, 2, 0], [0, 0, 2], [1, 1, 0], [1, 0, 1], [0, 1, 1],
	[3, 0, 0], [0, 3, 0], [0, 0, 3], [2, 1, 0], [1, 2, 0], [2, 0, 1], [1, 0, 2], [0, 2, 1], [0, 1, 2]
]

function findSolutions(funcs, solutions, combos, init = usableNumbers) {
	for (let order of combos) {
		for (let n of init) {
			let initial = n
			let good = true
			for (let fi of order) {
				let func = funcs[fi]
				n -= func.offset
				if (n < func.min || n >= func.max || n % 1 != 0) {
					good = false
					break;
				}
				n = func.value(n)
			}
			if (!good) continue;
			if (n < SOLUTION_MIN || n > SOLUTION_MAX) continue;
			if (solutions[n]/* && solutions[n][1].length <= order.length*/) continue;
			solutions[n] = [funcs, order, initial, "unary"]
		}
	}
}

function findSolutionsBinary(ufunc, bfunc, solutions, nums = usableNumbers) {
	for(let combo of BINARY_COMBOS) {
		outer:
		for(let n of nums) {
			let left = n
			let right = n
			for(let i = 0; i < combo[0]; i++) {
				left -= ufunc.offset
				if (left < ufunc.min || left >= ufunc.max || left % 1 != 0) {
					continue outer;
				}
				left = ufunc.value(left)
			}
			for(let i = 0; i < combo[1]; i++) {
				right -= ufunc.offset
				if (right < ufunc.min || right >= ufunc.max || right % 1 != 0) {
					continue outer;
				}
				right = ufunc.value(right)
			}
			if(
				left < bfunc.min || right < bfunc.min ||
				left >= bfunc.max || right >= bfunc.max ||
				left % 1 != 0 || right % 1 != 0
			) {
				continue outer;
			}
			let val = bfunc.value(left, right)
			for(let i = 0; i < combo[2]; i++) {
				val -= ufunc.offset
				if (val < ufunc.min || val >= ufunc.max || val % 1 != 0) {
					continue outer;
				}
				val = ufunc.value(val)
			}
			if(val < SOLUTION_MIN || val > SOLUTION_MAX || val % 1 != 0)continue outer;
			if(solutions[val])continue outer;
			solutions[val] = [[ufunc, bfunc], combo, n, "binary"]
		}
	}
}

function findAllSolutions() {
	let startTime = Date.now()
	let checkpointTime = startTime
	let solutions = {}
	let combos = generateCombinations()
	console.log(combos.length)
	let funcs = unary.filter(x => !wiped[x.id] && !corrupted[x.id])
	for (let a = 0; a < funcs.length - 2; a++) {
		for (let b = a + 1; b < funcs.length - 1; b++) {
			for(let c = b + 1; c < funcs.length; c++) {
				findSolutions([funcs[a], funcs[b], funcs[c]], solutions, combos)
			}
			if (Date.now() - 5000 > checkpointTime) {
				console.log(((Date.now() - startTime) / 1000).toFixed(3) + "s elapsed")
				console.log("a is " + a + "/" + (funcs.length - 2))
				console.log("b is " + b + "/" + (funcs.length - 1))
				console.log(" ")
				checkpointTime = Date.now()
			}
		}
	}
	let furthest = 0
	for (furthest = SOLUTION_MIN; furthest <= SOLUTION_MAX; furthest++) {
		if (!solutions[furthest]) {
			break;
		}
	}
	let out = "total time: " + ((Date.now() - startTime) / 1000).toFixed(3) + "s\n"
	//console.log(solutions["NaN"])
	out += "solutions found: " + Object.keys(solutions).length + " / " + (SOLUTION_MAX - SOLUTION_MIN + 1)
	if(Object.keys(solutions).length < (SOLUTION_MAX - SOLUTION_MIN + 1)) {
		out += " - " + "first solution not found is " + furthest
	}
	out += "\n"
	writeFile("./generated.txt", out, () => {})
	return solutions
}

function findMinSolutionList() {
	let startTime = Date.now()
	const unaryFuncs = unary.filter(x => !corrupted[x.id])
	const binaryFuncs = binary.filter(x => !corrupted[x.id])
	//console.log(corrupted)
	let used = []
	let usedObj = {}
	for(let i = 0; i < unaryFuncs.length; i++) {
		if(!wiped[unaryFuncs[i].id]) {
			used.push(unaryFuncs[i])
			usedObj[unaryFuncs[i].id] = true
		}
	}
	let usedBin = []
	for(let i = 0; i < binaryFuncs.length; i++) {
		if(!wiped[binaryFuncs[i].id]) {
			usedBin.push(binaryFuncs[i])
			usedObj[binaryFuncs[i].id] = true
		}
	}
	for(let n of usableNumbers) {
		usedObj[numberWords[n].toUpperCase()] = true
	}
	let combos = generateCombinations()
	let end = used.length
	let nums = usableNumbers
	let solutions = {}
	let solutionGoal = SOLUTION_MAX - SOLUTION_MIN + 1
	for(let a = 0; a < used.length - 1; a++) {
		for(let b = a + 1; b < used.length; b++) {
			findSolutions([used[a], used[b]], solutions, combos)
		}
	}
	for(let a = 0; a < used.length; a++) {
		for(let b = 0; b < usedBin.length; b++) {
			findSolutionsBinary(used[a], usedBin[b], solutions)
		}
	}
	let firstMissing = SOLUTION_MAX + 1
	for(let j = SOLUTION_MIN; j <= SOLUTION_MAX; j++) {
		firstMissing = solutions[j] ? firstMissing : Math.min(firstMissing, j)
	}
	let solutionNum = Object.values(solutions).length
	let additional = []
	console.log(`initial: ${solutionNum}/${solutionGoal} solutions found`)
	console.log(`first missing at ${firstMissing}`)
	while(solutionNum < solutionGoal && used.length < unary.length) {
		let bestIndex = -1
		let bestScore = -1
		let bestSolutions = {}
		let bestFound = -1
		let bestMissing = -1
		let bestType = ""
		const update = (type, id) => {
			let solutionsClone = {...solutions}
			if(type == "num") {
				for(let a = 0; a < used.length - 1; a++) {
					for(let b = a + 1; b < used.length; b++) {
						findSolutions([used[a], used[b]], solutionsClone, combos, [id])
					}
				}
			}
			if(type == "unary") {
				for(let j = 0; j < used.length; j++) {
					findSolutions([used[j], unaryFuncs[id]], solutionsClone, combos, nums)
				}
				for(let b = 0; b < usedBin.length; b++) {
					findSolutionsBinary(unaryFuncs[id], usedBin[b], solutionsClone, nums)
				}
			}
			if(type == "binary") {
				for(let j = 0; j < used.length; j++) {
					findSolutionsBinary(used[j], binaryFuncs[id], solutionsClone, nums)
				}
			}
			let found = 0
			let firstMissing = SOLUTION_MAX + 1
			for(let j = SOLUTION_MIN; j <= SOLUTION_MAX; j++) {
				found += solutionsClone[j] ? 1 : 0
				firstMissing = solutionsClone[j] ? firstMissing : Math.min(firstMissing, j)
			}
			let score = found * 1000 + firstMissing
			if(score > bestScore) {
				bestScore = score
				bestIndex = id
				bestSolutions = solutionsClone
				bestFound = found
				bestMissing = firstMissing
				bestType = type
			}
		}
		if(nums.length > 0) {
			for(let i = 0; i < unaryFuncs.length; i++) {
				if(usedObj[unaryFuncs[i].id])continue;
				update("unary", i)
			}
			for(let i = 0; i < binaryFuncs.length; i++) {
				if(usedObj[binaryFuncs[i].id])continue;
				update("binary", i)
			}
		}
		for(let n of numbers) {
			if(corrupted[numberWords[n].toUpperCase()] || usedObj[numberWords[n].toUpperCase()])continue;
			update("num", n)
		}
		let id = ""
		if(bestType == "unary") {
			id = unaryFuncs[bestIndex].id
			used.push(unaryFuncs[bestIndex])
		}
		if(bestType == "num") { 
			id = numberWords[bestIndex].toUpperCase()
			nums.push(bestIndex)
		}
		if(bestType == "binary") {
			id = binaryFuncs[bestIndex].id
			usedBin.push(binaryFuncs[bestIndex])
		}
		additional.push(id)
		usedObj[id] = true
		wiped[id] = false
		solutions = bestSolutions
		let prevFound = solutionNum
		solutionNum = bestFound
		console.log(`\nfunction added: ${id}`)
		console.log(`${solutionNum} solutions found [+${solutionNum - prevFound}]`)
		console.log(`first missing at ${bestMissing}`)
	}
	let out = "total time: " + ((Date.now() - startTime) / 1000).toFixed(3) + "s\n"
	//console.log(solutions["NaN"])
	out += "solutions found: " + Object.keys(solutions).length + " / " + (SOLUTION_MAX - SOLUTION_MIN + 1)
	if(Object.keys(solutions).length < (SOLUTION_MAX - SOLUTION_MIN + 1)) {
		out += " - " + "first solution not found is " + furthest
	}
	out += "\n"
	writeFile("./generated.txt", out, () => {})
	console.log("\nadditional functions:")
	console.log(additional.join(", "))
	return solutions
}

function stringifySolution(solution) {
	let str = numberWords[solution[2]] + "()"
	for (let i of solution[1]) {
		str = solution[0][i].syntax(str)
	}
	return str
}

function stringifySolutions(solutions) {
	for (let arr of Object.entries(solutions)) {
		console.log(arr[0], "=", stringifySolution(arr[1]))
	}
}

function missingSolutions(solutions) {
	let missing = []
	for (let i = SOLUTION_MIN; i <= SOLUTION_MAX; i++) {
		if (!solutions[i]) {
			missing.push(i)
		}
	}
	return missing
}

function exportToSheets(solutions) {
	let arr = []
	let used = {}
	for (let i = SOLUTION_MIN; i <= SOLUTION_MAX; i++) {
		let s = solutions[i]
		if (s) {
			let a = []
			for(let input of SOLUTION_INPUTS) {
				let numw = numberWords[s[2]]
				let str = ""
				let usedInner = {}
				if(s[3] == "unary") {
					str = numw + "(...)"
					for (let j of s[1]) {
						str = s[0][j].syntax(str)
						used[s[0][j].id] = true
						usedInner[s[0][j].id] = true
					}
				}
				if(s[3] == "binary") {
					let left = numw + "(...)"
					let right = numw + "(...)"
					for(let j = 0; j < s[1][0]; j++) {
						left = s[0][0].syntax(left)
						used[s[0][0].id] = true
						usedInner[s[0][0].id] = true
					}
					for(let j = 0; j < s[1][1]; j++) {
						right = s[0][0].syntax(right)
						used[s[0][0].id] = true
						usedInner[s[0][0].id] = true
					}
					str = s[0][1].syntax(left, right)
					used[s[0][1].id] = true
					usedInner[s[0][1].id] = true
					for(let j = 0; j < s[1][2]; j++) {
						str = s[0][0].syntax(str)
						used[s[0][0].id] = true
						usedInner[s[0][0].id] = true
					}
				}
				if (Object.values(usedInner).length < input.distinct - 1) {
					let diff = input.distinct - Object.values(usedInner).length - 1
					let outer = identity.filter(x => !usedInner[x.id]).slice(0, diff)
					if(outer.length != diff) {
						// not enough identity functions available
						let needed = diff - outer.length
						let inner = `${numw}(...)`
						for(let j = 0; j < unary.length && needed > 0; j++) {
							let func = unary[j]
							if(wiped[func.id] || corrupted[func.id] || usedInner[func.id])continue;
							needed--
							inner = func.syntax(inner)
							used[func.id] = true
						}
						inner = `${numw}(${inner})`
						str = str.replace(`${numw}(...)`, inner)
					}
					for(let f of outer) {
						str = f.syntax(str)
						used[f.id] = true
					}
				}
				str = str.replaceAll("...", input.txt)
				a.push(i.toString() + "=" + str + (input.append ?? ""))
				used[numw.toUpperCase()] = true
			}
			arr.push(a)
		} else {
			let a = []
			for(let j = 0; j < SOLUTION_INPUTS.length; j++) {
				a.push(i.toString() + "=<none>")
			}
			arr.push(a)
		}
	}
	let usedStr = "Used functions:\t" + Object.keys(used).sort((a, b) => a.length - b.length || a.localeCompare(b)).join("\t")
	let update = "Last updated 0 minutes ago\n" + Date.now()
	return usedStr + "\n" + update + "\n" +
		SOLUTION_INPUTS.map(x => x.title).join("\t") + "\n" +
		SOLUTION_INPUTS.map(x => x.txt).join("\t") + "\n" +
		arr.map(a => {
			return a.join("\t")
	}).join("\n")
}

let solutions = {}
if(process.argv[2] == "min") {
	solutions = findMinSolutionList()
}else{
	solutions = findAllSolutions()
}
//console.log(Object.keys(solutions).join(", "))
//console.log("missing:", missingSolutions(solutions).join(", "))
//console.log(stringifySolutions(solutions))
writeFile("./generated.txt", exportToSheets(solutions), {flag: "a"}, () => {})
/*
let f = unary.filter(o => o.id == "CN")[0]
let s = ""
for(let i = 0; i < 1000; i++) {
	s += (i + 1).toString() + " " + f.value(i) + "\n"
}
writeFile("./sequence.txt", s, () => {})
*/