import { Geometry as Geojson} from 'geojson';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export interface PredioSICAM {
  idPredio: string;
  clase: number;
  clave: string;
  subpredio: string;
  tipoPredio: string;
  cuenta: number;
  areaCartografica: number;
  areaPadron: number;
  porcentaje: number;
  propietario: string;
  ubicacion: string;
  numExterior: string;
  numInterior: string;
  colonia: string;
  geometry: Geojson;
  feature: Feature<Geometry>;
  isSelected: boolean;
}
