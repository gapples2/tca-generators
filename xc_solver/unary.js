import { LOWER_BOUND, UPPER_BOUND } from "./const.js"
import {unlocked} from "./func_info.js"

function factorial(x) {
	let n = 1
	for (let i = 2; i <= x; i++) {
		n *= i
	}
	return n
}

function factors(x) {
	if (x < 1) return []
	if (x == 1) return [1]
	let sqrt = Math.sqrt(x)
	let arr = [1, x]
	for (let i = 2; i <= sqrt; i++) {
		if (x % i == 0) {
			arr.push(i)
			if (x / i != i) arr.push(x / i)
		}
	}
	return arr
}

function primeFactors(x) {
	if (x <= 1) return {}
	let obj = {}
	while (x % 2 == 0) {
		x /= 2
		obj[2] = (obj[2] ?? 0) + 1
	}
	for (let i = 3; x > 1; i++) {
		while (x % i == 0) {
			x /= i
			obj[i] = (obj[i] ?? 0) + 1
		}
	}
	return obj
}

function pnc(x) {
	let primes = [2, 3, 5]
	let composites = [4]
	let pcount = [0, 1, 2, 2]
	let pobj = {2: true, 3: true, 5: true}
	outer:
	for (let i = 6; i <= x; i++) {
		pcount.push(primes.length)
		let j = 0
		let sqrt = Math.sqrt(i)
		while (primes[j] <= sqrt) {
			if (i % primes[j] == 0) {
				composites.push(i)
				continue outer;
			}
			j++
		}
		primes.push(i)
		pobj[i] = true
	}
	return { primes, composites, pcount, pobj }
}
const pnc_out = pnc(UPPER_BOUND)
const primes = pnc_out.primes
const composites = pnc_out.composites
const pcount = pnc_out.pcount
const pobj = pnc_out.pobj

function happy_gen(x) {
	let happyMap = { 1: true }
	let sadMap = { 0: true, 4: true, 16: true, 20: true, 37: true, 42: true, 58: true, 89: true, 145: true }
	let happy = [1]
	let sad = []
	for (let i = 2; i < x; i++) {
		let n = i
		while (!happyMap[n] && !sadMap[n]) {
			let a = 0
			while (n > 0) {
				a += (n % 10) ** 2
				n = Math.floor(n / 10)
			}
			n = a
		}
		if (happyMap[n]) {
			happy.push(i)
			happyMap[i] = true
		} else {
			sad.push(i)
			sadMap[i] = true
		}
	}
	return { happy, sad }
}
const happy_out = happy_gen(UPPER_BOUND)
const happy = happy_out.happy
const sad = happy_out.sad

function divsum_gen(x) {
	let divsum = []
	let aliquot = []
	let divamt = []
	for(let i = 1; i < x; i++) {
		let div = factors(i)
		divsum.push(div.reduce((p, v) => p + v, 0))
		aliquot.push(divsum.at(-1) - i)
		divamt.push(div.length)
	}
	return {divsum, aliquot, divamt}
}
const divsum_out = divsum_gen(UPPER_BOUND)
const divsum = divsum_out.divsum
const aliquot = divsum_out.aliquot
const divamt = divsum_out.divamt

function generateList(func, firstTerm, max = UPPER_BOUND) {
	let out = func(firstTerm)
	let arr = [out]
	let n = firstTerm + 1
	while (out <= UPPER_BOUND) {
		out = func(n)
		if (out <= UPPER_BOUND) {
			arr.push(out)
			n++
		}
	}
	return arr
}

