/*
 * index.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/nanorpc-http-client
 */

import * as R from "ramda";
import {
  NanoRPCError,
  NanoReply,
  NanoValidator,
  createNanoRPC,
  createNanoValidator,
} from "nanorpc-validator";
import { signature } from "./hashes.js";

export * from "nanorpc-validator";

export enum NanoRPCErrCode {
  CallError = -1,
}

export class NanoRPCClient {
  public readonly validators: NanoValidator;
  private readonly api: URL;
  private readonly secret: string;

  constructor(url: string | URL, secret: string) {
    this.validators = createNanoValidator();
    this.secret = secret;
    this.api = new URL(url);
  }

  async apply<T, P extends object>(method: string, params?: P) {
    const rpc = createNanoRPC(method, params);
    const req = { ...rpc, timestamp: Date.now() };
    const payload = R.join(
      "\n",
      R.sort(
        R.comparator((a, b) => a.localeCompare(b) < 0),
        R.map((kv) => JSON.stringify(kv), R.toPairs(req)),
      ),
    );
    const sign = signature(this.secret, payload);

    const content = await fetch(new URL(`/nanorpcs/${method}`, this.api), {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ...req, sign }),
    });

    const reply: NanoReply<T> = await content.json();

    if (!R.has("status", reply)) {
      throw new NanoRPCError(
        NanoRPCErrCode.CallError,
        `Call ${method} received reply missing code`,
      );
    }

    if (reply.status !== 200) {
      throw new NanoRPCError(
        reply.error?.code ?? NanoRPCErrCode.CallError,
        `Call ${method}, ${reply.error?.message ?? "unknown error"}`,
      );
    }

    const validator = this.validators.getValidator(method);

    if (validator && !validator(reply)) {
      const lines = validator.errors!.map(
        (err) => `${err.keyword}: ${err.instancePath}, ${err.message}`,
      );
      const error = lines.join("\n");

      throw new NanoRPCError(
        NanoRPCErrCode.CallError,
        `Call ${method}, ${error}`,
      );
    }

    return reply.result;
  }

  async call<T, P extends Array<unknown>>(method: string, ...args: P) {
    return await this.apply<T, P>(method, args);
  }

  invoke<T, P extends Array<unknown>>(method: string) {
    return async (...args: P) => await this.apply<T, P>(method, args);
  }
}

export const createNanoRPCClient = (url: string | URL, secret: string) =>
  new NanoRPCClient(url, secret);
