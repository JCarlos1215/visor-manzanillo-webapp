import { Geometry } from 'geojson';

export interface Paralela {
  idParalela: string;
  idLindero: string;
  idPredio: string;
  lado: number;
  distancia: number;
  user: string;
  fecha: Date;
  geometry: Geometry;

  distance: string;
  element: number;
  isDirected: boolean;
  needToClean: boolean;
}
