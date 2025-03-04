import { Geometry } from 'geojson';

export interface AvaluoConstruction {
  idPredio: string;
  clave: string;
  cuenta: string;
  bloque: string;
  nivel: number;
  ce: string;
  volado: string;
  valorUnitario: number;
  valorUnitarioIncrementado: number;
  sc: number;
  valor: number;
  numero: number;
  geometry: Geometry;
}
