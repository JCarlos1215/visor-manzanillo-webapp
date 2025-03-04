/**
 * Interfaz con la estructura de datos para mostrar una propiedad.
 */
interface IdentifyProperty {
  /**
   * Cadena que identifica la propiedad.
   */
  key: string;
  /**
   * Cadena con el valor de la propiedad.
   */
  value: string;
}

/**
 * Interfaz con los datos de una capa identificada.
 */
export interface IdentifyLayer {
  /**
   * Cadena con el nombre de la capa en base de datos.
   */
  name: string;
  /**
   * Identificador de la capa.
   */
  id: string;
  /**
   * Propiedades pertenecientes a la capa {@link IdentifyProperty}.
   */
  properties: Array<IdentifyProperty>;
  /**
   * Geometria de la capa.
   */
  geometry: any;
}
