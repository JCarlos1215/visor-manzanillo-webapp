import { Geometry } from 'geojson';

export interface NumeroExterior {
  numero: string;
  idNumeroExterior: string;
  status: number;
  geometry: Geometry;
}
