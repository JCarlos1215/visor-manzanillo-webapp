import { Geometry } from 'geojson';

export interface Fusion {
  idFusion: string;
  json: string;
  user: string;
  fecha: Date;
  tramite: string;
  generado: boolean;
  geometry: Geometry;
}
