const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
const dpr = window.devicePixelRatio

function main(img) {
    //canvas.style.width = `${img.width}px`
    //canvas.style.height = `${img.height}px`
    canvas.width = Math.floor(img.width)
    canvas.height = Math.floor(img.height)
    //ctx.scale(dpr, dpr)
    ctx.drawImage(img, 0, 0, img.width, img.height)

    let imgData = ctx.getImageData(0, 0, img.width, img.height)
    let data = imgData.data
    let result = []
    const gridSize = 37
    const scale = 1
    for(let i = 0; i < gridSize; i++) {
        result.push([])
    }
    for(let i = 0; i < gridSize; i++) {
        let x = Math.round((16.2 * i + 8) * scale)
        for(let j = 0; j < gridSize; j++) {
            let y = Math.round((16.2 * j + 209) * scale)
            let id = Math.floor(x + y * img.width) * 4
            result[j].push([data[id], data[id + 1], data[id + 2]])
            data[id] = 40
            data[id + 1] = 40
            data[id + 2] = 40
        }
    }
    
    let arr = result.flat().map(color => {
        let r = color[0] / 255
        let g = color[1] / 255
        let b = color[2] / 255
        let max = Math.max(r, g, b)
        let min = Math.min(r, g, b)
        let diff = max - min
        let hue = 0
        if(max == r) {
            hue = (g - b) / diff % 6
        }else if(max == g) {
            hue = (b - r) / diff + 2
        }else{
            hue = (r - g) / diff + 4
        }
        return [color[0] * 256 ** 2 + color[1] * 256 + color[2], hue]
    })
    arr.sort((a, b) => a[1] == b[1] ? a[0] - b[0] : a[1] - b[1])
    arr = arr.map(a => a[0])
    let grid = []
    for(let i = 0; i < gridSize; i++) {
        grid.push([])
        for(let j = 0; j < gridSize; j++) {
            grid.at(-1).push(arr[i * gridSize + j])
        }
    }
    console.log(grid)
    navigator.clipboard.writeText(grid.map(arr => arr.join("\t")).join("\n"))
    ctx.putImageData(imgData, 0, 0)
}

document.getElementById("fin").addEventListener("change", input => {
    let fr = new FileReader()
    fr.onload = () => {
        let img = new Image()
        img.onload = () => main(img)
        img.src = fr.result
    }
    fr.readAsDataURL(input.target.files[0])
})