import { Geometry } from 'geojson';

export interface Lindero {
  idLindero: string;
  idPredio: string;
  usuario: string;
  fecha: Date;
  procesado: boolean;
  lado: number;
  distancia: number;
  geometry: Geometry;
  distance: string;
  element: number;
  isDirected: boolean;
  needToClean: boolean;
}
