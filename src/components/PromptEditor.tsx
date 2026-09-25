import { useState } from "react";
import type { Ref } from "react";

const DEFAULT_PLACEHOLDER = "Describe a task or ask a question";

const emptyDoc = (placeholder: string) =>
  `<p data-placeholder="${placeholder.replace(/"/g, "&quot;")}" class="is-empty is-editor-empty"><br class="ProseMirror-trailingBreak"></p>`;

/**
 * The prompt field. Its content is owned by the browser (contentEditable), so React renders no children:
 * the document is written once when the element mounts, and `data-doc-empty` tells the design-system CSS
 * to hide the placeholder.
 */
export function PromptEditor({
  placeholder = DEFAULT_PLACEHOLDER,
  initialText,
  onChange,
  onEnter,
  ref,
}: {
  placeholder?: string;
  /** Prefilled draft (demo scenes). */
  initialText?: string;
  onChange?: (text: string) => void;
  onEnter?: () => void;
  ref?: Ref<HTMLDivElement>;
}) {
  const [empty, setEmpty] = useState(!initialText);
  return (
    <div
      ref={(el) => {
        if (el && !el.dataset.ready) {
          el.dataset.ready = "true";
          el.innerHTML = initialText ? `<p>${initialText.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>` : emptyDoc(placeholder);
        }
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      contentEditable="true"
      suppressContentEditableWarning
      role="textbox"
      aria-label="Prompt"
      enterKeyHint="enter"
      data-cds="Editor"
      data-testid="code-prompt-input"
      translate="no"
      className="tiptap ProseMirror"
      data-doc-empty={String(empty)}
      tabIndex={0}
      style={{
        whiteSpace: "break-spaces",
        overflowWrap: "break-word",
      }}
      onInput={(e) => {
        const text = e.currentTarget.innerText.trim();
        setEmpty(!text);
        onChange?.(text);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          onEnter?.();
        }
      }}
    />
  );
}

/** Clears the editor after sending (and lets its onInput update the state). */
export function clearEditor(el: HTMLElement, placeholder = DEFAULT_PLACEHOLDER) {
  el.innerHTML = emptyDoc(placeholder);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
