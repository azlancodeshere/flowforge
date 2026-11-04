import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createWorkflowValidator,
  updateWorkflowValidator,
  workflowIdValidator,
} from "./workflow.validators";

const validNode = {
  id: "n1",
  type: "trigger" as const,
  position: { x: 0, y: 0 },
  data: {},
};

const validBody = {
  workflowname: "My workflow",
  description: "Sends an email",
  nodes: [validNode],
  edges: [{ id: "e1", source: "n1", target: "n2" }],
};

describe("createWorkflowValidator", () => {
  it("accepts a well-formed workflow", () => {
    const result = createWorkflowValidator.safeParse({ body: validBody });

    assert.equal(result.success, true);
  });

  it("trims the workflow name", () => {
    const result = createWorkflowValidator.safeParse({
      body: { ...validBody, workflowname: "  Padded  " },
    });

    assert.equal(result.success, true);
    assert.equal(result.success && result.data.body.workflowname, "Padded");
  });

  it("rejects a blank workflow name", () => {
    const result = createWorkflowValidator.safeParse({
      body: { ...validBody, workflowname: "   " },
    });

    assert.equal(result.success, false);
  });

  it("rejects a name longer than 100 characters", () => {
    const result = createWorkflowValidator.safeParse({
      body: { ...validBody, workflowname: "a".repeat(101) },
    });

    assert.equal(result.success, false);
  });

  it("rejects an unknown node type", () => {
    const result = createWorkflowValidator.safeParse({
      body: {
        ...validBody,
        nodes: [{ ...validNode, type: "transform" }],
      },
    });

    assert.equal(result.success, false);
  });

  it("rejects an edge without a source", () => {
    const result = createWorkflowValidator.safeParse({
      body: {
        ...validBody,
        edges: [{ id: "e1", source: "", target: "n2" }],
      },
    });

    assert.equal(result.success, false);
  });

  it("defaults a missing description to an empty string", () => {
    const { description: _dropped, ...withoutDescription } = validBody;
    const result = createWorkflowValidator.safeParse({
      body: withoutDescription,
    });

    assert.equal(result.success, true);
    assert.equal(result.success && result.data.body.description, "");
  });
});

describe("updateWorkflowValidator", () => {
  it("accepts a partial update", () => {
    const result = updateWorkflowValidator.safeParse({
      body: { workflowname: "Renamed" },
    });

    assert.equal(result.success, true);
  });

  it("rejects an empty update", () => {
    const result = updateWorkflowValidator.safeParse({ body: {} });

    assert.equal(result.success, false);
  });
});

describe("workflowIdValidator", () => {
  it("accepts a 24 hex character ObjectId", () => {
    const result = workflowIdValidator.safeParse({
      params: { id: "507f1f77bcf86cd799439011" },
    });

    assert.equal(result.success, true);
  });

  it("rejects a malformed id", () => {
    const result = workflowIdValidator.safeParse({
      params: { id: "not-an-objectid" },
    });

    assert.equal(result.success, false);
  });
});
