import { Geometry } from "geojson";
import { PredioFrente } from "./predio-frente";
import { Construction } from "./construction";

export interface Predio {
  idPredio: string;
  clave: string;
  formattedClave: string;
  CURT: string;
  caso: number;
  forma: string;
  sct: number;
  claveManzana: string;
  numeroOficial: string;
  superficieConstruction: number;
  description: string;
  observation: string;
  predio: string;
  frente: PredioFrente[];
  construction: Construction[];
  geometry: Geometry;
  //area: number;
  // Agregar más datos que se tengan del predio
}