
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { DragEvent, MouseEvent } from "react";

import api from "@/lib/api";

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

// -----------------------------------------
// 1. TYPES
// -----------------------------------------

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

// -----------------------------------------
// 2. INITIAL DATA
// -----------------------------------------

const initialNodes: WorkflowNode[] = [];
const initialEdges: Edge[] = [];

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

// -----------------------------------------
// 3. PARENT COMPONENT
// -----------------------------------------

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

// -----------------------------------------
// 4. MAIN EDITOR COMPONENT
// -----------------------------------------

function WorkflowEditorContent() {
  // Get workflow ID from URL
  const params = useParams<{ id: string }>();
  const workflowId = params.id;

  // Canvas reference
  const canvasRef = useRef<HTMLDivElement>(null);

  // React Flow instance
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Nodes state
  const [nodes, setNodes] =
    useState<WorkflowNode[]>(initialNodes);

  // Edges state
  const [edges, setEdges] =
    useState<Edge[]>(initialEdges);

  // Selected node
  const [selectedNode, setSelectedNode] =
    useState<WorkflowNode | null>(null);

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState(false);

  // Loading state
  const [isLoadingWorkflow, setIsLoadingWorkflow] =
    useState(true);

  // -----------------------------------------
  // 5. LOAD WORKFLOW FROM BACKEND
  // -----------------------------------------

  useEffect(() => {
    let isMounted = true;

    const loadWorkflow = async () => {
      if (!workflowId || workflowId === "undefined") {
        setIsLoadingWorkflow(false);
        setSaveError(true);
        setSaveMessage("Workflow ID is missing.");
        return;
      }

      try {
        setIsLoadingWorkflow(true);

        const response = await api.get(
          `/workflows/get-singleWorkflow/${workflowId}`
        );

        // Get workflow from API response
        const responseData = response.data?.data;

        const workflow =
          responseData?.workflow ?? responseData;

        if (
          !workflow ||
          !Array.isArray(workflow.nodes) ||
          !Array.isArray(workflow.edges)
        ) {
          throw new Error(
            "Invalid workflow response from server."
          );
        }

        // Restore saved nodes
        const restoredNodes: WorkflowNode[] =
          workflow.nodes.map((savedNode: any) => {
            const category =
              savedNode.data?.category ?? savedNode.type;

            const border =
              category === "trigger"
                ? "#3b82f6"
                : category === "condition"
                  ? "#8b5cf6"
                  : "#10b981";

            return {
              id: savedNode.id,
              type: "default",

              position: savedNode.position,

              data: {
                ...savedNode.data,

                category,

                label:
                  savedNode.data?.label ??
                  (category === "trigger"
                    ? "Manual Trigger"
                    : category === "condition"
                      ? "Condition"
                      : "Action"),

                icon:
                  savedNode.data?.icon ??
                  (category === "trigger"
                    ? "⚡"
                    : category === "condition"
                      ? "◇"
                      : "✉"),

                description:
                  savedNode.data?.description ?? "",
              },

              style: {
                background: "#1e293b",
                color: "#ffffff",
                border: `1px solid ${border}`,
                borderRadius: "12px",
                padding: "14px",
                width: 190,
              },
            };
          });

        // Restore saved edges
        const restoredEdges: Edge[] =
          workflow.edges.map(
            (savedEdge: any, index: number) => ({
              id: savedEdge.id ?? `edge-${index}`,
              source: savedEdge.source,
              target: savedEdge.target,

              ...(savedEdge.label
                ? { label: savedEdge.label }
                : {}),

              animated: true,

              style: {
                stroke: "#8b5cf6",
                strokeWidth: 2,
                strokeDasharray: "2 6",
                strokeLinecap: "round",
              },
            })
          );

        if (isMounted) {
          setNodes(restoredNodes);
          setEdges(restoredEdges);
          setSelectedNode(null);
          setSaveMessage("");
          setSaveError(false);

          console.log("Workflow loaded:", workflow);
        }
      } catch (error) {
        console.error(
          "Workflow loading failed:",
          error
        );

        if (isMounted) {
          setSaveError(true);
          setSaveMessage(
            "Could not load workflow. Please refresh or try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingWorkflow(false);
        }
      }
    };

    loadWorkflow();

    return () => {
      isMounted = false;
    };
  }, [workflowId]);

  // -----------------------------------------
  // 6. ADD NODE
  // -----------------------------------------

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
      position ||
      reactFlowInstance.screenToFlowPosition({
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      });

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: "default",
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

      style: {
        background: "#1e293b",
        color: "#ffffff",
        border: `1px solid ${item.border}`,
        borderRadius: "12px",
        padding: "14px",
        width: 190,
      },
    };

    setNodes((oldNodes) => [
      ...oldNodes,
      newNode,
    ]);

    setSelectedNode(newNode);
    setSaveMessage("");
  };

  // -----------------------------------------
  // 7. DRAG START
  // -----------------------------------------

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

  // -----------------------------------------
  // 8. DRAG OVER
  // -----------------------------------------

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // -----------------------------------------
  // 9. DROP NODE ON CANVAS
  // -----------------------------------------

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

  // -----------------------------------------
  // 10. NODE CHANGES
  // -----------------------------------------

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

  // -----------------------------------------
  // 11. EDGE CHANGES
  // -----------------------------------------

  const handleEdgesChange = (
    changes: EdgeChange[]
  ) => {
    setEdges((oldEdges) =>
      applyEdgeChanges(changes, oldEdges)
    );
  };

  // -----------------------------------------
  // 12. CONNECT NODES
  // -----------------------------------------

  const handleConnect = (params: Connection) => {
    setEdges((oldEdges) =>
      addEdge(
        {
          ...params,
          animated: true,

          style: {
            stroke: "#8b5cf6",
            strokeWidth: 2,
            strokeDasharray: "2 6",
            strokeLinecap: "round",
          },
        },
        oldEdges
      )
    );

    setSaveMessage("");
  };

  // -----------------------------------------
  // 13. SELECT NODE
  // -----------------------------------------

  const handleNodeClick = (
    _event: MouseEvent,
    node: WorkflowNode
  ) => {
    setSelectedNode(node);
  };

  // -----------------------------------------
  // 14. UPDATE NODE DATA
  // -----------------------------------------

  const updateSelectedNodeData = (
    key: keyof WorkflowNodeData,
    value: string
  ) => {
    if (!selectedNode) return;

    setNodes((oldNodes) =>
      oldNodes.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,

            data: {
              ...node.data,
              [key]: value,
            },
          };
        }

        return node;
      })
    );

    setSelectedNode((oldNode) => {
      if (!oldNode) return null;

      return {
        ...oldNode,

        data: {
          ...oldNode.data,
          [key]: value,
        },
      };
    });

    setSaveMessage("");
  };

  // -----------------------------------------
  // 15. DELETE NODE
  // -----------------------------------------

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

  // -----------------------------------------
  // 16. SAVE WORKFLOW API
  // -----------------------------------------

  const handleSaveWorkflow = async () => {
    if (isLoadingWorkflow) return;

    if (
      !workflowId ||
      workflowId === "undefined"
    ) {
      setSaveError(true);
      setSaveMessage("Workflow ID is missing.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");
      setSaveError(false);

      // Convert nodes into backend format
      const formattedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.category,
        position: node.position,
        data: node.data,
      }));

      // Convert edges into backend format
      const formattedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,

        ...(edge.label
          ? { label: String(edge.label) }
          : {}),
      }));

      // Send PATCH request
      const response = await api.patch(
        `/workflows/update-workflow/${workflowId}`,
        {
          nodes: formattedNodes,
          edges: formattedEdges,
        }
      );

      console.log(
        "Workflow saved:",
        response.data
      );

      setSaveMessage(
        "All changes saved successfully!"
      );

      setSaveError(false);
    } catch (error) {
      console.error(
        "Workflow save failed:",
        error
      );

      setSaveMessage(
        "Failed to save workflow. Please try again."
      );

      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------------------
  // 17. UI
  // -----------------------------------------

  return (
    <div className="h-screen bg-[#0b1120] text-white flex flex-col overflow-hidden">

      {/* TOP NAVBAR */}

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
            className="px-4 py-2 text-sm rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingWorkflow
              ? "Loading..."
              : isSaving
                ? "Saving..."
                : "Save"}
          </button>

          <button
            type="button"
            className="px-5 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-700 font-medium"
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
              Drag nodes onto the canvas and connect them to create your workflow.
            </p>

          </div>

        </aside>

        {/* CENTER CANVAS */}

        <main
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex-1 min-w-0 min-h-0 h-full relative bg-[#0f172a]"
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
                strokeLinecap: "round",
              },
            }}
            fitView
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
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

          {/* LOADING OVERLAY */}

          {isLoadingWorkflow && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0f172a]/80 pointer-events-none">

              <p className="text-sm text-slate-300">
                Loading saved workflow...
              </p>

            </div>
          )}

          {/* EMPTY CANVAS MESSAGE */}

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

                {/* SELECTED NODE */}

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

                {/* NODE NAME */}

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

                {/* CONDITION SETTINGS */}

                {selectedNode.data.category === "condition" && (
                  <div className="mt-6 border-t border-slate-700 pt-5">

                    <h3 className="text-sm font-semibold mb-5 text-violet-300">
                      Condition Settings
                    </h3>

                    {/* FIELD */}

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
                      <option value="Marks">
                        Marks
                      </option>

                      <option value="Email">
                        Email
                      </option>

                      <option value="Status">
                        Status
                      </option>
                    </select>

                    {/* OPERATOR */}

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

                    {/* VALUE */}

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

                    {/* CONDITION PREVIEW */}

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

                    </div>

                  </div>
                )}

                {/* DELETE NODE */}

                <button
                  type="button"
                  onClick={deleteSelectedNode}
                  className="w-full mt-6 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm"
                >
                  Delete Node
                </button>

              </>
            ) : (
              <>

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    ◇
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">
                      No Node Selected
                    </h3>

                    <p className="text-xs text-slate-500">
                      Node Configuration
                    </p>
                  </div>

                </div>

                <p className="text-xs text-slate-400 leading-6">
                  Select a node from the canvas to configure its settings.
                </p>

              </>
            )}

          </div>

        </aside>

      </div>

    </div>
  );
}
