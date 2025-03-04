/**
 * Interfaz con la estructura de datos para las opciones de gráfica.
 */
export interface GraphOption {
  /**
   * Booleano que indica si esta habilitada la gráfica.
   */
  canGraph: boolean;
  /**
   * Arreglo con opciones de la gráfica para integrar nuevas funciones.
   */
  options: any[];
  hasBar: boolean;
  time: string;
  count: string;
}
