import { SearchResult } from "./search-result";

/**
 * Interfaz con la estructura de datos necesarios para agrupar los tipos de resultados de las búsquedas.
 */
export interface SearchGroup<T> {
  /**
   * Cadena con lo el término buscado.
   */
  term: string;
  /**
   * Cadena con el nombre del grupo que engloba los resultados.
   */
  group: string;
  /**
   * Booleano que indica si se esta mostrando la búsqueda u ocultando como resumen.
   */
  status: boolean;
  /**
   * Número con el total de resultados que contiene el grupo.
   */
  total: number;
  /**
   * Contiene toda la información de las búsquedas del grupo {@link SearchResult}.
   */
  content: SearchResult<T>[];
}
