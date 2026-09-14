const ele = id => document.getElementById(id)
const canvas = ele("canvas")
const ctx = canvas.getContext("2d")
const input = ele("num")

const colors = ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0000ff", "#ff00ff"]
const colorAmt = 4

function mix(color, pixel) {
    // color = #rrggbb
    // pixel = [r, g, b]
    color = parseInt(color.slice(1), 16)
    let r = Math.floor(color / 256 ** 2)
    let g = Math.floor(color / 256) % 256
    let b = color % 256
    let arr = [
        Math.round(r * pixel[0] / 256),
        Math.round(g * pixel[1] / 256),
        Math.round(b * pixel[2] / 256)
    ]
    return arr
}

let imgArr = undefined
let img = new Image()
img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    imgArr = ctx.getImageData(0, 0, img.width, img.height).data
}
img.src = "./gwa.png"

ele("gen").addEventListener("click", () => {
    if(!imgArr)return;
    let num = Number(input.value)
    let arr = imgArr.slice()
    for(let y = 0; y < img.height; y++) {
        let exp = colors.length ** Math.floor(y / img.height * colorAmt)
        let color = colors[Math.floor(num / exp) % colors.length]
        for(let x = 0; x < img.width; x++) {
            let p = (y * img.width + x) * 4
            let a = mix(color, [arr[p], arr[p + 1], arr[p + 2]])
            arr[p] = a[0]
            arr[p + 1] = a[1]
            arr[p + 2] = a[2]
        }
    }
    ctx.putImageData(new ImageData(arr, img.width, img.height), 0, 0)
    canvas.toBlob(blob => {
        const item = new ClipboardItem({"image/png": blob})
        navigator.clipboard.write([item])
    })
})