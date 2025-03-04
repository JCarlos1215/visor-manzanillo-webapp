import { GraphOption } from "./graph-option";
import { RefreshOption } from "./refresh-option";

/**
 * Declaración de tipo LayerID como cadena.
 */
export type LayerID = string;

/**
 * Interfaz con la estructura de datos de una capa.
 */
export interface LayerData {
  /**
   * Identificador de la capa {@link LayerID}.
   */
  id: LayerID;
  /**
   * Cadena con el título de la capa.
   */
  title: string;
  /**
   * Tipo de capa soportada.
   */
  type: 'TILE' | 'WMTS' | 'IMAGE' | 'VECTORTILE' | 'XYZ';
  /**
   * Cadena con el servidor donde se aloja la capa.
   */
  server: string;
  /**
   * Cadena con el nombre de servicio de la capa.
   */
  service: string;
  /**
   * Cadena con la url que genera la simbología de la capa.
   */
  legend: string;
  /**
   * Cadena con la atribución de la capa.
   */
  attribution: string;
  /**
   * Booleano que indica si la capa es visible desde inicio del visor.
   */
  isVisible: boolean;
  /**
   * Numero real de 0 a 1 que indica el grado de opacidad en que se carga la capa al encenderla.
   */
  opacity: number;
  /**
   * Booleano que indica si en la capa se puede usar la herramienta identifica.
   */
  hasIdentify: boolean;
  /**
   * Número que indica la profundidad en que se carga la capa respecto a otras.
   */
  zIndex: number;
  /**
   * Cadena con las opciones de la capa cuando se utiliza el tipo WTMS.
   */
  options: string;
  /**
   * Objeto con las opciones para gráficar la capa {@link GraphOption}.
   */
  color: string;
  graphOptions: GraphOption;
  refreshOption: RefreshOption;
}
