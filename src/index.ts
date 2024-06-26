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
  NanoReply,
  NanoValidator,
  createNanoRPC,
  createNanoValidator,
} from "nanorpc-validator";
import { signature } from "./hashes.js";

enum NanoRPCCode {
  OK = 0,
}

type NanoRPCHttpResp<T> = {
  code: number;
  data?: NanoReply<T>;
  error?: { name: string; message: string };
};

export class NanoRPCClient {
  public readonly validators: NanoValidator;
  private readonly api: URL;
  private readonly secret: string;

  constructor(url: string | URL, secret: string) {
    this.validators = createNanoValidator();
    this.secret = secret;
    this.api = new URL(url);
  }

  async apply<T, P extends Array<unknown>>(method: string, args: P) {
    const rpc = createNanoRPC(method, args);
    const payload = R.join(
      "\n",
      R.sort(
        R.comparator((a, b) => a.localeCompare(b) < 0),
        R.map(([key, value]) => `${key.toString()}=${value}`, R.toPairs(rpc)),
      ),
    );
    const sign = signature(this.secret, payload);

    const content = await fetch(new URL(`/nanorpcs/${method}`, this.api), {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ...rpc, sign }),
    });

    const json: NanoRPCHttpResp<T> = await content.json();

    if (!R.has("code", json)) {
      throw new Error(`NanoRPC call ${method} received reply missing code`);
    }

    if (json.code !== 200) {
      if (R.has("error", json)) {
        const error = `${json.code} ${json.error!.name}: ${json.error!.message}`;
        throw new Error(`NanoRPC call ${method}, ${error}`);
      }

      throw new Error(`NanoRPC call ${method}, unknown error`);
    }

    if (!R.has("data", json)) {
      throw new Error(`NanoRPC call ${method} received reply missing data`);
    }

    const reply = json.data!;
    const validator = this.validators.getValidator(method);

    if (validator && !validator(reply)) {
      const lines = validator.errors!.map(
        (err) => `${err.keyword}: ${err.instancePath}, ${err.message}`,
      );
      const error = lines.join("\n");

      throw new Error(`NanoRPC call ${method}, ${error}`);
    }

    if (reply.code !== NanoRPCCode.OK) {
      throw new Error(`NanoRPC call ${method} ${reply.message}`);
    }

    return reply.value;
  }

  async call<T, P extends Array<unknown>>(method: string, ...args: P) {
    return this.apply<T, P>(method, args);
  }

  invoke<T, P extends Array<unknown>>(method: string) {
    return async (...args: P) => await this.apply<T, P>(method, args);
  }
}

export const createNanoRPCClient = (url: string | URL, secret: string) =>
  new NanoRPCClient(url, secret);
