import { Injectable } from '@angular/core';
import { LayerFactory, MapService, SICLayer, WmsType } from 'sic-mapping-toolkit';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import XYZ from 'ol/source/XYZ';
import { WmtsLayer } from 'src/app/modules/layer/models/wmts-layer';
import { LayerData } from '../models/layer-data';
import { XYZLayer } from '../models/xyz-layer';

/**
 * Servicio para interactuar con las capas del sistema.
 */
@Injectable({
  providedIn: 'root'
})
export class LayerService {
  /**
   * Objeto con las capas del sistema.
   */
  private layers: { [key: string]: SICLayer } = {};
  /**
   * Arreglo con el orden de las capas cargadas en el sistema.
   */
  private layerOrder: any[] = [];

  /**
   * Constructor del servicio de capas
   * @param mapService Variable MapService para utilizar los servicios del mapa.
   */
  constructor(
    private mapService: MapService
  ) { }

  /**
   * Método que inicializa el objeto de capas vacío y el arreglo de orden de capas.
   */
  initialize(): void {
    this.layers = {};
    this.layerOrder = [];
  }

  /**
   * Devuelve la capa del sistema que tenga el identificador dado.
   * @param id Identificador de una capa del sistema.
   * @returns {SICLayer} Capa del sistema.
   */
  getLayer(id: string): SICLayer {
    return this.layers[id];
  }

  /**
   * Verifica si existe una capa dado un identificador.
   * @param id Identificador de una capa del sistema.
   * @returns {boolean} Devuelve verdadero si existe la capa con el identificador y falso si no.
   */
  hasLayer(id: string): boolean {
    return !!this.layers[id];
  }

  /**
   * Devuelve el numero de capas del sistema.
   */
  get LayerCount(): number {
    return this.layerOrder.length || 0;
  }

  /**
   * Devuelve todas las capas que son identificables del sistema y estan encendidas.
   * @returns {SICLayer[]} Arreglo de capas del sistema identificables.
   */
  getIdentifyLayers(): SICLayer[] {
    const returnLayers: SICLayer[] = [];
    this.layerOrder.map((element: any) => {
      if (element.identify) {
        returnLayers.push(this.layers[element.id]);
      }
    });
    return returnLayers.filter((layer: SICLayer) => layer.isVisible());
  }

  /**
   * Verifica si alguna capa esta encendida.
   * @returns {boolean} Devuelve verdadero si alguna capa esta visible y falso en caso contrario.
   */
  hasLayerVisible(): boolean {
    return Object.values(this.layers).some((layer) => layer.isVisible());
  }

  /**
   * Obtiene todas las capas que esten encendidas.
   * @returns {SICLayer[]} Arreglo de capas del sistema visibles.
   */
  getVisibleLayers(): SICLayer[] {
    return this.layerOrder
      .map((element: any): SICLayer => {
        return this.layers[element.id]
      })
      .filter((layer: SICLayer) => layer.isVisible());
  }

  /**
   * Crea y agrega una nueva capa al mapa establecido.
   * @param id Identificador de la capa.
   * @param data Datos básicos de la capa {@link LayerData}.
   */
  addLayer(id: string, data: LayerData): string {
    if (this.layers[id]) {
      console.log('El id ya existe');
      return id;
    }

    let layer: SICLayer;
    if (data.type === 'WMTS') {
      const opciones = JSON.parse(data.options);
      const wmtsLayer = new TileLayer({
        opacity: data.opacity,
        source: new WMTS ({
          attributions: data.attribution,
          url: data.server,
          layer: data.service,
          matrixSet: opciones.matrixset,
          format: opciones.format,
          projection: opciones.projection,
          tileGrid: new WMTSTileGrid({
            origin: opciones.grid.origin,
            resolutions: opciones.grid.resolutions,
            matrixIds: opciones.grid.matrixIds,
          }),
          style: opciones.style,
          wrapX: true,
        }),
        extent: opciones.extent,
      });
      layer = new WmtsLayer(data.title, wmtsLayer, data.legend);
    } else if (data.type === 'XYZ') {
      layer = new XYZLayer(
        data.title,
        new TileLayer({
          source: new XYZ({
            url: data.server,
            crossOrigin: null,
            projection: data.options
          })
        }),
        data.attribution
      );
    } else {
      layer = LayerFactory.createWmsLayer(
        data.title,
        data.type === 'TILE' ? WmsType.TILE : WmsType.IMAGE,
        'geoserver',
        data.server,
        data.service,
        data.legend,
        data.attribution
      );
    }

    layer.setId(id);
    this.layers[id] = layer;
    const idx = this.mapService.addLayer(layer);
    this.layerOrder.push({ id, identify: data.hasIdentify });
    layer.Layer.setZIndex(data.zIndex);
    return id;
  }

  /**
   * Remueve una capa al mapa establecido.
   * @param id Identificador de la capa.
   * @returns {boolean} Devuelve verdadero si pudo quitar la capa y falso en caso contrario.
   */
  removeLayer(id: string): boolean {
    if (!this.layers[id]) {
      console.log('El id no existe');
      return false;
    }
    const currentId = this.layerOrder.findIndex((x) => x.id === id);
    delete this.layers[id];
    this.layerOrder = [
      ...this.layerOrder.slice(0, currentId),
      ...this.layerOrder.slice(currentId + 1),
    ];
    this.mapService.removeLayer(id);
    return true;
  }

  /**
   * Establece nueva opacidad a una capa del sistema.
   * @param id Identificador de la capa.
   * @param value Nuevo valor de opacidad para la capa.
   * @returns {boolean} Devuelve verdadero si se pudo cambiar la opacidad de la capa y falso en caso contrario.
   */
  setOpacity(id: string, value: number): boolean {
    if (!this.layers[id]) {
      console.log('El id no existe');
      return false;
    }
    this.layers[id].setOpacity(value);
    return true;
  }
}
