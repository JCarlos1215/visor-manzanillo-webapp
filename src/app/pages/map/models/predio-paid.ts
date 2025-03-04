import { Geometry } from "geojson";

export interface PredioPaid {
  idPredio: string;
  colonia: string;
  manzana: string;
  predioType: string;
  cuenta: number;
  claveCatastral: string;
  formattedClave: string;
  ubicacion: string;
  numberExterior: string;
  folio: number;
  totalPago: number;
  fecha: Date;
  hora: string;
  predioGeometry: Geometry;
  colonyGeometry: Geometry;
}
