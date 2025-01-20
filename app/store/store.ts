import { initialEdges, initialNodes } from "@/app/(businesses)/pipeline/data";
import type {
	AppNode,
	AppState,
} from "@/app/(businesses)/pipeline/types/appNode";
import type { Products } from "@prisma/client";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { create } from "zustand";

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<AppState>((set, get) => ({
	nodes: initialNodes,
	edges: initialEdges,
	onNodesChange: (changes) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});
	},
	onEdgesChange: (changes) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});
	},
	onConnect: (connection) => {
		set({
			edges: addEdge(connection, get().edges),
		});
	},
	setNodes: (nodes) => {
		set({ nodes });
	},
	setEdges: (edges) => {
		set({ edges });
	},
	updateNodeData: (nodeId, value, context = "") => {
		set({
			nodes: get().nodes.map((node) => {
				if (node.id === nodeId) {
					return {
						...node,
						data: {
							...node.data,
							value,
							context,
						},
					};
				}
				return node;
			}) as AppNode[],
		});
	},
	products: null,
	setProducts: (products: Array<Products> | null | undefined) => {
		set({ products });
	},
}));

export default useStore;
