import { PredioFrente } from "src/app/pages/map/models/predio-frente";
import { AvaluoConstruction } from "./avaluo-construction";
import { AvaluoTerrain } from "./avaluo-terrain";
import { Predio } from "src/app/pages/map/models/predio";
import { AvaluoClaveData } from "./avaluo-clave-data";
import { AvaluoUbicationData } from "./avaluo-ubication-data";
import { AvaluoCorner } from "./avaluo-corner";

export interface AvaluoData {
  predio: Predio;
  clasification: string;
  clave: AvaluoClaveData;
  ubication: AvaluoUbicationData;
  construction: AvaluoConstruction[];
  totalConstruction: number;
  totalConstructionValue: number;
  terrain: AvaluoTerrain[];
  totalTerrainValue: number;
  corner: AvaluoCorner[];
  totalCornerValue: number;
  frente: PredioFrente[];
  totalTerrainCornerValue: number;
  totalValue: number;
}