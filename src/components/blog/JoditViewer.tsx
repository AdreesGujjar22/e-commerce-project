"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";

// Force load JoditEditor dynamically as it requires window/document objects
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <div className="animate-pulse text-[#7c633a] text-xs py-4 font-mono">Loading publication text...</div>,
});

interface JoditViewerProps {
  content: string;
}

export default function JoditViewer({ content }: JoditViewerProps) {
  const editor = useRef(null);

  // Configuration options to set Jodit editor to a clean read-only display canvas
  const config = {
    readonly: true,
    toolbar: false,
    showXPathInStatusbar: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showNavigation: false,
    height: "auto",
    minHeight: 150,
    maxHeight: "none",
    disabled: true,
    style: {
      border: "none",
      background: "transparent"
    }
  };

  return (
    <div className="jodit-viewer-container" id="jodit-article-content">
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        onBlur={() => {}}
        onChange={() => {}}
      />
    </div>
  );
}
