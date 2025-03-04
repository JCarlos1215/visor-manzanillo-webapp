import { Component, Input, OnInit } from '@angular/core';
import { IdentifyLayer } from '../../models/identify-layer';

/**
 * Componente para mostrar las propiedades de una capa identifica.
 * ```html
 * <sic-feature-container
 *    [feature]="feature"
 * ></sic-feature-container>
 * ```
 */
@Component({
  selector: 'sic-feature-container',
  templateUrl: './feature-container.component.html',
  styleUrls: ['./feature-container.component.scss']
})
export class FeatureContainerComponent implements OnInit {
  /**
   * Variable de entrada con los datos de una capa {@link IdentifyLayer}.
   */
  @Input() feature!: IdentifyLayer;

  /**
   * @ignore
   */
  constructor() { }

  /**
   * Función inicial que pone nombre por default a las capas sin nombre (son raster).
   */
  ngOnInit(): void {
    if (this.feature.name === '') {
      this.feature.name = 'Capa raster';
    }
  }

  /**
   * Función que reemplaza los guiones bajos por espacios.
   * @param key Cadena de entrada con el nombre de una propiedad
   * @returns {string} Cadena a mostrar en el identifica sin guiones bajos.
   */
  filterKey(key: string): string {
    return key.replace(/_/g, ' ');
  }
}
