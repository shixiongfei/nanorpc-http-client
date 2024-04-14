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

type AddRPCFunc = (a: number, b: number) => Promise<number | undefined>;

const test = async () => {
  console.log(signatureNode("1234567890", "HelloWorld!"));
  console.log(signatureBrowser("1234567890", "HelloWorld!"));

  const rpc = createNanoRPCClient(
    "http://127.0.0.1:4000",
    "52440ec2-2a22-4544-93a7-161dfc47239a",
  );

  const addRPC: AddRPCFunc = rpc.invoke("add");

  console.log(await Promise.all([addRPC(23, 31), rpc.call("add", 123, 456)]));
};

test();
