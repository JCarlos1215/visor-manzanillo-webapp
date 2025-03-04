import { Geometry } from 'geojson';

export interface Sector {
  idSector: string;
  estado: string;
  region: string;
  municipio: string;
  zona: string;
  localidad: string;
  sector: string;
  claveINEGI: string;
  geometry: Geometry;
}
