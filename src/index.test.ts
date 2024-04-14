/*
 * index.test.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/nanorpc-http-client
 */

import { createNanoRPCClient } from "./index.js";
import { signature as signatureNode } from "./hashes.js";
import { signature as signatureBrowser } from "./hashes.browser.js";

const test = async () => {
  const secret = "52440ec2-2a22-4544-93a7-161dfc47239a";

  const rpc = createNanoRPCClient("http://127.0.0.1:4000", secret);

  console.log(signatureNode(secret, "HelloWorld!"));
  console.log(signatureBrowser(secret, "HelloWorld!"));

  console.log(await rpc.apply("add", [2, 3]));
};

test();
