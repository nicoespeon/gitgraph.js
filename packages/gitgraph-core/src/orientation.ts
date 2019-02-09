// Extracted from `gitgraph.ts` because it caused `utils` tests to fail
// because of circular dependency between `utils` and `template`.
// It's not clear why (the circular dependency still exist) but `Orientation`
// was the only one causing issue. Maybe because it's an enum?

export enum Orientation {
  VerticalReverse = "vertical-reverse",
  Horizontal = "horizontal",
  HorizontalReverse = "horizontal-reverse",
}
