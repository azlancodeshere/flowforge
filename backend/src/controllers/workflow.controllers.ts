
import { Request, Response } from "express";

import { Workflow } from "../models/workflow.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";


interface WorkflowNodeData {
    label?: string;
    category?: string;
    field?: string;
    operator?: string;
    value?: string | number;
    [key: string]: unknown;
}

interface WorkflowNodeItem {
    id: string;
    type: string;
    position?: {
        x: number;
        y: number;
    };
    data?: WorkflowNodeData;
}

interface WorkflowEdgeItem {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
}

interface ExecutionStep {
    nodeId: string;
    nodeName: string;
    nodeType: string;
    status: "success";
    result?: unknown;
}


const evaluateCondition = (
    actualValue: unknown,
    operator: string,
    expectedValue: unknown
): boolean => {

    switch (operator) {

        case "Greater than": {
            const actual = Number(actualValue);
            const expected = Number(expectedValue);

            if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
                throw new ApiError(
                    400,
                    "Invalid numeric values for condition"
                );
            }

            return actual > expected;
        }

        case "Greater than or equal to": {
            const actual = Number(actualValue);
            const expected = Number(expectedValue);

            if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
                throw new ApiError(
                    400,
                    "Invalid numeric values for condition"
                );
            }

            return actual >= expected;
        }

        case "Less than": {
            const actual = Number(actualValue);
            const expected = Number(expectedValue);

            if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
                throw new ApiError(
                    400,
                    "Invalid numeric values for condition"
                );
            }

            return actual < expected;
        }

        case "Less than or equal to": {
            const actual = Number(actualValue);
            const expected = Number(expectedValue);

            if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
                throw new ApiError(
                    400,
                    "Invalid numeric values for condition"
                );
            }

            return actual <= expected;
        }

        case "Equal to":
            return String(actualValue) === String(expectedValue);

        case "Not equal to":
            return String(actualValue) !== String(expectedValue);

        default:
            throw new ApiError(
                400,
                `Unsupported operator: ${operator}`
            );
    }
};


export const createWorkflow = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        const {
            workflowname,
            description,
            nodes,
            edges,
        } = req.body;

        if (
            typeof workflowname !== "string" ||
            !workflowname.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            !Array.isArray(nodes) ||
            !Array.isArray(edges)
        ) {
            throw new ApiError(
                400,
                "All required fields must be provided"
            );
        }

        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const existingWorkflow = await Workflow.findOne({
            userId: req.user._id,
            workflowname: workflowname.trim(),
            isDeleted: false,
        });

        if (existingWorkflow) {
            throw new ApiError(
                409,
                "Workflow with this name already exists"
            );
        }

        const workflow = await Workflow.create({
            workflowname: workflowname.trim(),
            description: description.trim(),
            nodes,
            edges,
            userId: req.user._id,
        });

        res.status(201).json(
            new ApiResponse(
                201,
                workflow,
                "Workflow created successfully"
            )
        );

    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(
                    500,
                    "Something went wrong while creating workflow"
                );

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });
    }
};


export const getWorkflow = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const workflow = await Workflow.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isDeleted: false,
        });

        if (!workflow) {
            throw new ApiError(404, "Workflow not found");
        }

        res.status(200).json(
            new ApiResponse(
                200,
                workflow,
                "Workflow fetched successfully"
            )
        );

    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(
                    500,
                    "Something went wrong while fetching workflow"
                );

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });
    }
};


export const getAllworkflow = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const workflows = await Workflow.find({
            userId: req.user._id,
            isDeleted: false,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json(
            new ApiResponse(
                200,
                workflows,
                "Workflows fetched successfully"
            )
        );

    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(
                    500,
                    "Something went wrong while fetching workflows"
                );

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });
    }
};


