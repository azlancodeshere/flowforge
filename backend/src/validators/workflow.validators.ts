
import { z } from "zod";

// ========================================
// 1. NODE VALIDATION
// ========================================

const nodeSchema = z.object({
  id: z.string().min(1, "Node ID is required"),

  type: z.enum(["trigger", "condition", "action"]),

  position: z.object({
    x: z.number(),
    y: z.number(),
  }),

  data: z.record(z.string(), z.unknown()).default({}),
});

// ========================================
// 2. EDGE VALIDATION
// ========================================

const edgeSchema = z.object({
  id: z.string().min(1, "Edge ID is required"),

  source: z.string().min(1, "Source node is required"),

  target: z.string().min(1, "Target node is required"),

  // Condition node ke True/False outputs
  sourceHandle: z.string().nullable().optional(),

  // Target node ka input handle
  targetHandle: z.string().nullable().optional(),

  label: z.string().optional(),
});

// ========================================
// 3. CREATE WORKFLOW VALIDATOR
// ========================================

export const createWorkflowValidator = z.object({
  body: z.object({
    workflowname: z
      .string()
      .trim()
      .min(1, "Workflow name is required")
      .max(100, "Workflow name cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .default(""),

    nodes: z.array(nodeSchema),

    edges: z.array(edgeSchema),
  }),
});

// ========================================
// 4. UPDATE WORKFLOW VALIDATOR
// ========================================

export const updateWorkflowValidator = z.object({
  body: z
    .object({
      workflowname: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

      description: z
        .string()
        .trim()
        .max(500)
        .optional(),

      nodes: z.array(nodeSchema).optional(),

      edges: z.array(edgeSchema).optional(),
    })
    .refine(
      (data) =>
        Object.values(data).some(
          (value) => value !== undefined
        ),
      {
        message: "At least one field is required",
      }
    ),
});

// ========================================
// 5. WORKFLOW ID VALIDATOR
// ========================================

export const workflowIdValidator = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[a-f\d]{24}$/i, "Invalid workflow ID"),
  }),
});
