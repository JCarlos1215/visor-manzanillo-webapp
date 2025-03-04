import { Geometry } from 'geojson';

export interface Division {
  idDivision: string;
  lineJSON: string;
  idGeometry: string;
  user: string;
  fecha: Date;
  tramite: string;
  generado: boolean;
  geometry: Geometry;
}