const gen = {
	C(x) {
		// accurate up to term 30
		let obj = {}
		for (let i = x + 2; i <= x * 2; i++) {
			let pf = primeFactors(i)
			for (let arr of Object.entries(pf)) {
				obj[arr[0]] = (obj[arr[0]] ?? 0) + arr[1]
			}
		}
		for (let i = 2; i <= x; i++) {
			let pf = primeFactors(i)
			for (let arr of Object.entries(pf)) {
				obj[arr[0]] -= arr[1]
			}
		}
		return Object.entries(obj).reduce((p, v) => p * parseInt(v[0]) ** parseInt(v[1]), 1)
	},
	L() {
		let arr = [2, 1]
		while (arr.at(-1) < UPPER_BOUND) {
			arr.push(arr.at(-1) + arr.at(-2))
		}
		return arr.slice(0, -1)
	},
	CN() {
		let arr = [1, 2, 3]
		let pstack = [[1, 3, 3]]
		const valid = (x, d) => {
			x--
			for(let i = 0; i < pstack.length - d; i++) {
				if(x % pstack[i][1] == 0) {
					return false
				}
			}
			return true
		}
		const next = () => {
			if(pstack.length == 0)return;
			let top = pstack.at(-1)
			top[0]++
			let base = pstack.at(-2)?.[2] ?? 1
			while(base * (primes[top[0]] ?? Infinity) < UPPER_BOUND && !valid(primes[top[0]], 1)) {
				top[0]++
			}
			if(base * (primes[top[0]] ?? Infinity) >= UPPER_BOUND) {
				pstack.pop()
				return next()
			}
			top[1] = primes[top[0]]
			top[2] = base * top[1]
		}
		while(pstack.length > 0) {
			let top = pstack.at(-1)
			while(top[2] * (primes[top[0] + 1] ?? Infinity) < UPPER_BOUND) {
				let p = top[0] + 1
				let base = top[2]
				while(base * (primes[p] ?? Infinity) < UPPER_BOUND && !valid(primes[p], 0)) {
					p++
				}
				if(base * (primes[p] ?? Infinity) >= UPPER_BOUND)break;
				let prod = base * primes[p]
				arr.push(prod)
				pstack.push([p, primes[p], prod])
				top = pstack.at(-1)
			}
			next()
			if(pstack.length > 0) {
				arr.push(pstack.at(-1)[2])
			}
		}
		arr.sort((a, b) => a - b)
		return arr
	},
	HP(x) {
		return primes?.[primes[primes[x] - 1] - 1] ?? Infinity
	},
	JP() {
		let arr = [1, 2]
		let stack = [[2, 2, 2]]
		let obj = {1: true, 2: true}
		const next = () => {
			if(stack.length == 0)return;
			let top = stack.at(-1)
			let base = stack.at(-2)?.[2] ?? 1
			top[0]++
			top[1] = faclist[top[0]] ?? Infinity
			top[2] = base * top[1]
			if(top[2] >= UPPER_BOUND) {
				stack.pop()
				return next()
			}
		}
		while(stack.length > 0) {
			let top = stack.at(-1)
			while(top[1] * top[2] < UPPER_BOUND) {
				let a = [top[0], top[1], top[1] * top[2]]
				stack.push(a)
				top = stack.at(-1)
				if(!obj[top[2]]) {
					arr.push(top[2])
					obj[top[2]] = true
				}
			}
			next()
			if(stack.length > 0 && !obj[stack.at(-1)[2]]) {
				arr.push(stack.at(-1)[2])
				obj[stack.at(-1)[2]] = true
			}
		}
		return arr.sort((a, b) => a - b)
	},
	PF() {
		let arr = [1, 1]
		while (arr.at(-1) < UPPER_BOUND) {
			arr.push(arr.at(-2) * arr.length)
		}
		return arr.slice(0, -1)
	},
	SP(x) {
		return primes[primes[x] - 1] ?? Infinity
	},
	ABU() {
		let arr = []
		for (let i of composites) {
			if (divsum[i - 1] > 2 * i) {
				arr.push(i)
			}
		}
		return arr
	},
	COW() {
		let arr = [1, 1, 1]
		let i = 2
		while (arr[i] < UPPER_BOUND) {
			arr.push(arr[i] + arr[i - 2])
			i++
		}
		return arr.slice(0, -1)
	},
	DEF() {
		let arr = []
		for(let i = 0; i < UPPER_BOUND - 1; i++) {
			arr.push(2 * (i + 1) - divsum[i])
		}
		return arr
	},
	FIB() {
		let arr = [0, 1]
		let i = 1
		while (arr[i] < UPPER_BOUND) {
			arr.push(arr[i] + arr[i - 1])
			i++
		}
		return arr.slice(0, -1)
	},
	GAP() {
		let arr = []
		for(let i = 0; i < primes.length - 1; i++) {
			arr.push(primes[i + 1] - primes[i])
		}
		return arr
	},
	GUY() {
		let arr = [0, 1]
		let i = 1
		while (arr[i] < UPPER_BOUND) {
			arr.push(2 * arr[i] - arr[i - Math.round(Math.sqrt(2 * i))])
			i++
		}
		return arr.slice(0, -1)
	},
	NSW() {
		let arr = [1, 7]
		let i = 1
		while (arr[i] < UPPER_BOUND) {
			arr.push(arr[i] * 6 - arr[i - 1])
			i++
		}
		return arr.slice(0, -1)
	},
	TRI() {
		let arr = [0, 0, 1]
		let i = 2
		while (arr[i] < UPPER_BOUND) {
			arr.push(arr[i] + arr[i - 1] + arr[i - 2])
			i++
		}
		return arr.slice(0, -1)
	},
	APOC() {
		let arr = []
		for(let i = 157n; i < 10000n; i++) {
			if((2n ** i).toString().includes("666")) {
				arr.push(Number(i))
			}
		}
		return arr
	},
	BLUM() {
		let arr = []
		let fprimes = primes.filter(n => n % 4 == 3)
		for (let a = 0; a < fprimes.length - 1; a++) {
			if (fprimes[a] * fprimes[a + 1] >= UPPER_BOUND) {
				break;
			}
			for (let b = a + 1; b < fprimes.length; b++) {
				let n = fprimes[a] * fprimes[b]
				if (n >= UPPER_BOUND) {
					break;
				}
				arr.push(n)
			}
		}
		arr.sort((a, b) => a - b)
		return arr
	},
	EBAN() {
		const normal = [true, false, true, false, true, false, true, false, false, false]
		const tens = [true, false, false, true, true, true, true, false, false, false]
		const good = x => Math.floor(x / 100) == 0 && tens[Math.floor(x / 10) % 10] && normal[x % 10]
		const goodFull = x => good(x % 1000) && (x < 1000 || good(Math.floor(x / 1000)))
		let arr = []
		for (let i = 1; i < UPPER_BOUND; i++) {
			if (goodFull(i)) {
				arr.push(i)
			}
		}
		return arr
	},
	EVIL() {
		let arr = []
		for (let i = 0; i < UPPER_BOUND; i++) {
			let o = 0
			let n = i
			while (n > 0) {
				o += n % 2
				n = Math.floor(n / 2)
			}
			if (o % 2 == 0) {
				arr.push(i)
			}
		}
		return arr
	},
	FBAN() {
		let arr = []
		outer:
		for (let i = 0; i < UPPER_BOUND; i++) {
			let n = i
			while (n > 0) {
				if (n % 10 == 4 || n % 10 == 5) {
					continue outer;
				}
				n = Math.floor(n / 10)
			}
			arr.push(i)
		}
		return arr
	},
	FLAG() {
		let arr = []
		for(let i = 5; i < UPPER_BOUND; i++) {
			if(!pobj[i * 2 - 1]) {
				arr.push(i)
			}
		}
		return arr
	},
	GOOD() {
		let arr = []
		for(let i = 1; i < primes.length; i++) {
			if(primes[i] ** 2 > primes[i - 1] * primes[i + 1]) {
				arr.push(primes[i])
			}
		}
		return arr
	},
	IBAN() {
		const normal = [true, true, true, true, true, false, false, true, false, false]
		const tens = [true, true, true, false, true, false, false, true, false, false]
		const good = x => normal[Math.floor(x / 100)] && tens[Math.floor(x / 10) % 10] && (x % 100 >= 10 && x % 100 <= 19 ? tens[x % 10] : normal[x % 10])
		const goodFull = x => good(x % 1000) && good(Math.floor(x / 1000))
		let arr = []
		for (let i = 0; i <= 777777; i++) {
			if (goodFull(i)) {
				arr.push(i)
			}
		}
		return arr
	},
	PART() {
		let arr = [1]
		while(arr.at(-1) < UPPER_BOUND) {
			let sum = 0
			let n = arr.length
			for(let i = 0; i < n; i++) {
				sum += divsum[n - i - 1] * arr[i]
			}
			arr.push(sum / n)
		}
		return arr.slice(0, -1)
	},
	PELL() {
		let arr = [0, 1]
		let i = 1
		while (arr[i] < UPPER_BOUND) {
			arr.push(2 * arr[i] + arr[i - 1])
			i++
		}
		return arr.slice(0, -1)
	},
	REVE() {
		let arr = [0]
		let i = 1
		while(arr.at(-1) < UPPER_BOUND) {
			let min = Infinity
			for(let j = 0; j < i; j++) {
				let n = 2 * arr[j] + 2 ** (i - j) - 1
				min = min > n ? n : min
			}
			arr.push(min)
			i++
		}
		return arr.slice(0, -1)
	},
	SAFE() {
		let arr = []
		for(let i = 0; i < primes.length; i++) {
			if(pobj[(primes[i] - 1) / 2]) {
				arr.push(primes[i])
			}
		}
		return arr
	},
	SBAN() {
		let arr = []
		outer:
		for (let i = 0; i < 1000; i++) {
			let n = i
			while (n > 0) {
				if (n % 10 == 6 || n % 10 == 7) {
					continue outer;
				}
				n = Math.floor(n / 10)
			}
			arr.push(i)
		}
		return arr
	},
	SEMI() {
		let arr = []
		for(let i = 0; i < primes.length; i++) {
			if(primes[i] ** 2 >= UPPER_BOUND)break;
			for(let j = i; j < primes.length; j++) {
				arr.push(primes[i] * primes[j])
			}
		}
		return arr.sort((a, b) => a - b)
	},
	SEXY() {
		let arr = []
		for(let i = 0; i < primes.length; i++) {
			let n = primes[i]
			if(pobj[n - 6] || pobj[n + 6]) {
				arr.push(n)
			}
		}
		return arr
	},
	ULAM() {
		let arr = [1, 2]
		let obj = {}
		while(arr.length < 1000) {
			for(let i = arr.length - 2; i >= 0; i--) {
				let index = arr[i] + arr.at(-1)
				obj[index] = (obj[index] ?? 0) + 1
			}
			let next = arr.at(-1) + 1
			while(obj[next] != 1) {
				next++
			}
			arr.push(next)
		}
		return arr
	},
	WALK() {
		let arr = [1, 5, 19]
		let i = 2
		while (arr[i] < UPPER_BOUND) {
			arr.push(arr[i] * 5 - arr[i - 1] * 6 + arr[i - 2])
			i++
		}
		return arr.slice(0, -1)
	},
	WBAN() {
		let arr = []
		outer:
		for (let i = 0; i < UPPER_BOUND; i++) {
			let n = i
			while (n > 0) {
				if (n % 10 == 2) {
					continue outer;
				}
				n = Math.floor(n / 10)
			}
			arr.push(i)
		}
		return arr
	},
	EMIRP() {
		let arr = []
		for(let p of primes) {
			let rev = 0
			let n = p
			while(n > 0) {
				rev = rev * 10 + n % 10
				n = Math.floor(n / 10)
			}
			if(!pobj[rev])continue;
			if(rev == p)continue;
			arr.push(p)
		}
		return arr
	},
	EULER() {
		let arr = []
		for(let i = 1; i < Math.min(UPPER_BOUND, 100000); i++) {
			if(pobj[i]) {
				arr.push(i - 1)
				continue;
			}
			let obj = {}
			let tot = 1
			let n = i
			let p = 0
			while(n > 1) {
				let prime = primes[p]
				while(n % prime == 0) {
					if(!obj[prime]) {
						obj[prime] = true
						tot *= prime - 1
					}else{
						tot *= prime
					}
					n /= prime
				}
				p++
			}
			arr.push(tot)
		}
		return arr
	},
}

