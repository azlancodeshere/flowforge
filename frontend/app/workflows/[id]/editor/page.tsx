
"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    addEdge,
} from "@xyflow/react";

import type {
    Node,
    Edge,
    Connection,
    ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";


type WorkflowNodeData = {
    label: string;
    icon: string;
    category: string;
    description: string;
};

type WorkflowNode = Node<WorkflowNodeData>;

// Initially empty canvas
const initialNodes: WorkflowNode[] = [];
const initialEdges: Edge[] = [];

// Available nodes
const nodeItems = [
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

export default function WorkflowEditorPage() {
    const canvasRef = useRef<HTMLDivElement>(null);

    const [reactFlowInstance, setReactFlowInstance] =
        useState<ReactFlowInstance<WorkflowNode, Edge> | null>(null);

    const [nodes, setNodes, onNodesChange] =
        useNodesState<WorkflowNode>(initialNodes);

    const [edges, setEdges, onEdgesChange] =
        useEdgesState(initialEdges);

    const [selectedNode, setSelectedNode] =
        useState<WorkflowNode | null>(null);

    // Create a node
    const addNodeToCanvas = useCallback(
        (
            item: (typeof nodeItems)[number],
            position?: { x: number; y: number }
        ) => {
            if (!reactFlowInstance || !canvasRef.current) return;

            const bounds = canvasRef.current.getBoundingClientRect();

            const nodePosition =
                position ??
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

            setNodes((currentNodes: Node[]) => [...currentNodes, newNode]);
            setSelectedNode(newNode);
        },
        [reactFlowInstance, setNodes]
    );

    // Drag node from sidebar
    const onDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        item: (typeof nodeItems)[number]
    ) => {
        event.dataTransfer.setData(
            "application/reactflow",
            item.category
        );

        event.dataTransfer.effectAllowed = "move";
    };

    // Allow dropping on canvas
    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    // Drop node on canvas
    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (!reactFlowInstance || !canvasRef.current) return;

        const category = event.dataTransfer.getData(
            "application/reactflow"
        );

        const item = nodeItems.find(
            (node) => node.category === category &&
                (category !== "action" || node.title === event.dataTransfer.getData("nodeTitle"))
        );

        if (!item) return;

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        addNodeToCanvas(item, position);
    };

    // Connect nodes
    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((currentEdges: Edge[]) =>
                addEdge(
                    {
                        ...params,
                        animated: true,
                    },
                    currentEdges
                )
            );
        },
        [setEdges]
    );

    // Select node
    const onNodeClick = useCallback(
        (_event: React.MouseEvent, node: WorkflowNode) => {
            setSelectedNode(node);
        },
        []
    );

    // Update selected node label
    const updateNodeLabel = (value: string) => {
        if (!selectedNode) return;

        setNodes((currentNodes: Node[]) =>
            currentNodes.map((node) =>
                node.id === selectedNode.id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            label: value,
                        },
                    }
                    : node
            )
        );

        setSelectedNode((current) =>
            current
                ? {
                    ...current,
                    data: {
                        ...current.data,
                        label: value,
                    },
                }
                : null
        );
    };

    return (
        <div className="h-screen bg-[#0b1120] text-white flex flex-col overflow-hidden">

            {/* Top Navbar */}
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

            {/* Main Editor */}
            <div className="flex flex-1 min-h-0">

                {/* Left Sidebar */}
                <aside className="w-64 border-r border-slate-800 p-5 shrink-0 overflow-y-auto">

                    <h2 className="text-sm font-semibold mb-1">
                        Workflow Nodes
                    </h2>

                    <p className="text-xs text-slate-500 mb-6">
                        Drag or click to add nodes
                    </p>

                    <div className="space-y-3">

                        {nodeItems.map((node) => (
                            <div
                                key={node.title}
                                draggable
                                onDragStart={(event) => {
                                    event.dataTransfer.setData(
                                        "application/reactflow",
                                        node.category
                                    );

                                    event.dataTransfer.setData(
                                        "nodeTitle",
                                        node.title
                                    );

                                    event.dataTransfer.effectAllowed = "move";
                                }}
                                onClick={() => addNodeToCanvas(node)}
                                className="p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-violet-500 cursor-grab active:cursor-grabbing transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                                        {node.icon}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium">
                                            {node.title}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            {node.description}
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

                {/* Center Canvas */}
                <main
                    ref={canvasRef}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
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
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        defaultEdgeOptions={{
                            animated: true,
                            style: { stroke: "#8b5cf6" },
                            strokeWidth: 2,
                            strokeDasharray: "2 6",
                            strokeLinecap: "round",
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

                    {/* Empty Canvas Message */}
                    {nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <div className="text-4xl mb-3">＋</div>

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

                {/* Right Sidebar */}
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
                                        updateNodeLabel(event.target.value)
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
                                />

                                <p className="text-xs text-slate-500 mt-4">
                                    {selectedNode.data.description}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setNodes((currentNodes: Node[]) =>
                                            currentNodes.filter(
                                                (node) => node.id !== selectedNode.id
                                            )
                                        );

                                        setEdges((currentEdges: Edge[]) =>
                                            currentEdges.filter(
                                                (edge) =>
                                                    edge.source !== selectedNode.id &&
                                                    edge.target !== selectedNode.id
                                            )
                                        );

                                        setSelectedNode(null);
                                    }}
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
