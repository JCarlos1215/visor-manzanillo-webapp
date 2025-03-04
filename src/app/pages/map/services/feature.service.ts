import { Injectable } from '@angular/core';
import cuid from 'cuid';
import { Geometry } from 'geojson';
import Feature from 'ol/Feature';
import * as geom from 'ol/geom';
import olGeoJSON from 'ol/format/GeoJSON';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  constructor() { }

  createFeature(
    idPrefix: string,
    geometry: Geometry,
    attributes?: any
  ): Feature<Geometry> {
    let featGeometry;
    switch (geometry.type) {
      case 'MultiPolygon':
        featGeometry = new geom.MultiPolygon(geometry.coordinates, 'XY');
        break;
      case 'Polygon':
        featGeometry = new geom.Polygon(geometry.coordinates, 'XY');
        break;
      case 'Point':
        featGeometry = new geom.Point(geometry.coordinates, 'XY');
        break;
      case 'MultiPoint':
        featGeometry = new geom.MultiPoint(geometry.coordinates, 'XY');
        break;
      case 'LineString':
        featGeometry = new geom.LineString(geometry.coordinates, 'XY');
        break;
      case 'MultiLineString':
        featGeometry = new geom.MultiLineString(geometry.coordinates, 'XY');
        break;
      default:
        throw new Error('Geometria no soportada');
    }

    const feat = new Feature(featGeometry);
    feat.setId(idPrefix + '.' + cuid());
    feat.set('original', attributes, true);

    return feat;
  }

  parseFeatureGeometry2Geojson(feature: Feature<Geometry>, srid = 32613) {
    const formater = new olGeoJSON();
    const geomjson = {
      ...formater.writeGeometryObject(feature.getGeometry()),
      crs: {
        type: 'name',
        properties: {
          name: `EPSG:${srid}`
        }
      }
    };
    return geomjson;
  }
}
