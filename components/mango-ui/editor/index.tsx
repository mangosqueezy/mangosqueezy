"use client";

import {
	type AnyExtension,
	EditorContent,
	type JSONContent,
	useEditor,
} from "@tiptap/react";
import { BubbleMenu } from "./extentions/bubble-menu";
import { extensions } from "./extentions/register";

type EditorProps = {
	content?: string;
	onChange?: (content: JSONContent) => void;
};

export function Editor({ content, onChange }: EditorProps) {
	const editor = useEditor({
		extensions: extensions as AnyExtension[],
		content,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getJSON());
		},
	});

	return (
		<>
			<EditorContent editor={editor} />
			<BubbleMenu editor={editor} />
		</>
	);
}
