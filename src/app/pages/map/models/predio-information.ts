import { Geometry } from 'geojson';

export interface PredioInformation {
  idPredio: string;
  clase: number;
  clave: string;
  formattedClave: string;
  subpredio: string;
  tipo: string;
  cuenta: string;
  areaCartografica: number;
  areaPadron: number;
  porcentaje: number;
  propietario: string;
  ubicacion: string;
  numeroExterior: string;
  numeroInterior: string;
  colonia: string;
  geometry: Geometry;
}
