import { IdentifyLayer } from "./identify-layer";

/**
 * Interfaz con la estructura de datos necesarios para identifica.
 */
export interface IdentifyData {
  /**
   * Nombre de la capa en la tabla de contenido.
   */
  name: string;
  /**
   * Capas que contienen los datos del identifica {@link IdentifyLayer}.
   */
  layers: Array<IdentifyLayer>;
}
