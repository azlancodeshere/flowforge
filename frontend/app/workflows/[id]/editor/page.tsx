
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { DragEvent, MouseEvent } from "react";

import api from "@/lib/api";
import ConditionNode from "../../ConditionNode";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";

import type {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

// =====================================================
// 1. TYPES
// =====================================================

type WorkflowNodeData = {
  label: string;
  icon: string;
  category: "trigger" | "condition" | "action";
  description: string;
  field?: string;
  operator?: string;
  value?: string;
};

type WorkflowNode = Node<WorkflowNodeData>;

type NodeItem = {
  category: "trigger" | "condition" | "action";
  icon: string;
  title: string;
  description: string;
  border: string;
};

// =====================================================
// 2. NODE TYPES
// =====================================================

const nodeTypes = {
  conditionNode: ConditionNode,
};

const nodeItems: NodeItem[] = [
  {
    category: "trigger",
    icon: "⚡",
    title: "Manual Trigger",
    description: "Start workflow manually",
    border: "#3b82f6",
  },
  {
    category: "condition",
    icon: "◇",
    title: "Condition",
    description: "Check a specific condition",
    border: "#8b5cf6",
  },
  {
    category: "action",
    icon: "✉",
    title: "Send Email",
    description: "Send an email",
    border: "#10b981",
  },
  {
    category: "action",
    icon: "🔔",
    title: "Notification",
    description: "Send a notification",
    border: "#f59e0b",
  },
];

const inputClass =
  "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 text-white";

// =====================================================
// 3. PAGE COMPONENT
// =====================================================

export default function WorkflowEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#0b1120] text-white flex items-center justify-center">
          Loading Workflow Editor...
        </div>
      }
    >
      <WorkflowEditorContent />
    </Suspense>
  );
}

// =====================================================
// 4. MAIN EDITOR COMPONENT
// =====================================================

