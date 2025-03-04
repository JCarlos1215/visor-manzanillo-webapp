import { Geometry } from 'geojson';

export interface Manzana {
  idManzana: string;
  manzana: string;
  clave: string;
  clasificacion: number;
  alfabetico: string;
  geometry: Geometry;
}
