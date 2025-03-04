import { Geometry } from 'geojson';

export interface PredioValue {
  idPredio: string;
  clave: string;
  usuario: string;
  fecha: Date;
  valorTerreno: number;
  sct: number;
  valorConstruccion: number;
  valorCatastral: number;
  geometry: Geometry;
}