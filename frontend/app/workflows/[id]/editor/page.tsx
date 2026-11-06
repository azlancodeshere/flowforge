
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { DragEvent, MouseEvent } from "react";

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

// ---------------- TYPES ----------------

type WorkflowNodeData = {
  label: string;
  icon: string;
  category: string;
  description: string;
  field?: string;
  operator?: string;
  value?: string;
};

type WorkflowNode = Node<WorkflowNodeData>;

type NodeItem = {
  category: string;
  icon: string;
  title: string;
  description: string;
  border: string;
};

// ---------------- INITIAL DATA ----------------

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

export default function WorkflowEditorPage() {
  // Canvas reference
  const canvasRef = useRef<HTMLDivElement>(null);

  // React Flow instance
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Nodes state
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);

  // Edges state
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Selected node state
  const [selectedNode, setSelectedNode] =
    useState<WorkflowNode | null>(null);

  // ---------------- ADD NODE ----------------

  const addNodeToCanvas = (
    item: NodeItem,
    position?: { x: number; y: number }
  ) => {
    if (!reactFlowInstance || !canvasRef.current) return;

    const bounds = canvasRef.current.getBoundingClientRect();

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

        // Default condition settings
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

    setNodes((oldNodes) => [...oldNodes, newNode]);
    setSelectedNode(newNode);
  };

  // ---------------- DRAG AND DROP ----------------

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    item: NodeItem
  ) => {
    event.dataTransfer.setData("nodeTitle", item.title);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!reactFlowInstance) return;

    const title = event.dataTransfer.getData("nodeTitle");
    const item = nodeItems.find((node) => node.title === title);

    if (!item) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addNodeToCanvas(item, position);
  };

  // ---------------- NODE AND EDGE CHANGES ----------------

  const handleNodesChange = (changes: NodeChange<WorkflowNode>[]) => {
    setNodes((oldNodes) =>
      applyNodeChanges(changes, oldNodes) as WorkflowNode[]
    );
  };

  const handleEdgesChange = (changes: EdgeChange[]) => {
    setEdges((oldEdges) =>
      applyEdgeChanges(changes, oldEdges)
    );
  };

  // ---------------- CONNECT NODES ----------------

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
  };

  // ---------------- SELECT NODE ----------------

  const handleNodeClick = (
    _event: MouseEvent,
    node: WorkflowNode
  ) => {
    setSelectedNode(node);
  };

  // ---------------- UPDATE NODE DATA ----------------

  const updateSelectedNodeData = (
    key: keyof WorkflowNodeData,
    value: string
  ) => {
    if (!selectedNode) return;

    // Update canvas node
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

    // Update selected node
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
  };

  // ---------------- DELETE NODE ----------------

  const deleteSelectedNode = () => {
    if (!selectedNode) return;

    setNodes((oldNodes) =>
      oldNodes.filter((node) => node.id !== selectedNode.id)
    );

    setEdges((oldEdges) =>
      oldEdges.filter(
        (edge) =>
          edge.source !== selectedNode.id &&
          edge.target !== selectedNode.id
      )
    );

    setSelectedNode(null);
  };

  // ---------------- UI ----------------

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

          <span className="text-xs text-slate-500 hidden sm:block">
            {nodes.length} Nodes · {edges.length} Connections
          </span>

          <button
            type="button"
            className="px-4 py-2 text-sm rounded-lg border border-slate-700 hover:bg-slate-800"
          >
            Save
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
                onClick={() => addNodeToCanvas(item)}
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
          className="flex-1 min-w-0 relative bg-[#0f172a]"
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

          {/* EMPTY CANVAS */}

          {nodes.length === 0 && (

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

                {/* SELECTED NODE HEADER */}

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
                      <option value="Marks">Marks</option>
                      <option value="Email">Email</option>
                      <option value="Status">Status</option>
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
