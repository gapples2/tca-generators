import {wiped, corrupted} from "./func_info.js"

const identity = ([
    {
        id: "DC",
        syntax(x) {return `D‾(D‾(${x}))`}
    },
    {
        id: "GM",
        syntax(x) {return `GM(${x})`}
    },
    {
        id: "HM",
        syntax(x) {return `HM(${x})`},
    },
    {
        id: "RE",
        syntax(x) {return `re(${x})`}
    },
    {
        id: "ABS",
        syntax(x) {return `|${x}|`}
    },
    {
        id: "ADI",
        syntax(x) {return `-(-(${x}))`}
    },
    {
        id: "AVG",
        syntax(x) {return `am(${x})`}
    },
    {
        id: "DET",
        syntax(x) {return `det([${x}])`}
    },
    {
        id: "GCD",
        syntax(x) {return `gcd(${x})`}
    },
    {
        id: "LCM",
        syntax(x) {return `lcm(${x})`}
    },
    {
        id: "MAX",
        syntax(x) {return `max(${x})`}
    },
    {
        id: "MIN",
        syntax(x) {return `min(${x})`}
    },
    {
        id: "RMS",
        syntax(x) {return `RMS(${x})`}
    },
    {
        id: "STD",
        syntax(x) {return `σ(${x})`}
    },
    {
        id: "CEIL",
        syntax(x) {return `⌈${x}⌉`}
    }
]).filter(x => !wiped[x.id] && !corrupted[x.id]).sort((a, b) => a.syntax("").length - b.syntax("").length)

export {identity}