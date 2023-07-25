// const fs = require("fs")
import { execSync } from "child_process";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
const detail = handlebars.compile(fs.readFileSync("detail.hbs", { encoding: "utf-8" }))

const files = fs.readdirSync(path.resolve("testsuite/valid"))
    .filter(f => path.extname(f) === ".wasm")
    .map(f => path.resolve("testsuite/valid", f))
    .filter(f => fs.statSync(f).isFile())
    .map(f => {
        const basename = path.basename(f)
        const filename = basename.slice(0, basename.indexOf("."))
        const name = basename.slice(0, -5)
        execSync(`mkdir -p spec/${filename}/`)
        execSync(`./wabt/bin/wasm2wat ${f} -o spec/${filename}/${name}.wat`)
        execSync(`./wabt/bin/wasm-objdump ${f} -x -s -h --debug 1> spec/${filename}/${name}.dump 2> spec/${filename}/${name}.debug`)
        execSync(`xxd  -u -g1 -c8 ${f} > spec/${filename}/${name}.hex`)

        const html = detail({
            name,
            debug: fs.readFileSync(`spec/${filename}/${name}.debug`),
            dump: fs.readFileSync(`spec/${filename}/${name}.dump`),
            hex: fs.readFileSync(`spec/${filename}/${name}.hex`),
            wat: fs.readFileSync(`spec/${filename}/${name}.wat`),
        })
        fs.writeFileSync(`output/${basename}.html`, html)
        return { filename, basename }
    }).reduce((r, file) => {
        r[file.filename] ||= []
        r[file.filename].push(file.basename)
        return r
    }, {})

const index = handlebars.compile(fs.readFileSync("index.hbs", { encoding: "utf-8" }))
const html = index({ files })
fs.writeFileSync(`output/index.html`, html)