const faclist = generateList(factorial, 0)
const list = {
	C: generateList(gen.C, 0),
	L: gen.L(),
	AS: aliquot,
	CN: gen.CN(),
	EN: [2, 3, 7, 31, 211, 2311, 30031, 510511, 9699691],
	HG: [1605, 1615, 1618, 1628, 1631, 1644, 1651, 1661, 1664, 1674, 1677, 1690, 1697, 1707, 1710, 1723, 1736, 1740, 1743, 1753, 1756, 1769, 1776, 1782, 1786, 1789, 1799, 1802, 1815, 1822, 1832, 1835, 1845, 1848, 1861, 1868, 1878, 1881, 1891, 1894, 1907, 1914, 1924, 1927, 1937, 1940, 1953, 1957, 1960, 1970, 1973, 1986, 1993, 1999, 2003, 2006, 2016, 2019, 2032, 2039, 2049, 2052, 2062, 2065, 2078, 2085, 2095, 2098, 2108, 2111, 2124, 2131, 2141, 2144, 2154, 2157, 2170, 2174, 2177, 2187, 2190, 2203, 2210, 2220, 2223, 2233, 2236, 2249, 2256, 2266, 2269, 2279, 2282, 2295],
	HP: generateList(gen.HP, 0),
	JP: gen.JP(),
	PF: gen.PF(),
	PI: faclist,
	PN: [6, 28, 496, 8128],
	SC: [1, 1, 3, 11, 45, 197, 903, 4279, 20793, 103049, 518859],
	SP: generateList(gen.SP, 0),
	ABU: gen.ABU(),
	AMI: [220, 284, 1184, 1210, 2620, 2924, 5020, 5564, 6232, 6368, 10744, 10856, 12285, 14595, 17296, 18416, 63020, 66928, 66992, 67095, 69615, 71145, 76084, 79750, 87633, 88730, 100485, 122265, 122368, 123152, 124155, 139815, 141664, 142310],
	BAL: [0, 1, 2, 5, 12, 30, 76, 196, 512, 1353, 3610, 9713, 26324, 71799, 196938, 542895],
	BAX: [1, 1, 2, 6, 22, 92, 422, 2074, 10754, 58202, 326240, 1882960, 11140560, 67329992, 414499438],
	CMP: composites,
	COW: gen.COW(),
	DEF: gen.DEF(),
	DUC: [1, 2, 23, 377, 7229, 151491],
	EGF: [1, 1, 3, 14, 90, 736, 7308, 85364],
	EMG: [2, 3, 7, 43, 139, 50207, 340999, 2365347734339],
	EML: [2, 3, 7, 43, 13, 53, 5, 6221671, 38709183810571, 139, 2801, 11, 17, 5471, 52662739, 23003, 30693651606209, 37, 1741, 1313797957, 887, 71, 7127, 109, 23, 97, 159227, 643679794963466223081509857, 103, 1079990819, 9539, 3143065813, 29, 3847, 89, 19, 577, 223, 139703, 457, 9649, 61, 4357],
	FIB: gen.FIB(),
	GAP: gen.GAP(),
	GUY: gen.GUY(),
	HPN: [6, 21, 28, 301, 325, 496, 697, 1333, 1909, 2041, 2133, 3901, 8128, 10693, 16513, 19521, 24601, 26977, 51301, 96361, 130153, 159841, 163201, 176661, 214273, 250321, 275833, 296341, 306181, 389593, 486877, 495529, 542413, 808861],
	LSS: [1, 11, 21, 1211, 111221, 312211],
	NSW: gen.NSW(),
	OHM: [1, 2, 4, 8, 16, 36, 80, 194, 506, 1400, 4039, 12044, 36406, 111324, 342447, 1064835],
	PCF: pcount,
	PRI: [1, 2, 6, 30, 210, 2310, 30030, 510510],
	SBF: [1, 0, 1, 2, 9, 44, 265, 1854, 14833, 133496],
	SPN: [2, 4, 16, 64, 4096, 65536, 262144, 1073741824],
	TAU: divamt,
	TRI: gen.TRI(),
	SAD: sad,
	SUN: [1, 3, 8, 27, 100, 393, 1624, 7017, 31558, 147177, 709592, 3527769],
	SWF: [1, 1, 2, 6, 6, 30, 20, 140, 70, 630, 252, 2772, 924, 12012, 3432, 51480, 12870, 218790, 48620, 923780, 184756, 3879876, 705432, 16224936],
	APOC: gen.APOC(),
	BELL: [1, 1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975, 678570],
	BLUM: gen.BLUM(),
	CHOC: [1, 2, 4, 6, 24, 56, 120, 720, 1712, 5040, 9408, 40320, 92800, 362880, 3628800],
	CMPT: [1, 4, 24, 192, 1728, 17280, 207360, 2903040, 43545600],
	EBAN: gen.EBAN(),
	EVIL: gen.EVIL(),
	FBAN: gen.FBAN(),
	FISH: [6, 36, 72, 150, 540, 540, 540, 2700, 4860, 3240, 1806, 11340, 28350, 34020, 17010, 5796, 43344, 136080, 226800, 204120, 81648, 18150, 156492, 585144, 1224720, 1530900, 1102248, 367416, 55980, 544500],
	FLAG: gen.FLAG(),
	GOOD: gen.GOOD(),
	IBAN: gen.IBAN(),
	KING: [1, 1, 0, 0, 2, 14, 90, 646, 5242, 47622, 479306],
	MASS: [1, 4, 7, 9, 11, 12, 14, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 40, 39, 40, 45, 48, 51, 52, 55, 56, 59, 58, 63, 64, 69, 74, 75, 80, 79, 84, 85, 88, 89, 90, 93, 98, 98, 102, 103, 106, 107, 114, 115, 120, 121, 130, 127, 132, 133, 138, 139, 140, 141, 142, 145, 152, 153, 158, 159, 164, 165, 168, 169, 174, 175, 180, 181, 184, 187, 192, 193, 195, 197, 202, 205, 208, 209, 209, 210, 222, 223, 226, 227, 232, 231, 238, 237, 244, 243, 247, 247, 251, 252, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 269, 272, 277, 286, 289, 289, 293, 294, 294],
	NBAN: [0, 2, 3, 4, 5, 6, 8, 12, 30, 32, 33, 34, 35, 36, 38, 40, 42, 43, 44, 45, 46, 48, 50, 52, 53, 54, 55, 56, 58, 60, 62, 63, 64, 65, 66, 68, 80, 82, 83, 84, 85, 86, 88],
	PART: gen.PART(),
	PELL: gen.PELL(),
	RATS: [1, 2, 4, 8, 16, 77, 145, 668, 1345, 6677, 13444, 55778, 133345, 666677],
	REVE: gen.REVE(),
	ROOK: [1, 2, 6, 20, 76, 312, 1384, 6512, 32400, 168992, 921184],
	ROPE: [2, 6, 15, 34, 78, 174, 386, 844, 1837, 3960, 8513, 18238],
	SAFE: gen.SAFE(),
	SBAN: gen.SBAN(),
	SEMI: gen.SEMI(),
	SEXY: gen.SEXY(),
	SINK: [1, 2, 12, 185, 8990],
	TBAN: [0, 1, 4, 5, 6, 7, 9, 11, 100, 101, 104, 105, 106, 107, 109, 111, 400, 401, 404, 405, 406, 407, 409, 411, 500, 501, 504, 505, 506, 507, 509, 511, 600, 601, 604, 605, 606, 607, 609, 611, 700, 701, 704, 705, 706, 707, 709, 711, 900, 901, 904, 905, 906, 907, 909, 911],
	TREE: [0, 1, 1, 2, 4, 9, 20, 48, 115, 286, 719, 1842, 4766, 12486, 32973, 87811, 235381, 634847],
	UBAN: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 42, 43, 45, 46, 47, 48, 49, 50, 51, 52, 53, 55, 56, 57, 58, 59, 60, 61, 62, 63, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83, 85, 86, 87, 88, 89, 90, 91, 92, 93, 95, 96, 97, 98, 99],
	ULAM: gen.ULAM(),
	WALK: gen.WALK(),
	WBAN: gen.WBAN(),
	CACTI: [0, 1, 0, 1, 1, 3, 5, 13, 27, 67, 157, 390, 963, 2437, 6186, 15908, 41127, 107148, 280569, 738675],
	EMIRP: gen.EMIRP(),
	EULER: gen.EULER(),
}

