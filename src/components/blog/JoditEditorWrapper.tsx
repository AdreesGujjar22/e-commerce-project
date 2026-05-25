"use client";

import React, { useRef, useMemo } from "react";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-white border border-gold-200 rounded-xl p-8 text-center text-[#7c633a] text-xs font-mono">
      Initializing premium editor tools...
    </div>
  ),
});

interface JoditEditorWrapperProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function JoditEditorWrapper({
  value,
  onChange,
  placeholder = "Write your chronicle or design narrative here...",
}: JoditEditorWrapperProps) {
  const editor = useRef(null);

  // Configure rich capabilities suitable for publication editors
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder,
      toolbarButtonSize: "middle" as "small" | "middle" | "tiny" | "xsmall" | "large",
      theme: "default",
      enableDragAndDropFileToEditor: true,
      saveModeInCookie: false,
      spellcheck: true,
      editorCssClass: "maison-rich-editor",
      triggerChangeEvent: true,
      height: 400,
      minHeight: 250,
      maxHeight: 1200,
      buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "superscript",
        "subscript",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "table",
        "link",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "fullsize",
      ] as any[],
      showXPathInStatusbar: false,
      showCharsCounter: true,
      showWordsCounter: true,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",
    }),
    [placeholder]
  );

  return (
    <div className="jodit-editor-wrapper text-neutral-900" id="jodit-editor-instance">
      <JoditEditor
        ref={editor}
        value={value}
        config={config as any}
        onBlur={(newContent: string) => onChange(newContent)}
        onChange={(newContent: string) => {
          // Some versions of Jodit trigger onChange repeatedly or have different signatures.
          // By wrapping with onBlur or onChange, we can synchronize carefully.
        }}
      />
    </div>
  );
}
