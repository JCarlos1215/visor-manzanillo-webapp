import { Geometry } from "geojson";

export interface EditionObject {
  id: string;
  properties: Property[];
  geometry: Geometry;
}

export interface Property {
  key: string;
  value: string;
}
