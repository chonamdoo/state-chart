# Render a chart

Mermaid text is the default deliverable; rendering is optional and does not check the model. No rendering platform or renderer installation is a runtime dependency. If the user requests an image, use an already available, authorized renderer. If none is available, give `chart.mmd` in a `mermaid` code block and state that no image was rendered. Never install a renderer automatically.

The pinned upstream rendering recipe uses `pele@1.9.0` ([API](https://pele.run/api)). When that version is already available and its use is authorized, render each displayed `.mmd` to an SVG beside it with the same basename. Pass `{ limit: 1_000_000, outputLimit: 8_000_000, maxEdges: 10_000 }` to `render`; the defaults can be too small for a 500-state chart. On `PeleError`, retain the Mermaid text and report the error. A different available renderer may be used with user authorization; disclose differences in styling or support rather than silently dropping marks.

## Colors and semantic marks

Pele ignores Mermaid `theme` and `themeVariables`; set its `--pele-*` CSS variables on `.pele` ([theming](https://pele.run/theming)). The chart assigns group color classes, `breaks`, `mayBreak`, `bugPath` for shortest bug paths, and `repeats` for states repeated forever in temporal counterexamples. Preserve these meanings and the Legend in the image.

The `.mmd` includes `classDef` for `breaks` and `mayBreak`, but not group colors, `bugPath`, or `repeats`. Pele writes `classDef` colors as inline styles, so the mark rules below need `!important`. Marks override group fills; `bugPath` and `repeats` specify borders. Put the mark rules after group colors. Inspect the resulting image rather than assuming all viewers preserve these classes.

These optional upstream colors can go in a `<style>` element at the start of each SVG so it follows the viewer's light/dark preference:

```css
.pele {
  --pele-bg: #ffffff;
  --pele-fg: #1c1c1c;
  --pele-muted: #656565;
  --pele-line: #808080;
  --pele-surface: #fcfcfc;
  --pele-surface-alt: #f1f1f1;
  --pele-border: #c9c9c9;
}
.pele .blue rect { fill: #c3e0ff; }
.pele .orange rect { fill: #f0d3bf; }
.pele .purple rect { fill: #e3d5ff; }
.pele .yellow rect { fill: #f0dcbf; }
.pele .teal rect { fill: #bfe3df; }
.pele .tan rect { fill: #e5d9ce; }
.pele .pink rect { fill: #ffcbe6; }
.pele .breaks rect {
  fill: #ffecee !important;
  stroke: #e72e3b !important;
  stroke-width: 2.5px !important;
}
.pele .breaks text {
  fill: #cd2834 !important;
}
.pele .mayBreak rect {
  fill: #fff3e6 !important;
  stroke: #e8730c !important;
  stroke-width: 2.5px !important;
}
.pele .mayBreak text {
  fill: #b85a06 !important;
}
.pele .bugPath rect {
  stroke: #1680f3 !important;
  stroke-width: 2.5px !important;
}
.pele .repeats rect {
  stroke: #9b35d6 !important;
  stroke-width: 2.5px !important;
  stroke-dasharray: 6 3;
}
@media (prefers-color-scheme: dark) {
  .pele {
    --pele-bg: #1f1f1f;
    --pele-fg: #f5f5f5;
    --pele-muted: #acacac;
    --pele-line: #939393;
    --pele-surface: #121212;
    --pele-surface-alt: #2c2c2c;
    --pele-border: #4e4e4e;
  }
  .pele .blue rect { fill: #1b3857; }
  .pele .orange rect { fill: #573117; }
  .pele .purple rect { fill: #3c2e57; }
  .pele .yellow rect { fill: #573d17; }
  .pele .teal rect { fill: #174641; }
  .pele .tan rect { fill: #3d3127; }
  .pele .pink rect { fill: #57233e; }
  .pele .breaks rect {
    fill: #2e2021 !important;
    stroke: #cf2b35 !important;
  }
  .pele .breaks text {
    fill: #ff6463 !important;
  }
  .pele .mayBreak rect {
    fill: #2e2619 !important;
    stroke: #d0700f !important;
  }
  .pele .mayBreak text {
    fill: #ffa257 !important;
  }
  .pele .bugPath rect {
    stroke: #116dd2 !important;
  }
  .pele .repeats rect {
    stroke: #9a3fcf !important;
  }
}
```
