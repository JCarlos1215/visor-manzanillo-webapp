import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';

/**
 * Clase que hereda de MatPaginatorIntl para sobreescribir los metodos del paginador de Material Angular.
 */
@Injectable({
  providedIn: 'root',
})
export class CustomPaginator extends MatPaginatorIntl {
  /**
   * Sobre escribe el valor de la cadena que representa de primera página.
   */
  override firstPageLabel!: 'Primera página';
  /**
   * Sobre escribe el valor de la cadena que representa de última página.
   */
  override lastPageLabel!: 'Última página';
  /**
   * Sobre escribe el valor de la cadena que representa los elementos por página.
   */
  override itemsPerPageLabel = 'Elementos por página';
  /**
   * Sobre escribe el valor de la cadena que representa la siguiente página.
   */
  override nextPageLabel = 'Siguiente';
  /**
   * Sobre escribe el valor de la cadena que representa la página anterior.
   */
  override previousPageLabel = 'Anterior';

  /**
   * Metodo que obtiene las etiquetas para el rango de página.
   * @param page Número de página actual.
   * @param pageSize Tamaño de elementos por página
   * @param length Total de elementos.
   * @returns {string} Cadena resultante para poner de etiqueta en el rango de páginas.
   */
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
}