function WorkflowEditorContent() {
  const params = useParams<{ id: string }>();
  const workflowId = params.id;

  const canvasRef = useRef<HTMLDivElement>(null);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [selectedNode, setSelectedNode] =
    useState<WorkflowNode | null>(null);

  const [isLoadingWorkflow, setIsLoadingWorkflow] =
    useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState(false);

  // Workflow execution states

  const [showRunModal, setShowRunModal] = useState(false);
  const [inputMarks, setInputMarks] = useState("50");
  const [isExecuting, setIsExecuting] = useState(false);

  const [executionResult, setExecutionResult] =
    useState<any>(null);

  const [executionError, setExecutionError] = useState("");

  // =====================================================
  // 5. LOAD WORKFLOW
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadWorkflow = async () => {
      try {
        const response = await api.get(
          `/workflows/get-singleWorkflow/${workflowId}`
        );

        const responseData = response.data?.data;

        const workflow =
          responseData?.workflow ?? responseData;

        if (
          !workflow ||
          !Array.isArray(workflow.nodes) ||
          !Array.isArray(workflow.edges)
        ) {
          throw new Error("Invalid workflow response");
        }

        const restoredNodes: WorkflowNode[] =
          workflow.nodes.map((savedNode: any) => {
            const category =
              savedNode.data?.category ?? savedNode.type;

            const isCondition = category === "condition";

            const border =
              category === "trigger"
                ? "#3b82f6"
                : isCondition
                  ? "#8b5cf6"
                  : "#10b981";

            return {
              id: savedNode.id,

              type: isCondition
                ? "conditionNode"
                : "default",

              position: savedNode.position,

              data: {
                ...savedNode.data,
                category,

                label:
                  savedNode.data?.label ??
                  (isCondition
                    ? "Condition"
                    : category === "trigger"
                      ? "Manual Trigger"
                      : "Action"),

                icon:
                  savedNode.data?.icon ??
                  (isCondition ? "◇" : "⚡"),

                description:
                  savedNode.data?.description ?? "",
              },

              style: isCondition
                ? undefined
                : {
                    background: "#1e293b",
                    color: "#ffffff",
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "14px",
                    width: 190,
                  },
            };
          });

        const restoredEdges: Edge[] =
          workflow.edges.map(
            (savedEdge: any, index: number) => ({
              id: savedEdge.id ?? `edge-${index}`,
              source: savedEdge.source,
              target: savedEdge.target,

              sourceHandle:
                savedEdge.sourceHandle ?? null,

              targetHandle:
                savedEdge.targetHandle ?? null,

              label: savedEdge.label ?? undefined,

              animated: true,

              style: {
                stroke:
                  savedEdge.sourceHandle === "true"
                    ? "#10b981"
                    : savedEdge.sourceHandle === "false"
                      ? "#ef4444"
                      : "#8b5cf6",

                strokeWidth: 2,
                strokeDasharray: "2 6",
              },
            })
          );

        if (isMounted) {
          setNodes(restoredNodes);
          setEdges(restoredEdges);
          setSelectedNode(null);

          console.log("Workflow loaded:", workflow);
        }
      } catch (error) {
        console.error("Workflow loading failed:", error);

        if (isMounted) {
          setSaveError(true);
          setSaveMessage("Failed to load workflow.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingWorkflow(false);
        }
      }
    };

    if (workflowId) {
      loadWorkflow();
    } else {
      setIsLoadingWorkflow(false);
    }

    return () => {
      isMounted = false;
    };
  }, [workflowId]);

  // =====================================================
  // 6. ADD NODE
  // =====================================================

  const addNodeToCanvas = (
    item: NodeItem,
    position?: { x: number; y: number }
  ) => {
    if (!reactFlowInstance || !canvasRef.current) {
      return;
    }

    const bounds =
      canvasRef.current.getBoundingClientRect();

    const nodePosition =
      position ??
      reactFlowInstance.screenToFlowPosition({
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      });

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),

      type:
        item.category === "condition"
          ? "conditionNode"
          : "default",

      position: nodePosition,

      data: {
        label: item.title,
        icon: item.icon,
        category: item.category,
        description: item.description,

        ...(item.category === "condition"
          ? {
              field: "Marks",
              operator: "Greater than or equal to",
              value: "40",
            }
          : {}),
      },

      style:
        item.category === "condition"
          ? undefined
          : {
              background: "#1e293b",
              color: "#ffffff",
              border: `1px solid ${item.border}`,
              borderRadius: "12px",
              padding: "14px",
              width: 190,
            },
    };

    setNodes((oldNodes) => [...oldNodes, newNode]);
    setSelectedNode(newNode);
    setSaveMessage("");
  };

  // =====================================================
  // 7. DRAG AND DROP
  // =====================================================

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    item: NodeItem
  ) => {
    event.dataTransfer.setData(
      "nodeTitle",
      item.title
    );

    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    if (!reactFlowInstance) return;

    const title =
      event.dataTransfer.getData("nodeTitle");

    const item = nodeItems.find(
      (node) => node.title === title
    );

    if (!item) return;

    const position =
      reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

    addNodeToCanvas(item, position);
  };

  // =====================================================
  // 8. NODE CHANGES
  // =====================================================

  const handleNodesChange = (
    changes: NodeChange<WorkflowNode>[]
  ) => {
    setNodes((oldNodes) =>
      applyNodeChanges(
        changes,
        oldNodes
      ) as WorkflowNode[]
    );
  };

  // =====================================================
  // 9. EDGE CHANGES
  // =====================================================

  const handleEdgesChange = (
    changes: EdgeChange[]
  ) => {
    setEdges((oldEdges) =>
      applyEdgeChanges(changes, oldEdges)
    );
  };

  // =====================================================
  // 10. CONNECT NODES
  // =====================================================

  const handleConnect = (params: Connection) => {
    const branchLabel =
      params.sourceHandle === "true"
        ? "True"
        : params.sourceHandle === "false"
          ? "False"
          : undefined;

    const branchColor =
      params.sourceHandle === "true"
        ? "#10b981"
        : params.sourceHandle === "false"
          ? "#ef4444"
          : "#8b5cf6";

    setEdges((oldEdges) =>
      addEdge(
        {
          ...params,

          id: crypto.randomUUID(),

          label: branchLabel,

          animated: true,

          style: {
            stroke: branchColor,
            strokeWidth: 2,
            strokeDasharray: "2 6",
          },

          labelStyle: {
            fill: branchColor,
            fontWeight: 600,
          },

          labelBgStyle: {
            fill: "#0f172a",
          },
        },
        oldEdges
      )
    );

    setSaveMessage("");
  };

  // =====================================================
  // 11. SELECT NODE
  // =====================================================

  const handleNodeClick = (
    _event: MouseEvent,
    node: WorkflowNode
  ) => {
    setSelectedNode(node);
  };

  // =====================================================
  // 12. UPDATE NODE DATA
  // =====================================================

  const updateSelectedNodeData = (
    key: keyof WorkflowNodeData,
    value: string
  ) => {
    if (!selectedNode) return;

    setNodes((oldNodes) =>
      oldNodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                [key]: value,
              },
            }
          : node
      )
    );

    setSelectedNode((oldNode) =>
      oldNode
        ? {
            ...oldNode,
            data: {
              ...oldNode.data,
              [key]: value,
            },
          }
        : null
    );

    setSaveMessage("");
  };

  // =====================================================
  // 13. DELETE NODE
  // =====================================================

  const deleteSelectedNode = () => {
    if (!selectedNode) return;

    setNodes((oldNodes) =>
      oldNodes.filter(
        (node) => node.id !== selectedNode.id
      )
    );

    setEdges((oldEdges) =>
      oldEdges.filter(
        (edge) =>
          edge.source !== selectedNode.id &&
          edge.target !== selectedNode.id
      )
    );

    setSelectedNode(null);
    setSaveMessage("");
  };

  // =====================================================
  // 14. SAVE WORKFLOW
  // =====================================================

  const handleSaveWorkflow = async () => {
    if (isLoadingWorkflow || isSaving) return;

    if (!workflowId) {
      setSaveError(true);
      setSaveMessage("Workflow ID is missing.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");
      setSaveError(false);

      const formattedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.category,
        position: node.position,
        data: node.data,
      }));

      const formattedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,

        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,

        ...(edge.label
          ? { label: String(edge.label) }
          : {}),
      }));

      const response = await api.patch(
        `/workflows/update-workflow/${workflowId}`,
        {
          nodes: formattedNodes,
          edges: formattedEdges,
        }
      );

      console.log("Workflow saved:", response.data);

      setSaveMessage("All changes saved successfully!");
      setSaveError(false);
    } catch (error) {
      console.error("Workflow save failed:", error);

      setSaveMessage("Failed to save workflow.");
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // 15. RUN WORKFLOW
  // =====================================================

  const handleRunWorkflow = async () => {
    if (
      !workflowId ||
      isExecuting ||
      isSaving ||
      isLoadingWorkflow
    ) {
      return;
    }

    const marks = Number(inputMarks);

    if (
      inputMarks.trim() === "" ||
      !Number.isFinite(marks)
    ) {
      setExecutionError("Please enter valid marks.");
      return;
    }

    if (nodes.length === 0) {
      setExecutionError(
        "Add nodes before running the workflow."
      );
      return;
    }

    const hasTrigger = nodes.some(
      (node) => node.data.category === "trigger"
    );

    if (!hasTrigger) {
      setExecutionError(
        "Your workflow must contain a Manual Trigger node."
      );
      return;
    }

    try {
      setIsExecuting(true);
      setExecutionError("");
      setExecutionResult(null);

      // Save latest canvas data first

      const formattedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.category,
        position: node.position,
        data: node.data,
      }));

      const formattedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,

        ...(edge.label
          ? { label: String(edge.label) }
          : {}),
      }));

      await api.patch(
        `/workflows/update-workflow/${workflowId}`,
        {
          nodes: formattedNodes,
          edges: formattedEdges,
        }
      );

      // Execute workflow

      const response = await api.post(
        `/workflows/execute-workflow/${workflowId}/execute`,
        {
          inputData: {
            Marks: marks,
          },
        }
      );

      setExecutionResult(
        response.data?.data ?? response.data
      );

      setShowRunModal(false);

    } catch (error: any) {
      console.error("Workflow execution failed:", error);

      setExecutionError(
        error.response?.data?.message ||
          error.message ||
          "Workflow execution failed."
      );

    } finally {
      setIsExecuting(false);
    }
  };

  // =====================================================
  // 16. UI
  // =====================================================

  return (
    <div className="h-screen bg-[#0b1120] text-white flex flex-col overflow-hidden">

      {/* HEADER */}

      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">

        <div className="flex items-center gap-5">

          <Link
            href="/workflows/all"
            className="text-slate-400 hover:text-white text-sm"
          >
            ← Back
          </Link>

          <div className="h-7 w-px bg-slate-700" />

          <div>
            <h1 className="font-semibold text-sm">
              Untitled Workflow
            </h1>

            <p className="text-xs text-slate-500">
              Workflow Editor
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          <div className="hidden sm:block text-right">

            <p className="text-xs text-slate-400">
              {nodes.length} Nodes · {edges.length} Connections
            </p>

            {saveMessage && (
              <p
                className={`text-xs mt-1 ${
                  saveError
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {saveMessage}
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={handleSaveWorkflow}
            disabled={isSaving || isLoadingWorkflow}
            className="px-4 py-2 text-sm rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50"
          >
            {isLoadingWorkflow
              ? "Loading..."
              : isSaving
                ? "Saving..."
                : "Save"}
          </button>

          <button
            type="button"
            onClick={() => {
              setExecutionError("");
              setExecutionResult(null);
              setShowRunModal(true);
            }}
            disabled={
              isLoadingWorkflow ||
              isSaving ||
              isExecuting
            }
            className="px-5 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▶ Run Workflow
          </button>

        </div>

      </header>

      {/* MAIN EDITOR */}

      <div className="flex flex-1 min-h-0">

        {/* LEFT SIDEBAR */}

        <aside className="w-64 border-r border-slate-800 p-5 shrink-0 overflow-y-auto">

          <h2 className="text-sm font-semibold mb-1">
            Workflow Nodes
          </h2>

          <p className="text-xs text-slate-500 mb-6">
            Drag or click to add nodes
          </p>

          <div className="space-y-3">

            {nodeItems.map((item) => (
              <div
                key={item.title}
                draggable
                onDragStart={(event) =>
                  handleDragStart(event, item)
                }
                onClick={() =>
                  addNodeToCanvas(item)
                }
                className="p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-violet-500 cursor-grab active:cursor-grabbing transition"
              >

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      {item.description}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>

          <div className="mt-8 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">

            <h3 className="text-sm font-medium text-violet-300">
              Quick Tip
            </h3>

            <p className="text-xs text-slate-400 mt-2 leading-5">
              Connect the True and False outputs of a condition to different action nodes.
            </p>

          </div>

        </aside>

        {/* CANVAS */}

        <main
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex-1 min-w-0 min-h-0 relative bg-[#0f172a]"
        >

          <div className="absolute top-4 left-5 z-10 pointer-events-none">

            <h2 className="text-sm font-semibold">
              Canvas
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Design your workflow here
            </p>

          </div>

          <ReactFlow
            style={{
              width: "100%",
              height: "100%",
            }}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            defaultEdgeOptions={{
              animated: true,
              style: {
                stroke: "#8b5cf6",
                strokeWidth: 2,
                strokeDasharray: "2 6",
              },
            }}
            fitView
            nodesDraggable
            nodesConnectable
            elementsSelectable
            deleteKeyCode={["Backspace", "Delete"]}
          >

            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#334155"
            />

            <Controls />

            <MiniMap
              nodeColor="#8b5cf6"
              maskColor="rgba(15, 23, 42, 0.7)"
              className="bg-slate-900 border-slate-700"
            />

          </ReactFlow>

          {isLoadingWorkflow && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0f172a]/80 pointer-events-none">
              <p className="text-sm text-slate-300">
                Loading saved workflow...
              </p>
            </div>
          )}

          {!isLoadingWorkflow && nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

              <div className="text-center">

                <div className="text-4xl mb-3">
                  ＋
                </div>

                <h3 className="text-sm font-medium text-slate-300">
                  Your canvas is empty
                </h3>

                <p className="text-xs text-slate-500 mt-2">
                  Add nodes from the left sidebar to get started.
                </p>

              </div>

            </div>
          )}

        </main>

        {/* RIGHT SIDEBAR */}

        <aside className="w-72 border-l border-slate-800 p-5 shrink-0 overflow-y-auto hidden lg:block">

          <h2 className="text-sm font-semibold">
            Node Settings
          </h2>

          <p className="text-xs text-slate-500 mt-1 mb-6">
            Configure your selected node
          </p>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

            {selectedNode ? (
              <>

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    {selectedNode.data.icon}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">
                      {selectedNode.data.label}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {selectedNode.data.category} Node
                    </p>
                  </div>

                </div>

                <label className="text-xs text-slate-400 block mb-2">
                  Node Name
                </label>

                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(event) =>
                    updateSelectedNodeData(
                      "label",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />

                <p className="text-xs text-slate-500 mt-4">
                  {selectedNode.data.description}
                </p>

                {selectedNode.data.category === "condition" && (
                  <div className="mt-6 border-t border-slate-700 pt-5">

                    <h3 className="text-sm font-semibold mb-5 text-violet-300">
                      Condition Settings
                    </h3>

                    <label className="text-xs text-slate-400 block mb-2">
                      Field
                    </label>

                    <select
                      value={selectedNode.data.field || "Marks"}
                      onChange={(event) =>
                        updateSelectedNodeData(
                          "field",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    >
                      <option value="Marks">Marks</option>
                      <option value="Email">Email</option>
                      <option value="Status">Status</option>
                    </select>

                    <label className="text-xs text-slate-400 block mt-5 mb-2">
                      Operator
                    </label>

                    <select
                      value={
                        selectedNode.data.operator ||
                        "Greater than or equal to"
                      }
                      onChange={(event) =>
                        updateSelectedNodeData(
                          "operator",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    >
                      <option value="Greater than">
                        Greater than (&gt;)
                      </option>

                      <option value="Greater than or equal to">
                        Greater than or equal to (&gt;=)
                      </option>

                      <option value="Less than">
                        Less than (&lt;)
                      </option>

                      <option value="Less than or equal to">
                        Less than or equal to (&lt;=)
                      </option>

                      <option value="Equal to">
                        Equal to (==)
                      </option>

                      <option value="Not equal to">
                        Not equal to (!=)
                      </option>
                    </select>

                    <label className="text-xs text-slate-400 block mt-5 mb-2">
                      Value
                    </label>

                    <input
                      type="text"
                      value={selectedNode.data.value ?? "40"}
                      onChange={(event) =>
                        updateSelectedNodeData(
                          "value",
                          event.target.value
                        )
                      }
                      placeholder="Enter condition value"
                      className={inputClass}
                    />

                    <div className="mt-5 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">

                      <p className="text-xs text-violet-300 font-medium mb-2">
                        Condition Preview
                      </p>

                      <p className="text-sm text-slate-200">
                        {selectedNode.data.field || "Marks"}{" "}
                        {selectedNode.data.operator ||
                          "Greater than or equal to"}{" "}
                        {selectedNode.data.value ?? "40"}
                      </p>

                      <div className="mt-3 flex gap-3 text-xs">

                        <span className="text-emerald-400">
                          ● True
                        </span>

                        <span className="text-red-400">
                          ● False
                        </span>

                      </div>

                    </div>

                  </div>
                )}

                <button
                  type="button"
                  onClick={deleteSelectedNode}
                  className="w-full mt-6 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm"
                >
                  Delete Node
                </button>

              </>
            ) : (
              <p className="text-xs text-slate-400 leading-6">
                Select a node from the canvas to configure its settings.
              </p>
            )}

          </div>

        </aside>

      </div>

      {/* ================================================= */}
      {/* RUN WORKFLOW MODAL */}
      {/* ================================================= */}

      {showRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-start justify-between gap-4">

              <div>
                <h2 className="text-lg font-semibold">
                  Run Workflow
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter input data for your workflow.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRunModal(false)}
                disabled={isExecuting}
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            <label className="mt-6 mb-2 block text-sm text-slate-300">
              Marks
            </label>

            <input
              type="number"
              min="0"
              value={inputMarks}
              onChange={(event) =>
                setInputMarks(event.target.value)
              }
              placeholder="Enter marks (e.g. 50)"
              className={inputClass}
              disabled={isExecuting}
            />

            {executionError && (
              <p className="mt-3 text-sm text-red-400">
                {executionError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowRunModal(false)}
                disabled={isExecuting}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRunWorkflow}
                disabled={
                  isExecuting ||
                  isLoadingWorkflow ||
                  isSaving
                }
                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
              >
                {isExecuting ? "Running..." : "Run"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* EXECUTION RESULT */}
      {/* ================================================= */}

      {executionResult && (
        <div className="fixed bottom-5 right-5 z-40 w-[min(22rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">

          <div className="flex items-center justify-between gap-3">

            <h3 className="font-semibold text-white">
              Execution Result
            </h3>

            <button
              type="button"
              onClick={() => setExecutionResult(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>

          </div>

          <p className="mt-3 text-sm text-emerald-400">
            Status: {String(executionResult.status ?? "received")}
          </p>

          <p className="mt-2 text-sm text-slate-300">
            {executionResult.message ??
              "Workflow execution response received."}
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Input Marks: {inputMarks}
          </p>

          {Array.isArray(executionResult.executedNodes) && (
            <div className="mt-4 space-y-2">

              {executionResult.executedNodes.map(
                (node: any) => (
                  <div
                    key={node.nodeId}
                    className="rounded-lg bg-slate-800 p-3"
                  >

                    <p className="text-sm font-medium text-white">
                      {node.nodeName}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {node.nodeType}
                    </p>

                    <p className="text-xs text-emerald-400 mt-1">
                      {typeof node.result === "object"
                        ? JSON.stringify(node.result)
                        : node.result}
                    </p>

                  </div>
                )
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