export const updateWorkflow = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        const {
            workflowname,
            description,
            nodes,
            edges,
        } = req.body;

        if (
            workflowname === undefined &&
            description === undefined &&
            nodes === undefined &&
            edges === undefined
        ) {
            throw new ApiError(
                400,
                "At least one field is required"
            );
        }

        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const updateData: Record<string, unknown> = {};

        if (workflowname !== undefined) {
            if (
                typeof workflowname !== "string" ||
                !workflowname.trim()
            ) {
                throw new ApiError(
                    400,
                    "Workflow name cannot be empty"
                );
            }

            updateData.workflowname = workflowname.trim();
        }

        if (description !== undefined) {
            if (typeof description !== "string") {
                throw new ApiError(
                    400,
                    "Invalid workflow description"
                );
            }

            updateData.description = description.trim();
        }

        if (nodes !== undefined) {
            if (!Array.isArray(nodes)) {
                throw new ApiError(400, "Nodes must be an array");
            }

            updateData.nodes = nodes;
        }

        if (edges !== undefined) {
            if (!Array.isArray(edges)) {
                throw new ApiError(400, "Edges must be an array");
            }

            updateData.edges = edges;
        }

        const updatedWorkflow =
            await Workflow.findOneAndUpdate(
                {
                    _id: req.params.id,
                    userId: req.user._id,
                    isDeleted: false,
                },
                {
                    $set: updateData,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!updatedWorkflow) {
            throw new ApiError(404, "Workflow not found");
        }

        res.status(200).json(
            new ApiResponse(
                200,
                updatedWorkflow,
                "Workflow updated successfully"
            )
        );

    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(
                    500,
                    "Something went wrong while updating workflow"
                );

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });
    }
};


export const deleteWorkflow = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const workflow = await Workflow.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isDeleted: false,
        });

        if (!workflow) {
            throw new ApiError(404, "Workflow not found");
        }

        await Workflow.deleteOne({
            _id: workflow._id,
            userId: req.user._id,
        });

        res.status(200).json(
            new ApiResponse(
                200,
                workflow,
                "Workflow deleted successfully"
            )
        );

    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(
                    500,
                    "Something went wrong while deleting workflow"
                );

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });
    }
};



