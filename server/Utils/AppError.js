import * as test from "node:test";

export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = "AppError";
  }

}
