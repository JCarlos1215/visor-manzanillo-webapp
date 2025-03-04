import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

/**
 * Componente barra de búsqueda
 * Usado para ingresar los terminos que se quieran consultar o borrar su contenido.
 * ```html
 * <sic-search-bar 
 *    (search)="doSearch($event)"
 *    [placeholder]="placeholder"
 * ></sic-search-bar>
 * ```
 */
@Component({
  selector: 'sic-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  /**
   * FormControl que guarda el texto a buscar.
   */
  myControl = new FormControl('');
  /**
   * Booleano que indica si la búsqueda esta activa.
   */
  activeSearch = false;
  /**
   * Arreglo con las opciones de filtro.
   */
  options = [];
  /**
   * Opciones de filtro.
   */
  filteredOptions: Observable<any> | undefined;

  /**
   * Variable de entrada que contiene la cadena de texto como placeholder de la barra de busqueda.
   */
  @Input() placeholder = 'Buscar...';
  /**
   * Evento de salida que envía lo que se quiere buscar, puede ser una cadena o un objeto.
   */
  @Output() search = new EventEmitter<any>();

  /**
   * @ignore
   */
  constructor() { }

  /**
   * Carga las opciones de filtro y detecta si cambia el valor en el texto a buscar.
   */
  ngOnInit(): void {
    this.options = []; // this.historySearchService.getSearch();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(null),
      map((search) => (
        search && typeof search === 'object' ? search.search : search
        )
      ),
      map((value) => (value ? this.filter(value) : this.options.slice()))
    );
    this.myControl.valueChanges.subscribe((newVal) => {
      if (typeof newVal === 'object') {
        this.doSearch(newVal.search);
      }
    });
  }

  /**
   * Verifica que el valor tenga al menos un carácter y si se tecleo alguna letra, número o enter activa la busqueda y emite la señal de búsqueda con el valor y última tecla.
   * @param event Evento del input con el valor.
   * @returns Regresa nada si la cadena esta vacía.
   */
  doSearchWithEvent(event: any) {
    if (this.myControl.value.length === 0) {
      return;
    }
    if ((event.keyCode >= 48 && event.keyCode <= 90) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 13 || event.keyCode === 190 ) {
      this.activeSearch = true;
      this.search.emit({value: this.myControl.value, keyCode: event.code});
    } else {
      return;
    }
  }

  /**
   * Verifica que el valor tenga al menos un carácter, activa la busqueda y emite la señal de busqueda con el valor y última tecla.
   * @param value Cadena con el valor a buscar.
   * @returns Regresa nada si la cadena esta vacía.
   */
  doSearch(value: string) {
    if (value.length === 0) {
      return;
    }
    this.activeSearch = true;
    this.search.emit({value: value, keyCode: null});
  }

  /**
   * Borra el valor de búsqueda, desactiva la búsqueda y emite la señal de búsqueda vacía.
   */
  clearSearch() {
    this.myControl.setValue('');
    this.activeSearch = false;
    this.search.emit({value: null, keyCode: null});
  }

  /**
   * Filtra las opciones con expresión regular.
   * @param val Cadena con valor de búsqueda.
   * @returns {Array} Arreglo con las opciones que cumplen el filtro.
   */
  filter(val: string): Array<any> {
    return this.options.filter((option: any) => new RegExp(val, 'gi').test(option.search));
  }

  /**
   * Función para autocompletado y mostrar los valores de búsqueda.
   * @param search Valor de búsqueda.
   * @returns {string} Cadena con el valor a mostrar.
   */
  displayFn(search: any): string {
    return search ? search.search : search;
  }

}
