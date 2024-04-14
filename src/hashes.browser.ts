/*
 * hashes.browser.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/nanorpc-http-client
 */

import crypto from "crypto-js";

export const signature = (secret: string, payload: string) =>
  crypto.HmacSHA256(`${payload}\n${secret}`, secret).toString(crypto.enc.Hex);
