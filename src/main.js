// const fs = require("fs")
import { execSync } from "child_process";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
const hbs = handlebars.compile(fs.readFileSync("index.hbs", { encoding: "utf-8" }))

fs.readdirSync(path.resolve("testsuite/valid"))
    .filter(f => path.extname(f) === ".wasm")
    .map(f => path.resolve("testsuite/valid", f))
    .filter(f => fs.statSync(f).isFile())
    .forEach(f => {
        const basename = path.basename(f)
        const filename = basename.slice(0, basename.indexOf("."))
        const name = basename.slice(0, -5)
        execSync(`mkdir -p output/spec/${filename}/`)
        execSync(`./wabt/bin/wasm2wat ${f} -o output/spec/${filename}/${name}.wat`)
        execSync(`./wabt/bin/wasm-objdump ${f} -x -s -h --debug 1> output/spec/${filename}/${name}.dump 2> output/spec/${filename}/${name}.debug`)
        execSync(`xxd  -u -g1 -c8 ${f} > output/spec/${filename}/${name}.hex`)

        const html = hbs({
            name,
            debug: fs.readFileSync(`output/spec/${filename}/${name}.debug`),
            dump: fs.readFileSync(`output/spec/${filename}/${name}.dump`),
            hex: fs.readFileSync(`output/spec/${filename}/${name}.hex`),
            wat: fs.readFileSync(`output/spec/${filename}/${name}.wat`),
        })
        fs.writeFileSync(`output/${basename}.html`, html)
    })
