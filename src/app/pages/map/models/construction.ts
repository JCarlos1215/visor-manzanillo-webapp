import { Geometry } from 'geojson';

export interface Construction {
  idConstruccion: string;
  bloque: string;
  niveles: number;
  codigoEdificacion: string;
  fechaConstruccion: Date;
  tipo: string;
  datoEdificacion: string;
  clasificacion: string;
  cuenta: string;
  status: number;
  claveManzana: string;
  idPredio: string;
  sc: number;
  geometry: Geometry;
}
