import {unlocked} from "./func_info.js"

const numberWords = ([
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
    "twenty", "twentyone", "twentytwo", "twentythree", "twentyfour",
    "twentyfive", "twentysix", "twentyseven", "twentyeight", "twentynine",
    "thirty", "thirtyone", "thirtytwo", "thirtythree", "thirtyfour",
    "thirtyfive", "thirtysix", "thirtyseven", "thirtyeight", "thirtynine"
])

const numbers = Object.entries(numberWords).filter(x => unlocked[x[1].toUpperCase()]).map(x => Number(x[0]))

export {numbers, numberWords}