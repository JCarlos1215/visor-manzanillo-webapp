/**
 * Interfaz con la estructura del API del visor.
 */
export interface APIResponse<T> {
  /**
   * Datos que genera la respuesta.
   */
  data: T;
  /**
   * Código de estado de la ejecución.
   */
  statusCode: number;
  /**
   * Mensaje de la ejecución.
   */
  message: string;
}
