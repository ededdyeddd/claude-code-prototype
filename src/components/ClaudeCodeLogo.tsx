export function ClaudeCodeLogo() {
  return (
    <a className="flex items-center">
      <div
        data-cds="ProductLogo"
        className="inline-flex flex-col items-start"
        style={{
          gap: "4px",
        }}
      >
        <span
          className="whitespace-nowrap font-voice leading-none text-primary"
          style={{
            fontSize: "20px",
            fontWeight: "500",
            marginLeft: "-0.1em",
            fontOpticalSizing: "auto",
            fontVariationSettings: '"wght"500',
            fontFeatureSettings: '"ss01","dlig"',
          }}
          data-editable-text="true"
        >
          Claude Code
        </span>
      </div>
    </a>
  );
}
