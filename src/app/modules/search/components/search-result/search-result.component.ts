import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchGroup } from '../../models/search-group';
import { SearchResult } from '../../models/search-result';

/**
 * Componente para mostrar resultados de búsqueda.
 * Usado para mostrar los resultados agrupados.
 * ```html
 * <sic-search-result
 *    [searching]="isSearching"
 *    [result]="searchResult"
 *    (selection)="onResultSelected($event)"
 * ></sic-search-result>
 * ```
 */
@Component({
  selector: 'sic-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {
  /**
   * Variable de entrada que contiene el booleano para mostrar barra de progreso.
   */
  @Input() searching: boolean = false;
  /**
   * Variable de entrada que contiene los resultados a mostrar {@link SearchGroup}.
   */
  @Input() result: SearchGroup<any>[] = [];
  /**
   * Evento de salida que envía la geometría del objeto seleccionado.
   */
  @Output() selection = new EventEmitter<any>();

  /**
   * @ignore
   */
  constructor() { }

  /**
   * @ignore
   */
  ngOnInit(): void {
  }

  /**
   * Envia la señal con la geometría del resultado seleccionado.
   * @param evt Resultado seleccionado {@link SearchResult}.
   */
  onSelectResult(evt: SearchResult<any>): void {
    this.selection.emit(evt.feature);
  }
}
