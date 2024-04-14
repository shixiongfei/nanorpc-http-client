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

import { NanoValidator, createNanoValidator } from "nanorpc-validator";

export class NanoRPCClient {
  public readonly validators: NanoValidator;
  private readonly api: URL;
  private readonly secret: string;

  constructor(url: string | URL, secret: string) {
    this.validators = createNanoValidator();
    this.secret = secret;
    this.api = new URL(url);
  }

  async apply<T, M extends string, P extends Array<unknown>>(
    method: M,
    args: P,
  ) {
    return new URL(`/nanorpcs/${method}`, this.api);
  }

  async call<T, M extends string, P extends Array<unknown>>(
    method: M,
    ...args: P
  ) {
    return this.apply<T, M, P>(method, args);
  }

  invoke<T, M extends string, P extends Array<unknown>>(method: M) {
    return async (...args: P) => await this.apply<T, M, P>(method, args);
  }
}

export const createNanoRPCClient = (url: string | URL, secret: string) =>
  new NanoRPCClient(url, secret);
