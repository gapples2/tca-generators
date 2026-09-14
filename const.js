const LOWER_BOUND = 0
const UPPER_BOUND = 1e6
const UNIQUE_FUNCTION_LIMIT = 4
const FUNCTION_PER_LIMIT = 4
const SOLUTION_MIN = 143
const SOLUTION_MAX = 1000
const CONSTANT_FUNCTIONS = [0, 1, 2, 4, 5, 6, 9, 10]
const SOLUTION_INPUTS = [
    /*{
        title: "XC1 - X = 0",
        txt: "x",
        distinct: 13
    },
    {
        title: "XC3 - X = √2",
        txt: "[√2,rem(√2)]",
        distinct: 3
    },
    {
        title: "XC4 - X = √(e,e)",
        txt: "[√(e,e),rem(√(e,e))]",
        distinct: 3
    },
     {
        title: "XC5 - X = φ",
        txt: "[φ,rem(φ)]",
        distinct: 3
    },*/
    {
        title: "XC6 - X = b",
        txt: "[b,b,rem(b)]",
        distinct: 4
    },
    {
        title: "XC7 - X = e",
        txt: "[e,e,rem(e)]",
        distinct: 4
    },
    {
        title: "XC8 - X = π",
        txt: "[π,π,π,rem(π)]",
        distinct: 5
    },
    {
        title: "XC9 - X = Ψ",
        txt: "[Ψ,Ψ,Ψ,rem(Ψ)]",
        distinct: 5
    },/*
    {
        title: "XC10 - X = i",
        txt: `[${"i,".repeat(13).slice(0, -1)}]`,
        distinct: 0,
        append: " [13]"
    }*/
]
const IGNORE_WIPED = false

export {LOWER_BOUND, UPPER_BOUND, UNIQUE_FUNCTION_LIMIT, FUNCTION_PER_LIMIT, SOLUTION_MIN, SOLUTION_MAX, CONSTANT_FUNCTIONS, SOLUTION_INPUTS, IGNORE_WIPED}
