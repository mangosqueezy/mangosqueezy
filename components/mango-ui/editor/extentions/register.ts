// You can find the list of extensions here: https://tiptap.dev/docs/editor/extensions/functionality

import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

// Add your extensions here
export const extensions = [
	StarterKit,
	Paragraph,
	Document,
	Text,
	Underline,
	Bold,
	Italic,
	Strike,
	Placeholder.configure({ placeholder: "Write something..." }),
	Link.configure({
		openOnClick: false,
		defaultProtocol: "https",
	}),
];
