import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IdentifyData } from '../../models/identify-data';
import { Overlay } from 'ol';
import { MapService } from 'sic-mapping-toolkit';

/**
 * Componente para generar el overlay del identifica sobre un punto del mapa.
 * Contiene el cuadro de identifica con su respectivo botón de cerrar.
 * ```html
 * <sic-identify-container
 *    [position]="identifyCoordinates"
 *    [mapId]="mapId"
 *    [elements]="identifyResults"
 *    (closed)="cleanIdentify()"
 * ></sic-identify-container>
 * ```
 */
@Component({
  selector: 'sic-identify-container',
  templateUrl: './identify-container.component.html',
  styleUrls: ['./identify-container.component.scss']
})
export class IdentifyContainerComponent implements OnInit, OnChanges {
  /**
   * Variable de entrada que contiene la coordenada del mapa donde se mostrara el overlay del identifica.
   */
  @Input() position: any = [0, 0];
  /**
   * Variable de entrada que contiene el identificador del mapa donde se generará el overlay del identifica.
   */
  @Input() mapId: any;
  /**
   * Variable de entrada con el arreglo de elementos con los datos del identifica {@link IdentifyData}
   */
  @Input() elements!: Array<IdentifyData>;

  /**
   * Evento de salida que envía la señal de que se debe quitar el componente overlay identifica.
   */
  @Output() closed = new EventEmitter();
  /**
   * Overlay de openlayers para mostrarlo sobre el mapa.
   */
  popupOverlay!: Overlay;

  /**
   * Constructor del contenedor del identifica.
   * @param mapService Variable MapService para utilizar los servicios del mapa.
   * @param elementRef Variable ElementRef para manejar DOM de HTML.
   */
  constructor(
    private mapService: MapService,
    private elementRef: ElementRef
  ) { }

  /**
   * Función de inicio para asignar el overlay a nulo.
   */
  ngOnInit(): void {
    this.popupOverlay = null as unknown as Overlay;
  }

  /**
   * Función para detectar cambios en las variables de entrada y mover o quitar el identifica.
   * @param changes Variable para detectar cambios.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      Object.entries(changes).some(
        ([key, val]) => ['position'].indexOf(key) !== -1
      ) &&
      !!changes['position'].currentValue
    ) {
      this.showOverlay();
    } else {
      this.closeOverlay();
    }
  }

  /**
   * Muestra el identifica
   * Si existe lo coloca en la posición de las coordenadas de entrada.
   * Si es nulo crea el overlay, le asigna el elemento y posición, y lo trara de agregar al mapa.
   */
  showOverlay(): void {
    if (!!this.popupOverlay) {
      this.popupOverlay.setPosition(this.position);
    } else {
      this.popupOverlay = new Overlay({
        element: this.elementRef.nativeElement,
        position: this.position,
        autoPan: true
      });
      try {
        this.mapService.addOverlay(this.popupOverlay, this.mapId);
      } catch (e) {}
    }
  }

  /**
   * Función para quitar el overlay del mapa y ponerlo en nulo.
   */
  closeOverlay(): void {
    this.mapService.removeOverlay(this.popupOverlay, this.mapId);
    this.popupOverlay = null as unknown as Overlay;
  }

  /**
   * Envia la señal para cerrar el identifica.
   */
  callClose(): void {
    this.closed.emit();
  }

}
