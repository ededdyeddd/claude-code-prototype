export function PromptEditor({ placeholder = "Describe a task or ask a question" }: { placeholder?: string }) {
  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning
      role="textbox"
      enterKeyHint="enter"
      data-cds="Editor"
      data-testid="code-prompt-input"
      translate="no"
      className="tiptap ProseMirror"
      data-doc-empty="true"
      tabIndex={0}
      style={{
        whiteSpace: "break-spaces",
        overflowWrap: "break-word",
      }}
    >
      <p data-placeholder={placeholder} className="is-empty is-editor-empty">
        <br className="ProseMirror-trailingBreak" />
      </p>
    </div>
  );
}
