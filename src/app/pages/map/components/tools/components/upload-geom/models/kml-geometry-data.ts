import { Geometry as Geojson} from 'geojson';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export interface KMLGeometryData {
  id: string;
  name: string;
  description: string;
  user: string;
  fecha: Date;
  geometry: Geojson;
  feature: Feature<Geometry>;
}
