import { LayerData } from "./layer-data";

export type LayerGroupContent = LayerData | LayerGroup;

export interface LayerGroup {
  group: string;
  icon: string;
  content: LayerGroupContent[];
}
