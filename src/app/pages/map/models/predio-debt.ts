import { Geometry } from "geojson";

export interface PredioDebt {
  idPredio: string;
  colonia: string;
  manzana: string;
  predioType: string;
  cuenta: number;
  claveCatastral: string;
  formattedClave: string;
  ubicacion: string;
  numberExterior: string;
  saldo: number;
  predioGeometry: Geometry;
  colonyGeometry: Geometry;
}
