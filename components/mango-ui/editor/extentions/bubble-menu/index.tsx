import { type Editor, BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import { useState } from "react";
import {
	MdOutlineFormatBold,
	MdOutlineFormatItalic,
	MdOutlineFormatStrikethrough,
} from "react-icons/md";
import type { Props as TippyOptions } from "tippy.js";
import { AIMenu } from "../ai";
import { AskAI } from "../ai/ask-ai";
import { BubbleMenuItem } from "./bubble-item";

export function BubbleMenu({
	editor,
	tippyOptions,
}: {
	editor: Editor | null;
	tippyOptions?: TippyOptions;
}) {
	const [showAI, setShowAI] = useState(false);

	if (!editor) {
		return null;
	}

	return (
		<TiptapBubbleMenu
			editor={editor}
			tippyOptions={tippyOptions}
			className="bg-transparent ring-0 ring-white"
		>
			<div className="flex w-fit max-w-[90vw] overflow-hidden rounded-full border border-border bg-orange-50 text-gray-600 ring-1 ring-orange-600 text-mono font-regular">
				{showAI ? (
					<AIMenu onOpenChange={setShowAI} editor={editor} />
				) : (
					<>
						<AskAI onSelect={() => setShowAI(true)} />
						<BubbleMenuItem
							editor={editor}
							action={() => editor.chain().focus().toggleBold().run()}
							isActive={editor.isActive("bold")}
						>
							<MdOutlineFormatBold className="size-4" />
							<span className="sr-only">Bold</span>
						</BubbleMenuItem>
						<BubbleMenuItem
							editor={editor}
							action={() => editor.chain().focus().toggleItalic().run()}
							isActive={editor.isActive("italic")}
						>
							<MdOutlineFormatItalic className="size-4" />
							<span className="sr-only">Italic</span>
						</BubbleMenuItem>
						<BubbleMenuItem
							editor={editor}
							action={() => editor.chain().focus().toggleStrike().run()}
							isActive={editor.isActive("strike")}
						>
							<MdOutlineFormatStrikethrough className="size-4" />
							<span className="sr-only">Strike</span>
						</BubbleMenuItem>
					</>
				)}
			</div>
		</TiptapBubbleMenu>
	);
}
