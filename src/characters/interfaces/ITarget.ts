export interface ITarget {
  belong: "self" | "opponent";
  markAsCovered(isCovered: boolean): void;
}
