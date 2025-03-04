import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';

/**
 * Componente barra de búsqueda con menú.
 * Hereda las funciones del componente {@link SearchBarComponent}.
 * Usado para abrir el menú e ingresar los terminos que se quieran consultar o borrar.
 * ```html
 * <sic-menu-search-bar
 *    (search)="doSearch($event)"
 *    [placeholder]="placeholder"
 *    (menu)="openMenu()"
 * ></sic-menu-search-bar>
 * ```
 */
@Component({
  selector: 'sic-menu-search-bar',
  templateUrl: './menu-search-bar.component.html',
  styleUrls: ['./menu-search-bar.component.scss']
})
export class MenuSearchBarComponent extends SearchBarComponent implements OnInit {
  /**
   * Evento de salida que envía la señal para abrir el menú.
   */
  @Output() menu = new EventEmitter();

  /**
   * @ignore
   */
  override ngOnInit(): void {
  }

  /**
   * Emite la señal para abrir el menú.
   */
  openMenu() {
    this.menu.emit('open');
  }
}
