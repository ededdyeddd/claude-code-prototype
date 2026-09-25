import "react";

// Allow CSS custom properties (design tokens) in inline style objects.
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
