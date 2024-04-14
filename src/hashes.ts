/*
 * hashes.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/nanorpc-http-client
 */

import crypto from "node:crypto";

export const signature = (secret: string, payload: string) =>
  crypto
    .createHmac("sha256", secret)
    .update(`${payload}\n${secret}`)
    .digest()
    .toString("hex");
