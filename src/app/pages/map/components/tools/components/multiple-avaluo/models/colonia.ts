import { Geometry } from 'geojson';

export interface Colonia {
  idColonia: string;
  nombre: string;
  codigopostal: number;
  idtipoasentamiento: string;
  geometry: Geometry;
}
