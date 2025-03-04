import { Geometry as Geojson} from 'geojson';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export interface ConoStreetView {
  idCono: string;
  geometry: Geojson;
  featureGeometry: Feature<Geometry>;
  fuenteToma: Geojson;
  featureFuente: Feature<Geometry>;
  objetivoToma: Geojson;
  featureObjetivo: Feature<Geometry>;
  baseToma: Geojson;
  featureBase: Feature<Geometry>;
  extentGeom: Geojson;
  featureExtent: Feature<Geometry>;
  zoom: number;
  azimut: number;
  vertical: number;
  fecha: Date;
  url: string;
  usuario: string;
  descripcion: string;
}
