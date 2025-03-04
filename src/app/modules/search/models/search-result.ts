import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

/**
 * Interfaz con la estructura de datos necesarios para los resultados de la búsqueda.
 */
export interface SearchResult<T> {
  /**
   * Cadena con el tipo de búsqueda.
   */
  type: string;
  /**
   * Cadena con el resultado de la búsqueda que se va a mostrar.
   */
  display: string;
  /**
   * Feature con la geometría referente al resultado de la búsqueda.
   */
  feature: Feature<Geometry>;
  /**
   * Datos referentes a la búsqueda.
   */
  data: T;
}
