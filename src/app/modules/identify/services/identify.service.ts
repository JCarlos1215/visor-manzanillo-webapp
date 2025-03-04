import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// @ts-ignore
import { Projection } from 'ol/proj/Projection';
import { SICLayer } from 'sic-mapping-toolkit';
import { Observable, forkJoin } from 'rxjs';
import { IdentifyData } from '../models/identify-data';
import { map } from 'rxjs/operators';
import { LayerService } from '../../layer/services/layer.service';

/**
 * Servicio para obtener los datos identifica.
 */
@Injectable({
  providedIn: 'root'
})
export class IdentifyService {
  /**
   * Constructor del servicio de identifica.
   * @param layerService Variable para utilizar el servicio de capas {@link LayerService}.
   * @param http Variable HttpClient para hacer peticiones http.
   */
  constructor(
    private layerService: LayerService,
    private http: HttpClient
  ) { }

  /**
   * Identifica la información de las capas identificables encontrados en coordenada del mapa.
   * @param coordinate Coordenada donde se quiere localizar la información del identifica.
   * @param resolution Resolución del mapa donde se quiere localizar.
   * @param projection Proyección del mapa a localizar.
   * @param layers2identify Arreglo de capas a identificar, es opcional sino toma las identificables del servicio de capas.
   * @returns {IdentifyData[]} Devuelve un arreglo con la información para el identifica.
   */
  identifyFeatures(
    coordinate: [number, number],
    resolution: number,
    projection: Projection,
    layers2identify?: SICLayer[]
  ): Observable<any> {
    const layers = layers2identify || this.layerService.getIdentifyLayers();
    const layerInfoUrl = layers.map((l) => {
      const customUrl = l.Layer.getSource().getFeatureInfoUrl(
        coordinate,
        resolution,
        projection,
        {
          INFO_FORMAT: 'application/json',
          FEATURE_COUNT: 50,
        }
      );
      return {
        layer: l.Title,
        url: customUrl,
      };
    });
    return forkJoin([
      ...layerInfoUrl.map((element) =>
        this.http.get(element.url).pipe(
          map(
            (resp: any): IdentifyData => ({
              name: element.layer,
              layers: resp.features.map((f: any) => ({
                id: f.id.split('.')[1],
                name: f.id.split('.')[0],
                properties: Object.entries(f.properties).map(([k, v]) => ({
                  value: v,
                  key: k,
                })),
                geometry: f.geometry,
              })),
            })
          )
        )
      ),
    ]);
  }
}
