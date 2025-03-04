import { Component, OnDestroy, OnInit } from '@angular/core';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { getCenter } from 'ol/extent';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { ProjectionEnum, ReprojectionService } from 'src/app/pages/map/services/reprojection.service';
import { Predio } from 'src/app/pages/map/models/predio';
import { PredioFrente } from 'src/app/pages/map/models/predio-frente';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { PredioOption } from 'src/app/pages/map/models/predio-option';

const FEATURE_WATCH_FRONT_PREFIX = '[WATCH_FRONT_TOOL]';
const FEATURE_WATCH_FRONT_PREDIO_PREFIX = '[WATCH_FRONT_PREDIO_TOOL]';
const WATCH_FRONT_PREDIO_STYLE: Style = new Style({
  stroke: new Stroke({
    color: '#b51e1c',
    width: 2,
    lineDash: undefined,
  }),
  fill: new Fill({
    color: 'rgba(181, 30, 28, 0.2)',
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: '#b51e1c',
    }),
    fill: new Fill({
      color: '#b51e1c',
    }),
  }),
});

const WATCH_FRONT_STYLE: Style = new Style({
  stroke: new Stroke({
    color: 'blue',
    width: 5,
    lineDash: undefined,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.6)',
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: '#0000ff',
    }),
    fill: new Fill({
      color: '#0000ff',
    }),
  }),
});

@Component({
  selector: 'sic-watch-front',
  templateUrl: './watch-front.component.html',
  styleUrls: ['./watch-front.component.scss']
})
export class WatchFrontComponent implements OnInit, OnDestroy {
  mapEventHandlerId!: string;
  hasValidCoords: boolean = false;
  predio!: Predio;
  streetSelected!: PredioFrente;
  point!: Array<number>;

  constructor(
    private mapService: MapService,
    private featureService: FeatureService,
    private catastroService: CatastroService,
    private reprojectionService: ReprojectionService
  ) { }

  ngOnInit(): void {
    this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_WATCH_FRONT_PREFIX);
    this.mapService.clearDrawings(FEATURE_WATCH_FRONT_PREDIO_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  openGoogleMaps(): void {
    const latLongCoordinates = this.reprojectionService.reproject(ProjectionEnum.EPSG_32613 , ProjectionEnum.LatLong, { x: this.point[0], y: this.point[1] });
    this.catastroService.getHeading(this.streetSelected.idPredioFrente).subscribe((heading) => {
      window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latLongCoordinates.y},${latLongCoordinates.x}&heading=${heading}`, '_blank', 'noopener noreferrer');
    });
  }

  mapClickHandler() {
    return (evt: any) => {
      const [x, y] = evt.coordinate;
      const predioOption: PredioOption = {
        frentes: true,
        construcciones: false
      };
      this.catastroService.getPredioAtPoint(x, y, predioOption).subscribe((res) => {
        if (res) {
          this.predio = res;
          if (this.predio !== null && this.predio.frente.length > 0) {
            this.hasValidCoords = true;
            this.streetSelected = this.predio.frente[0];
            const feature = this.featureService.createFeature(
              FEATURE_WATCH_FRONT_PREDIO_PREFIX,
              this.predio.geometry,
              { 
                clave: this.predio.clave,
                idPredio: this.predio.idPredio
              }
            );
            this.mapService.clearDrawings(FEATURE_WATCH_FRONT_PREDIO_PREFIX);
            this.mapService.drawFeature(feature, WATCH_FRONT_PREDIO_STYLE);
            this.handleSelectStreet();
          }          
        }
      });
    }
  }

  handleSelectStreet(){
    const frente = this.featureService.createFeature(
      FEATURE_WATCH_FRONT_PREFIX,
      this.streetSelected.geometry
    );
    this.mapService.clearDrawings(FEATURE_WATCH_FRONT_PREFIX);
    this.mapService.drawFeature(frente, WATCH_FRONT_STYLE);

    this.point = getCenter(frente.getGeometry().getExtent());
    if (this.streetSelected.geometry.coordinates.length > 2) { 
      this.point = frente.getGeometry().getClosestPoint(this.point);
    }
  }
}
