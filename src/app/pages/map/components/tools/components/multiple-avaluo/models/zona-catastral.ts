import { Geometry } from 'geojson';

export interface ZonaCatastral {
  idZonaCatastral: string;
  zona: string;
  nombre: string;
  geometry: Geometry;
}
