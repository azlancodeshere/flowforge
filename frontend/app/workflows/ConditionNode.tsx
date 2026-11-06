
"use client";

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

type ConditionNodeData = {
  label: string;
  icon: string;
  category: "condition";
  description: string;
  field?: string;
  operator?: string;
  value?: string;
};

type ConditionNodeType = Node<ConditionNodeData>;

export default function ConditionNode({
  data,
  selected,
}: NodeProps<ConditionNodeType>) {
  return (
    <div
      className={`relative min-w-[190px] rounded-xl border bg-slate-800 px-4 py-4 text-white shadow-lg ${
        selected
          ? "border-violet-400 ring-2 ring-violet-500/30"
          : "border-violet-500"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-violet-500"
      />

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-xl">
          ◇
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            {data.label || "Condition"}
          </h3>

          <p className="text-xs text-slate-400">
            {data.field || "Marks"}{" "}
            {data.operator || "Greater than or equal to"}{" "}
            {data.value ?? "40"}
          </p>
        </div>
      </div>

      <div className="absolute -right-[65px] top-[35%] flex items-center gap-2">
        <span className="text-xs font-semibold text-emerald-400">
          True
        </span>

        <Handle
          type="source"
          position={Position.Right}
          id="true"
          className="!h-3 !w-3 !border-2 !border-white !bg-emerald-500"
        />
      </div>

      <div className="absolute -right-[65px] top-[70%] flex items-center gap-2">
        <span className="text-xs font-semibold text-red-400">
          False
        </span>

        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="!h-3 !w-3 !border-2 !border-white !bg-red-500"
        />
      </div>
    </div>
  );
}