const unary = ([
	{ // C
		id: "C",
		syntax(x) { return `C(${x})` },
		value(x) { return list.C[x] },
		min: 0,
		max: list.C.length,
		offset: 0,
		wiped: true
	},
	{ // L
		id: "L",
		syntax(x) { return `L(${x})` },
		value(x) { return list.L[x] },
		min: 0,
		max: list.L.length,
		offset: 0,
		wiped: true
	},
	{ // AS
		id: "AS",
		syntax(x) { return `s(${x})` },
		value(x) { return list.AS[x] },
		min: 0,
		max: list.AS.length,
		offset: 1,
		wiped: false
	},
	{ // CF
		id: "CF",
		syntax(x) { return `${x}^[!]` },
		value(x) { return x * (x - 1) * (x - 2) * (2 * x - 1) * (2 * x - 3) * (5 * x + 1) / 360 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: true
	},
	{ // CN
		id: "CN",
		syntax(x) { return `☸️(${x})` },
		value(x) { return list.CN[x] },
		min: 0,
		max: list.CN.length,
		offset: 1,
		wiped: true
	},
	{ // DC
		id: "DC",
		syntax(x) { return `D‾(${x})` },
		value(x) {
			let a = [0, 9, 8, 7, 6, 5, 4, 3, 2, 1]
			let n = 0
			let m = 1
			while (x > 0) {
				n = n + a[x % 10] * m
				x = Math.floor(x / 10)
				m *= 10
			}
			return n
		},
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: true
	},
	{ // DP
		id: "DP",
		syntax(x) { return `D*(${x})` },
		value(x) {
			let n = x == 0 ? 0 : 1
			while (x > 0) {
				n *= x % 10
				x = Math.floor(x / 10)
			}
			return n
		},
		min: 0,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // EN
		id: "EN",
		syntax(x) { return `E\\_(${x})` },
		value(x) { return list.EN[x] },
		min: 0,
		max: list.EN.length,
		offset: 0,
		wiped: true
	},
	{ // HG
		id: "HG",
		syntax(x) { return `🌡️(${x})` },
		value(x) { return list.HG[x] },
		min: 0,
		max: list.HG.length,
		offset: 1,
		wiped: false
	},
	{ // HP
		id: "HP",
		syntax(x) { return `hp(${x})` },
		value(x) { return list.HP[x] },
		min: 0,
		max: list.HP.length,
		offset: 1,
		wiped: false
	},
	{ // JP
		id: "JP",
		syntax(x) { return `JP(${x})` },
		value(x) { return list.JP[x] },
		min: 0,
		max: list.JP.length,
		offset: 1,
		wiped: true
	},
	{ // PF
		id: "PF",
		syntax(x) { return `(${x}!!)` },
		value(x) { return list.PF[x] },
		min: 0,
		max: list.PF.length,
		offset: 0,
		wiped: true
	},
	{ // PI
		id: "PI",
		syntax(x) { return `(${x}!)` },
		value(x) { return list.PI[x] },
		min: 0,
		max: list.PI.length,
		offset: 0,
		wiped: true
	},
	{ // PN
		id: "PN",
		syntax(x) { return `✓(${x})` },
		value(x) { return list.PN[x] },
		min: 0,
		max: list.PN.length,
		offset: 1,
		wiped: false
	},
	{ // SC
		id: "SC",
		syntax(x) { return `SC(${x})` },
		value(x) { return list.SC[x] },
		min: 0,
		max: list.SC.length,
		offset: 0,
		wiped: false
	},
	{ // SP
		id: "SP",
		syntax(x) { return `sp(${x})` },
		value(x) { return list.SP[x] },
		min: 0,
		max: list.SP.length,
		offset: 1,
		wiped: false
	},
	{ // TN
		id: "TN",
		syntax(x) { return `T(${x})` },
		value(x) { return x * (x + 1) / 2 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // UR
		id: "UR",
		syntax(x) { return `1️⃣(${x})` },
		value(x) {
			let n = 0
			for(let i = 0; i <= x; i++) {
				n = n * 10 + 1
			}
			return n
		},
		min: 0,
		max: Math.log10(UPPER_BOUND),
		offset: 1,
		wiped: false
	},
	{ // ABU
		id: "ABU",
		syntax(x) { return `abu(${x})` },
		value(x) { return list.ABU[x] },
		min: 0,
		max: list.ABU.length,
		offset: 1,
		wiped: true
	},
	{ // AMI
		id: "AMI",
		syntax(x) { return `ami(${x})` },
		value(x) { return list.AMI[x] },
		min: 0,
		max: list.AMI.length,
		offset: 1,
		wiped: false
	},
	{ // BAL
		id: "BAL",
		syntax(x) { return `bal(${x})` },
		value(x) { return list.BAL[x] },
		min: 0,
		max: list.BAL.length,
		offset: 0,
		wiped: false
	},
	{ // BAX
		id: "BAX",
		syntax(x) { return `Bax(${x})` },
		value(x) { return list.BAX[x] },
		min: 0,
		max: list.BAX.length,
		offset: 0,
		wiped: false
	},
	{ // CHN
		id: "CHN",
		syntax(x) { return `hex(${x})` },
		value(x) { return 3 * x * (x + 1) + 1 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // CMP
		id: "CMP",
		syntax(x) { return `cmp(${x})` },
		value(x) { return list.CMP[x] },
		min: 0,
		max: list.CMP.length,
		offset: 1,
		wiped: false
	},
	{ // COW
		id: "COW",
		syntax(x) { return `🐮(${x})` },
		value(x) { return list.COW[x] },
		min: 0,
		max: list.COW.length,
		offset: 0,
		wiped: false
	},
	{ // DBL
		id: "DBL",
		syntax(x) { return `2️⃣(${x})` },
		value(x) {
			let m = 10 ** (Math.floor(Math.log10(x)) + 1)
			return x * m + x
		},
		min: 1,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // DEF
		id: "DEF",
		syntax(x) { return `def(${x})` },
		value(x) { return list.DEF[x] },
		min: 0,
		max: list.DEF.length,
		offset: 1,
		wiped: false
	},
	{ // DLF
		id: "DLF",
		syntax(x) { return `D¡(${x})` },
		value(x) {
			let n = 1
			while (x > 0) {
				n *= x
				x = Math.floor(x / 10)
			}
			return n
		},
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: true
	},
	{ // DSM
		id: "DSM",
		syntax(x) { return `D+(${x})` },
		value(x) {
			let n = 0
			while (x > 0) {
				n += x % 10
				x = Math.floor(x / 10)
			}
			return n
		},
		min: 0,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // DUC
		id: "DUC",
		syntax(x) { return `🦆(${x})` },
		value(x) { return list.DUC[x] },
		min: 0,
		max: list.DUC.length,
		offset: 0,
		wiped: false
	},
	{ // EGF
		id: "EGF",
		syntax(x) { return `egf(${x})` },
		value(x) { return list.EGF[x] },
		min: 0,
		max: list.EGF.length,
		offset: 1,
		wiped: false
	},
	{ // EGG
		id: "EGG",
		syntax(x) { return `🥚(${x})` },
		value(x) { return 420 * x - 119 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},

	{ // EMG
		id: "EMG",
		syntax(x) { return `EM>(${x})` },
		value(x) { return list.EMG[x] },
		min: 0,
		max: list.EMG.length,
		offset: 1,
		wiped: true
	},
	{ // EML
		id: "EML",
		syntax(x) { return `EM<(${x})` },
		value(x) { return list.EML[x] },
		min: 0,
		max: list.EML.length,
		offset: 1,
		wiped: true
	},
	{ // FIB
		id: "FIB",
		syntax(x) { return `fib(${x})` },
		value(x) { return list.FIB[x] },
		min: 0,
		max: list.FIB.length,
		offset: 0,
		wiped: false
	},
	{ // GAP
		id: "GAP",
		syntax(x) { return `gap(${x})` },
		value(x) { return list.GAP[x] },
		min: 0,
		max: list.GAP.length,
		offset: 1,
		wiped: false
	},
	{ // GUY
		id: "GUY",
		syntax(x) { return `🧑‍🦱(${x})` },
		value(x) { return list.GUY[x] },
		min: 0,
		max: list.GUY.length,
		offset: 0,
		wiped: false
	},
	{ // HEX
		id: "HEX",
		syntax(x) { return `HX(${x})` },
		value(x) { return x * (2 * x - 1) },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // HPN
		id: "HPN",
		syntax(x) { return `h✓(${x})` },
		value(x) { return list.HPN[x] },
		min: 0,
		max: list.HPN.length,
		offset: 1,
		wiped: false
	},
	{ // IMP
		id: "IMP",
		syntax(x) { return `😠(${x})` },
		value(x) { return x == 0 ? 0 : 2 ** (x - 1) },
		min: 0,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // LSS
		id: "LSS",
		syntax(x) { return `ls(${x})` },
		value(x) { return list.LSS[x] },
		min: 0,
		max: list.LSS.length,
		offset: 1,
		wiped: false
	},
	{ // NOT
		id: "NOT",
		syntax(x) { return `${x}~` },
		value(x) { return 2 ** (Math.floor(Math.log2(x)) + 1) - x - 1 },
		min: 1,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // NSW
		id: "NSW",
		syntax(x) { return `nsw(${x})` },
		value(x) { return list.NSW[x] },
		min: 0,
		max: list.NSW.length,
		offset: 0,
		wiped: false
	},

	{ // ODD
		id: "ODD",
		syntax(x) { return `odd(${x})` },
		value(x) { return 2 * x + 1 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: true
	},
	{ // OHM
		id: "OHM",
		syntax(x) { return `Ω⚡(${x})` },
		value(x) { return list.OHM[x] },
		min: 0,
		max: list.OHM.length,
		offset: 0,
		wiped: true
	},
	{ // PCF
		id: "PCF",
		syntax(x) { return `primeπ(${x})` },
		value(x) { return list.PCF[x] },
		min: 0,
		max: list.PCF.length,
		offset: 1,
		wiped: false
	},

	{ // PRE
		id: "PRE",
		syntax(x) { return `${x}--` },
		value(x) { return x - 1 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // PRI
		id: "PRI",
		syntax(x) { return `${x}#` },
		value(x) { return list.PRI[x] },
		min: 0,
		max: list.PRI.length,
		offset: 0,
		wiped: false
	},
	{ // SAD
		id: "SAD",
		syntax(x) { return `😔(${x})` },
		value(x) { return list.SAD[x] },
		min: 0,
		max: list.SAD.length,
		offset: 1,
		wiped: true
	},
	{ // SBF
		id: "SBF",
		syntax(x) { return `(!${x})` },
		value(x) { return list.SBF[x] },
		min: 0,
		max: list.SBF.length,
		offset: 0,
		wiped: false
	},
	{ // SPN
		id: "SPN",
		syntax(x) { return `s✓(${x})` },
		value(x) { return list.SPN[x] },
		min: 0,
		max: list.SPN.length,
		offset: 1,
		wiped: false
	},
	{ // SQR
		id: "SQR",
		syntax(x) { return `${x}²` },
		value(x) { return x ** 2 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: true
	},

	{ // SUC
		id: "SUC",
		syntax(x) { return `${x}++` },
		value(x) { return x + 1 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // SUN
		id: "SUN",
		syntax(x) { return `☀️(${x})` },
		value(x) { return list.SUN[x] },
		min: 0,
		max: list.SUN.length,
		offset: 0,
		wiped: false
	},
	{ // SWF
		id: "SWF",
		syntax(x) { return `${x}≀` },
		value(x) { return list.SWF[x] },
		min: 0,
		max: list.SWF.length,
		offset: 0,
		wiped: true
	},
	{ // TAU
		id: "TAU",
		syntax(x) { return `τ(${x})` },
		value(x) { return list.TAU[x] },
		min: 0,
		max: list.TAU.length,
		offset: 1,
		wiped: false
	},
	{ // TPL
		id: "TPL",
		syntax(x) { return `3️⃣(${x})` },
		value(x) {
			let m = 10 ** (Math.floor(Math.log10(x)) + 1)
			return x * m + x + m ** 2 * x
		},
		min: 1,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},

	{ // TRI
		id: "TRI",
		syntax(x) { return `Tr(${x})` },
		value(x) { return list.TRI[x] },
		min: 0,
		max: list.TRI.length,
		offset: 0,
		wiped: false
	},
	{ // APOC
		id: "APOC",
		syntax(x) { return `😈(${x})` },
		value(x) { return list.APOC[x] },
		min: 0,
		max: list.APOC.length,
		offset: 1,
		wiped: false
	},
	{ // BELL
		id: "BELL",
		syntax(x) { return `🔔(${x})` },
		value(x) { return list.BELL[x] },
		min: 0,
		max: list.BELL.length,
		offset: 0,
		wiped: false
	},
	{ // BLUM
		id: "BLUM",
		syntax(x) { return `Blum(${x})` },
		value(x) { return list.BLUM[x] },
		min: 0,
		max: list.BLUM.length,
		offset: 1,
		wiped: false
	},

	{ // BOAT
		id: "BOAT",
		syntax(x) { return `⛴️(${x})` },
		value(x) { return x < 2 ? x : x * 2 ** (x - 2) },
		min: 0,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // CAKE
		id: "CAKE",
		syntax(x) { return `🍰(${x})` },
		value(x) { return (x + 1) * (x ** 2 - x + 6) / 6 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // CHOC
		id: "CHOC",
		syntax(x) { return `🍫(${x})` },
		value(x) { return list.CHOC[x] },
		min: 0,
		max: list.CHOC.length,
		offset: 1,
		wiped: true
	},
	{ // CMPT
		id: "CMPT",
		syntax(x) { return `(#${x})` },
		value(x) { return list.CMPT[x] },
		min: 0,
		max: list.CMPT.length,
		offset: 0,
		wiped: true
	},
	{ // CSQR
		id: "CSQR",
		syntax(x) { return `cs(${x})` },
		value(x) { return 2 * x * (x + 1) + 1 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // CTRI
		id: "CTRI",
		syntax(x) { return `ct(${x})` },
		value(x) { return 3 * x * (x - 1) / 2 + 1 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // CUBE
		id: "CUBE",
		syntax(x) { return `${x}³` },
		value(x) { return x ** 3 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // EBAN
		id: "EBAN",
		syntax(x) { return `🇪(${x})` },
		value(x) { return list.EBAN[x] },
		min: 0,
		max: list.EBAN.length,
		offset: 1,
		wiped: false
	},
	{ // EVEN
		id: "EVEN",
		syntax(x) { return `even(${x})` },
		value(x) { return 2 * x },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // EVIL
		id: "EVIL",
		syntax(x) { return `👿(${x})` },
		value(x) { return list.EVIL[x] },
		min: 0,
		max: list.EVIL.length,
		offset: 1,
		wiped: false
	},
	{ // FBAN
		id: "FBAN",
		syntax(x) { return `🇫(${x})` },
		value(x) { return list.FBAN[x] },
		min: 0,
		max: list.FBAN.length,
		offset: 1,
		wiped: false
	},
	{ // FISH
		id: "FISH",
		syntax(x) { return `🐟(${x})` },
		value(x) { return list.FISH[x] },
		min: 0,
		max: list.FISH.length,
		offset: 3,
		wiped: false
	},
	{ // FLAG
		id: "FLAG",
		syntax(x) { return `🏳️(${x})` },
		value(x) { return list.FLAG[x] },
		min: 0,
		max: list.FLAG.length,
		offset: 1,
		wiped: false
	},
	{ // GOOD
		id: "GOOD",
		syntax(x) { return `👍(${x})` },
		value(x) { return list.GOOD[x] },
		min: 0,
		max: list.GOOD.length,
		offset: 1,
		wiped: false
	},
	{ // HEPT
		id: "HEPT",
		syntax(x) { return `hept(${x})` },
		value(x) { return x * (x + 1) * (5 * x - 2) / 6 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // IBAN
		id: "IBAN",
		syntax(x) { return `🇮(${x})` },
		value(x) { return list.IBAN[x] },
		min: 0,
		max: list.IBAN.length,
		offset: 1,
		wiped: false
	},
	{ // KING
		id: "KING",
		syntax(x) { return `🫅(${x})` },
		value(x) { return list.KING[x] },
		min: 0,
		max: list.KING.length,
		offset: 0,
		wiped: false
	},
	{ // MASS
		id: "MASS",
		syntax(x) { return `🏋️‍♂️(${x})` },
		value(x) { return list.MASS[x] },
		min: 0,
		max: list.MASS.length,
		offset: 1,
		wiped: false
	},
	{ // MIKM
		id: "MIKM",
		syntax(x) { return `📏(${x})` },
		value(x) { return Math.round(x * 1.609344) },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // NBAN
		id: "NBAN",
		syntax(x) { return `🇳(${x})` },
		value(x) { return list.NBAN[x] },
		min: 0,
		max: list.NBAN.length,
		offset: 1,
		wiped: false
	},
	{ // OBLN
		id: "OBLN",
		syntax(x) { return `O(${x})` },
		value(x) { return x * (x + 1) },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // OCTO
		id: "OCTO",
		syntax(x) { return `🛑(${x})` },
		value(x) { return x * (3 * x - 2) },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // PART
		id: "PART",
		syntax(x) { return `P(${x})` },
		value(x) { return list.PART[x] },
		min: 0,
		max: list.PART.length,
		offset: 0,
		wiped: false
	},
	{ // PELL
		id: "PELL",
		syntax(x) { return `🫑(${x})` },
		value(x) { return list.PELL[x] },
		min: 0,
		max: list.PELL.length,
		offset: 0,
		wiped: false
	},
	{ // PENT
		id: "PENT",
		syntax(x) { return `5️⃣(${x})` },
		value(x) { return x * (x - 1) * (x - 2) * (x - 3) / 24 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // QUAD
		id: "QUAD",
		syntax(x) { return `quad(${x})` },
		value(x) {
			let m = 10 ** (Math.floor(Math.log10(x)) + 1)
			return x * m + x + m ** 2 * x + m ** 3 * x
		},
		min: 1,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // RATS
		id: "RATS",
		syntax(x) { return `🐀(${x})` },
		value(x) { return list.RATS[x] },
		min: 0,
		max: list.RATS.length,
		offset: 1,
		wiped: false
	},
	{ // REVE
		id: "REVE",
		syntax(x) { return `🗼(${x})` },
		value(x) { return list.REVE[x] },
		min: 0,
		max: list.REVE.length,
		offset: 0,
		wiped: false
	},
	{ // ROOK
		id: "ROOK",
		syntax(x) { return `♟️(${x})` },
		value(x) { return list.ROOK[x] },
		min: 0,
		max: list.ROOK.length,
		offset: 0,
		wiped: false
	},
	{ // ROPE
		id: "ROPE",
		syntax(x) { return `🪢(${x})` },
		value(x) { return list.ROPE[x] },
		min: 0,
		max: list.ROPE.length,
		offset: 1,
		wiped: false
	},
	{ // SEMI
		id: "SEMI",
		syntax(x) { return `🚛(${x})` },
		value(x) { return list.SEMI[x] },
		min: 0,
		max: list.SEMI.length,
		offset: 1,
		wiped: false
	},
	{ // SAFE
		id: "SAFE",
		syntax(x) { return `🦺(${x})` },
		value(x) { return list.SAFE[x] },
		min: 0,
		max: list.SAFE.length,
		offset: 1,
		wiped: false
	},
	{ // SBAN
		id: "SBAN",
		syntax(x) { return `🇸(${x})` },
		value(x) { return list.SBAN[x] },
		min: 0,
		max: list.SBAN.length,
		offset: 1,
		wiped: false
	},
	{ // SEMI
		id: "SEMI",
		syntax(x) { return `🚛(${x})` },
		value(x) { return list.SEMI[x] },
		min: 0,
		max: list.SEMI.length,
		offset: 1,
		wiped: false
	},
	/*{ // SEXY
		id: "SEXY",
		syntax(x) { return `🍸(${x})` },
		value(x) { return list.SEXY[x] },
		min: 0,
		max: list.SEXY.length,
		offset: 1,
		wiped: true
	},*/
	{ // SINK
		id: "SINK",
		syntax(x) { return `🚪(${x})` },
		value(x) { return list.SINK[x] },
		min: 0,
		max: list.SINK.length,
		offset: 1,
		wiped: false
	},
	/*{ // SQRT
		id: "SQRT",
		syntax(x) { return `√(${x})` },
		value(x) { return Math.sqrt(x) },
		min: 0,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},*/
	{ // TBAN
		id: "TBAN",
		syntax(x) { return `🇹(${x})` },
		value(x) { return list.TBAN[x] },
		min: 0,
		max: list.TBAN.length,
		offset: 1,
		wiped: false
	},
	{ // TETR
		id: "TETR",
		syntax(x) { return `4️⃣(${x})` },
		value(x) { return x * (x + 1) * (x + 2) / 6 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 0,
		wiped: false
	},
	{ // TREE
		id: "TREE",
		syntax(x) { return `🌳(${x})` },
		value(x) { return list.TREE[x] },
		min: 0,
		max: list.TREE.length,
		offset: 0,
		wiped: false
	},
	{ // UBAN
		id: "UBAN",
		syntax(x) { return `🇺(${x})` },
		value(x) { return list.UBAN[x] },
		min: 0,
		max: list.UBAN.length,
		offset: 1,
		wiped: false
	},
	{ // ULAM
		id: "ULAM",
		syntax(x) { return `Ulam(${x})` },
		value(x) { return list.ULAM[x] },
		min: 0,
		max: list.ULAM.length,
		offset: 1,
		wiped: false
	},
	{ // WALK
		id: "WALK",
		syntax(x) { return `🚸(${x})` },
		value(x) { return list.WALK[x] },
		min: 0,
		max: list.WALK.length,
		offset: 0,
		wiped: false
	},
	{ // WBAN
		id: "WBAN",
		syntax(x) { return `🇼(${x})` },
		value(x) { return list.WBAN[x] },
		min: 0,
		max: list.WBAN.length,
		offset: 1,
		wiped: false
	},
	{ // YBAN
		id: "YBAN",
		syntax(x) { return `🇾(${x})` },
		value(x) { return Math.floor(x / 20) * 100 + x % 20 },
		min: 0,
		max: UPPER_BOUND / 5,
		offset: 1,
		wiped: false
	},
	{ // CACTI
		id: "CACTI",
		syntax(x) { return `🌵(${x})` },
		value(x) { return list.CACTI[x] },
		min: 0,
		max: list.CACTI.length,
		offset: 0,
		wiped: false
	},
	{ // DBLTN
		id: "DBLTN",
		syntax(x) { return `T²(${x})` },
		value(x) { return x * (x + 1) * (x ** 2 + x + 2) / 8 },
		min: LOWER_BOUND,
		max: UPPER_BOUND,
		offset: 1,
		wiped: false
	},
	{ // EMIRP
		id: "EMIRP",
		syntax(x) { return `prime🪞(${x})` },
		value(x) { return list.EMIRP[x] },
		min: 0,
		max: list.EMIRP.length,
		offset: 1,
		wiped: false
	},
	{ // EULER
		id: "EULER",
		syntax(x) { return `Φ(${x})` },
		value(x) { return list.EULER[x] },
		min: 0,
		max: list.EULER.length,
		offset: 1,
		wiped: false
	},
	/*{ // YBAN
		id: "PRIME",
		syntax(x) { return `prime(${x})` },
		value(x) { return primes[x] },
		min: 0,
		max: primes.length,
		offset: 1,
		wiped: false
	},*/
]).filter(x => unlocked[x.id])//.filter(x => !wiped[x.id])//.filter(x => IGNORE_WIPED || !x.wiped)

/*
for(let f of unary) {
	let arr = []
	for(let i = 0; i < Math.min(f.max, 20); i++) {
	arr.push(f.value(i))
	}
	console.log(f.syntax("x") + ":", "offset = " + f.offset, "/", arr.join(", "))
}
*/
export { unary }
