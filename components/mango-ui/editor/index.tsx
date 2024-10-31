"use client";

import "./styles.css";
import {
	type AnyExtension,
	EditorContent,
	type JSONContent,
	useEditor,
} from "@tiptap/react";
import { useEffect } from "react";
import { BubbleMenu } from "./extentions/bubble-menu";
import { extensions } from "./extentions/register";

type EditorProps = {
	content?: string;
	onChange?: (content: JSONContent) => void;
	updateDescription?: (content: string, text: string) => void;
	disabled?: boolean;
};

export function Editor({
	content,
	onChange,
	updateDescription,
	disabled,
}: EditorProps) {
	const editor = useEditor({
		extensions: extensions as AnyExtension[],
		content,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getJSON());
			updateDescription?.(editor.getHTML(), editor.getText());
		},
	});

	useEffect(() => {
		if (content) {
			editor?.commands.setContent(content);
		}
	}, [content, editor]);

	return (
		<>
			<EditorContent
				editor={editor}
				disabled={disabled}
				className="bg-transparent ring-0 ring-white"
			/>
			<BubbleMenu editor={editor} />
		</>
	);
}
