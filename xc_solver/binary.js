import { LOWER_BOUND, UPPER_BOUND } from "./const.js"

const binary = [
    {
        id: "OR",
        syntax(x, y) {return `(${x})|(${y})`},
        value(x, y) {return x | y},
        min: LOWER_BOUND,
        max: UPPER_BOUND
    },
    {
        id: "ADD",
        syntax(x, y) {return `(${x})+(${y})`},
        value(x, y) {return x + y},
        min: LOWER_BOUND,
        max: UPPER_BOUND
    },
    {
        id: "AND",
        syntax(x, y) {return `(${x})&(${y})`},
        value(x, y) {return x & y},
        min: LOWER_BOUND,
        max: UPPER_BOUND
    },
    {
        id: "AVG",
        syntax(x, y) {return `am(${x},${y})`},
        value(x, y) {return (x + y) / 2},
        min: LOWER_BOUND,
        max: UPPER_BOUND
    },
    {
        id: "MLT",
        syntax(x, y) {return `(${x})*(${y})`},
        value(x, y) {return x * y},
        min: LOWER_BOUND,
        max: UPPER_BOUND
    },
    {
        id: "NOR",
        syntax(x, y) {return `(${x})~~|~~(${y})`},
        value(x, y) {
            let n = x | y
            return 2 ** (Math.floor(Math.log2(n)) + 1) - n - 1
        },
        min: LOWER_BOUND,
        max: UPPER_BOUND
    },
    {
        id: "LEFT",
        syntax(x, y) {return `(${x})<<(${y})`},
        value(x, y) {return x << y},
        min: LOWER_BOUND,
        max: UPPER_BOUND
    },
    {
        id: "NAND",
        syntax(x, y) {return `(${x})⊼${y})`},
        value(x, y) {
            let n = x & y
            return 2 ** (Math.floor(Math.log2(n)) + 1) - n - 1
        },
        min: LOWER_BOUND,
        max: UPPER_BOUND
    },
    {
        id: "CONCAT",
        syntax(x, y) {return `(${x})..(${y})`},
        value(x, y) {return x * 10 ** (Math.floor(Math.log10(Math.max(y, 1))) + 1) + y},
        min: LOWER_BOUND,
        max: UPPER_BOUND
    }
]

export {binary}