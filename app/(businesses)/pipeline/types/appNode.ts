import type {
	BuiltInNode,
	Edge,
	Node,
	OnConnect,
	OnEdgesChange,
	OnNodesChange,
} from "@xyflow/react";

import type { Products } from "@prisma/client";

export type InputNode = Node<
	{
		value: string;
		label: string;
	},
	"inputProduct"
>;

export type AffiliatesNode = Node<
	{
		value: string;
		label: string;
	},
	"inputAffiliate"
>;

export type AskAINode = Node<
	{
		value: string;
		context?: string;
		label: string;
	},
	"inputAskAI"
>;

export type AppNode = BuiltInNode | InputNode | AffiliatesNode | AskAINode;

export type AppState = {
	nodes: AppNode[];
	edges: Edge[];
	onNodesChange: OnNodesChange<AppNode>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	setNodes: (nodes: AppNode[]) => void;
	setEdges: (edges: Edge[]) => void;
	updateNodeData: (nodeId: string, value: string, context?: string) => void;
	products: Array<Products> | null | undefined;
	setProducts: (products: Array<Products> | null | undefined) => void;
};
