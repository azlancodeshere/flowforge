import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ApiError } from "./ApiError";
import { ApiResponse } from "./ApiResponse";

describe("ApiError", () => {
  it("carries the status code and message", () => {
    const error = new ApiError(404, "Workflow not found");

    assert.equal(error.statusCode, 404);
    assert.equal(error.message, "Workflow not found");
    assert.equal(error.name, "ApiError");
    assert.ok(error instanceof Error);
  });

  it("defaults to a 500 response", () => {
    const error = new ApiError(500);

    assert.equal(error.statusCode, 500);
    assert.equal(error.message, "Something went wrong");
  });
});

describe("ApiResponse", () => {
  it("marks 2xx responses as successful", () => {
    const response = new ApiResponse(200, { id: "1" }, "Created");

    assert.equal(response.success, true);
    assert.equal(response.statusCode, 200);
    assert.equal(response.message, "Created");
    assert.deepEqual(response.data, { id: "1" });
  });

  it("marks 4xx responses as failed", () => {
    const response = new ApiResponse(400, null, "Invalid body");

    assert.equal(response.success, false);
    assert.equal(response.statusCode, 400);
    assert.equal(response.data, null);
  });

  it("defaults the message to Success", () => {
    const response = new ApiResponse(204, null);

    assert.equal(response.message, "Success");
  });
});