export const executeWorkflow = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    const workflow = await Workflow.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!workflow) {
      throw new ApiError(404, "Workflow not found");
    }

    const nodes = workflow.nodes as unknown as {
      id: string;
      type: "trigger" | "condition" | "action";
      data: Record<string, unknown>;
    }[];

    const edges = workflow.edges as unknown as {
      id: string;
      source: string;
      target: string;
      sourceHandle?: string | null;
      targetHandle?: string | null;
      label?: string;
    }[];

    if (nodes.length === 0) {
      throw new ApiError(400, "Workflow has no nodes");
    }

    if (edges.length === 0) {
      throw new ApiError(400, "Workflow has no connections");
    }

    const triggerNodes = nodes.filter(
      (node) => node.type === "trigger"
    );

    if (triggerNodes.length !== 1) {
      throw new ApiError(
        400,
        "Workflow must have exactly one trigger node"
      );
    }

    const inputData = req.body?.inputData;

    if (
      !inputData ||
      typeof inputData !== "object" ||
      Array.isArray(inputData)
    ) {
      throw new ApiError(
        400,
        "Please provide inputData as an object"
      );
    }

    const evaluateCondition = (
      actualValue: unknown,
      operator: string,
      expectedValue: unknown
    ): boolean => {
      const op = operator.toLowerCase().trim();

      const actualNumber = Number(actualValue);
      const expectedNumber = Number(expectedValue);

      const bothNumeric =
        actualValue !== "" &&
        expectedValue !== "" &&
        Number.isFinite(actualNumber) &&
        Number.isFinite(expectedNumber);

      const left = bothNumeric
        ? actualNumber
        : String(actualValue).toLowerCase();

      const right = bothNumeric
        ? expectedNumber
        : String(expectedValue).toLowerCase();

      switch (op) {
        case ">":
        case "greater than":
        case "greater than (>)":
          return left > right;

        case ">=":
        case "greater than or equal to":
        case "greater than or equal to (>=)":
          return left >= right;

        case "<":
        case "less than":
        case "less than (<)":
          return left < right;

        case "<=":
        case "less than or equal to":
        case "less than or equal to (<=)":
          return left <= right;

        case "==":
        case "===":
        case "equal":
        case "equal to":
        case "equal to (==)":
          return left === right;

        case "!=":
        case "!==":
        case "not equal":
        case "not equal to":
        case "not equal to (!=)":
          return left !== right;

        default:
          throw new ApiError(
            400,
            `Unsupported condition operator: ${operator}`
          );
      }
    };

    const executedNodes: {
      nodeId: string;
      nodeName: string;
      nodeType: string;
      status: string;
      result: unknown;
    }[] = [];

    const visitedNodes = new Set<string>();

    let currentNodeId: string | null = triggerNodes[0].id;

    const MAX_STEPS = 100;
    let stepCount = 0;

    while (currentNodeId !== null) {
      stepCount++;

      if (stepCount > MAX_STEPS) {
        throw new ApiError(
          400,
          "Workflow exceeded maximum execution steps"
        );
      }

      if (visitedNodes.has(currentNodeId)) {
        throw new ApiError(
          400,
          "Cycle detected in workflow"
        );
      }

      visitedNodes.add(currentNodeId);

      const currentNode = nodes.find(
        (node) => node.id === currentNodeId
      );

      if (!currentNode) {
        throw new ApiError(
          400,
          `Node not found: ${currentNodeId}`
        );
      }

      const nodeType = currentNode.type;

      const nodeName = String(
        currentNode.data?.label ?? nodeType
      );


      if (nodeType === "trigger") {
        executedNodes.push({
          nodeId: currentNode.id,
          nodeName,
          nodeType,
          status: "success",
          result: "Workflow started successfully",
        });
      }


      else if (nodeType === "condition") {
        const field = currentNode.data?.field;
        const operator = currentNode.data?.operator;
        const expectedValue = currentNode.data?.value;

        if (
          typeof field !== "string" ||
          typeof operator !== "string" ||
          expectedValue === undefined
        ) {
          throw new ApiError(
            400,
            `Condition settings are missing in ${nodeName}`
          );
        }

        const actualValue = (
          inputData as Record<string, unknown>
        )[field];

        if (actualValue === undefined) {
          throw new ApiError(
            400,
            `Input data missing for field: ${field}`
          );
        }

        const conditionResult = evaluateCondition(
          actualValue,
          operator,
          expectedValue
        );

        const selectedHandle = conditionResult
          ? "true"
          : "false";

        executedNodes.push({
          nodeId: currentNode.id,
          nodeName,
          nodeType,
          status: "success",
          result: {
            field,
            actualValue,
            operator,
            expectedValue,
            conditionResult,
            selectedHandle,
          },
        });

        const selectedEdge = edges.find((edge) => {
          if (edge.source !== currentNodeId) {
            return false;
          }

          const handle = edge.sourceHandle?.toLowerCase();

          const label = edge.label?.toLowerCase();

          return (
            handle === selectedHandle ||
            (!handle && label === selectedHandle)
          );
        });

        if (!selectedEdge) {
          console.log("Condition:", nodeName);
          console.log("Selected branch:", selectedHandle);

          console.log(
            "Available edges:",
            JSON.stringify(
              edges.filter(
                (edge) => edge.source === currentNodeId
              ),
              null,
              2
            )
          );

          throw new ApiError(
            400,
            `No ${selectedHandle} connection found for ${nodeName}. Check sourceHandle in saved edges.`
          );
        }

        currentNodeId = selectedEdge.target;

        continue;
      }


      else if (nodeType === "action") {
        executedNodes.push({
          nodeId: currentNode.id,
          nodeName,
          nodeType,
          status: "success",
          result: `${nodeName} action reached successfully`,
        });
      }

      else {
        throw new ApiError(
          400,
          `Unsupported node type: ${nodeType}`
        );
      }


      const outgoingEdges = edges.filter(
        (edge) => edge.source === currentNodeId
      );

      if (outgoingEdges.length > 1) {
        throw new ApiError(
          400,
          `Multiple outgoing connections found for ${nodeName}`
        );
      }

      currentNodeId =
        outgoingEdges.length === 1
          ? outgoingEdges[0].target
          : null;
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          workflowId: workflow._id,
          status: "completed",
          inputData,
          executedNodes,
          totalExecutedNodes: executedNodes.length,
        },
        "Workflow executed successfully"
      )
    );

  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(
            500,
            "Something went wrong while executing workflow"
          );

    res.status(apiError.statusCode).json({
      statusCode: apiError.statusCode,
      message: apiError.message,
      success: false,
    });
  }
};
