import { Geometry } from 'geojson';

export interface PredioFrente {
  idPredioFrente: string;
  idPredio: string;
  idRedVial: string;
  calle: string;
  medida: number;
  claveCalle: string;
  claveMunicipio: string;
  loteTipo: string;
  valorCalle: number;
  valorZona: number;
  numero: number;
  adyacencia: boolean;
  idNext: string;
  orden: number;
  year: number;
  geometry: Geometry;
  // Agregar más datos que se tengan del predio frente
}
