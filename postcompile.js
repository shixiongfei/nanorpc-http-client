/*
 * postcompile.js
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/nanorpc-http-client
 */

const fs = require("node:fs");

fs.copyFileSync("./package.esm.json", "./lib/esm/package.json");
