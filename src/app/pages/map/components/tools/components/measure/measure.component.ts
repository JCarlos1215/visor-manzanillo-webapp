import { Component, OnDestroy, OnInit } from '@angular/core';
import { Circle, Style, Fill, Stroke, Icon } from 'ol/style';
import { default as Draw, DrawEvent } from 'ol/interaction/Draw';
import { Modify, Select } from 'ol/interaction';
import { Vector } from 'ol/source';
import Overlay from 'ol/Overlay';
import { Geometry, LineString, Polygon } from 'ol/geom';
import Snap from 'ol/interaction/Snap';
import { MatDialog } from '@angular/material/dialog';
import { SnapService } from './services/snap.service';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import Feature from 'ol/Feature';
import cuid from 'cuid';
import { getCenter } from 'ol/extent';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { forkJoin } from 'rxjs';
import * as format from 'ol/format';
import { SnapConfigComponent } from './snap-config/snap-config.component';

const FEATURE_MEASURE_PREFIX = '[MEASURE_TOOL]';
const DRAWING_MEASURE_STYLE: Style = new Style({
  fill: new Fill({
    color: 'rgba(181, 30, 28, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(181, 30, 28, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(228, 179, 70, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(228, 179, 70, 0.2)',
    }),
  }),
});

const MEASURE_STYLE: Style = new Style({
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

const FEATURE_SNAP_PREFIX = '[MEASURE_SNAP]';
const SNAP_STYLE: Style = new Style({
  stroke: new Stroke({
    color: 'rgba(228, 179, 70, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(228, 179, 70, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(228, 179, 70, 0.2)',
    }),
  }),
});

@Component({
  selector: 'sic-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.scss']
})
export class MeasureComponent implements OnInit, OnDestroy {
  mapInteraction!: Draw;
  selectInteraction!: Select;
  modifyInteraction!: Modify;
  sourceInteraction: Vector<Geometry>;
  mapEventHandlerId!: string;

  measureType: string = '';
  measures: any[] = [
    { title: 'Punto', value: 'point', icon: 'gps_fixed' },
    { title: 'Longitud', value: 'longitude', icon: 'timeline' },
    { title: 'Área', value: 'area', icon: 'crop_3_2' },
    { title: 'Ángulo', value: 'angle', icon: 'call_missed_outgoing' },
    { title: 'Eliminar', value: 'delete', icon: 'delete' },
    { title: 'Editar', value: 'edit', icon: 'create' }
  ];

  snapConfig;
  snapLayers;
  snapActive = false;

  snapSource: Vector<Geometry>;
  snapInteraction!: Snap;
  mapMoveSnapHandler!: string;

  currentTooltip!: Overlay;

  toolTipsGenerate!: { id: string, type: string, tooltip: Overlay }[];

  constructor(
    private mapService: MapService,
    private snapService: SnapService,
    public dialog: MatDialog
  ) {
    this.sourceInteraction = new Vector();
    this.snapSource = new Vector();
    this.snapService.getConfiguration().subscribe((l) => {
      this.snapConfig = l;
    });
  }

  ngOnInit(): void {
    this.toolTipsGenerate = [];
  }

  ngOnDestroy(): void {
    this.toolTipsGenerate.forEach((t) => this.mapService.removeOverlay(t.tooltip));
    this.removeCurrentTooltip();
    this.sourceInteraction.clear();
    this.sourceInteraction = null as unknown as Vector<Geometry>;
    this.deactivateInteractions();
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
    this.deactivateSnap();
    this.snapSource.clear();
    this.snapSource = null as unknown as Vector<Geometry>;
  }

  measureSelect() {
    this.stopMapClicEvents();
    this.deactivateInteractions();
    this.removeCurrentTooltip();
    switch (this.measureType) {
      case 'point': 
        this.measurePoint();
        break;
      case 'longitude':
        this.measureLongitude();
        break;
      case 'angle':
        this.measureAngle();
        break;
      case 'area':
        this.measureArea();
        break;
      case 'delete':
        this.deleteGeom();
        break;
      case 'edit':
        this.editGeom();
        break;
    }
    if (this.snapActive) {
      this.deactivateSnap();
      this.activateSnap();
    }
  }

  deactivateInteractions() {
    if (this.mapInteraction) {
      this.mapService.removeInteraction(this.mapInteraction);
    }
    if (this.selectInteraction) {
      this.mapService.removeInteraction(this.selectInteraction);
    }
    if (this.modifyInteraction) {
      this.mapService.removeInteraction(this.modifyInteraction);
    }
  }

  stopMapClicEvents() {
    if (!this.mapEventHandlerId) {
      this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, () => {}, 'HIGH');
    }
  }

  private removeCurrentTooltip() {
    if (this.currentTooltip) {
      this.mapService.removeOverlay(this.currentTooltip);
      this.currentTooltip = null as unknown as Overlay;
    }
  }

  measurePoint() {
    this.mapInteraction = new Draw({
      source: this.sourceInteraction,
      type: 'Point',
      style: DRAWING_MEASURE_STYLE,
    });

    this.mapService.addInteraction(this.mapInteraction);

    this.mapInteraction.on('drawstart', (evt: DrawEvent) => {
      const value = evt.feature.getGeometry().getCoordinates();
      this.currentTooltip = this.createMeasureTooltip(`x: ${value[0].toFixed(3)}<br>y: ${value[1].toFixed(3)}`);
      this.currentTooltip.setPosition(evt.feature.getGeometry().getLastCoordinate());
      this.mapService.addOverlay(this.currentTooltip);

      evt.feature.getGeometry().on('change', (_) => {
        this.currentTooltip.setPosition(evt.feature.getGeometry().getLastCoordinate());
        this.currentTooltip.getElement()!.innerHTML = `x: ${value[0].toFixed(3)}<br>y: ${value[1].toFixed(3)}`;
      });
    });

    this.mapInteraction.on('drawend', (evt: DrawEvent) => {
      this.removeCurrentTooltip();
      const feat = evt.feature.clone();
      feat.setId(`${FEATURE_MEASURE_PREFIX}.${cuid()}`);
      this.mapService.drawFeature(feat, MEASURE_STYLE);
      const value = feat.getGeometry().getCoordinates();
      const tooltip = this.createMeasureTooltip(`x: ${value[0].toFixed(3)}<br>y: ${value[1].toFixed(3)}`);
      tooltip.setPosition(feat.getGeometry().getLastCoordinate());
      this.mapService.addOverlay(tooltip);
      this.toolTipsGenerate.push({ id: feat.getId() as string, type: 'point', tooltip: tooltip });
    });
  }

  measureLongitude() {
    this.mapInteraction = new Draw({
      source: this.sourceInteraction,
      type: 'LineString',
      style: DRAWING_MEASURE_STYLE,
    });

    this.mapService.addInteraction(this.mapInteraction);

    this.mapInteraction.on('drawstart', (evt: DrawEvent) => {
      const value = evt.feature.getGeometry().getLength();
      this.currentTooltip = this.createMeasureTooltip(this.getLongitudeString(value));
      this.currentTooltip.setPosition(evt.feature.getGeometry().getLastCoordinate());
      this.mapService.addOverlay(this.currentTooltip);

      evt.feature.getGeometry().on('change', (_) => {
        this.currentTooltip.setPosition(evt.feature.getGeometry().getLastCoordinate());
        this.currentTooltip.getElement()!.innerHTML = this.getLongitudeString(evt.feature.getGeometry().getLength());
      });
    });

    this.mapInteraction.on('drawend', (evt: DrawEvent) => {
      this.removeCurrentTooltip();
      const feat: Feature<LineString> = evt.feature.clone();
      feat.setId(`${FEATURE_MEASURE_PREFIX}.${cuid()}`);
      this.mapService.drawFeature(feat, MEASURE_STYLE);
      const value = feat.getGeometry()?.getLength();
      const tooltip = this.createMeasureTooltip(this.getLongitudeString(value as number));
      tooltip.setPosition(getCenter(feat.getGeometry()?.getExtent() as number[]));
      this.mapService.addOverlay(tooltip);
      this.toolTipsGenerate.push({ id: feat.getId() as string, type: 'longitude', tooltip: tooltip });
    });
  }

  measureAngle() {
    this.mapInteraction = new Draw({
      source: this.sourceInteraction,
      type: 'LineString',
      style: DRAWING_MEASURE_STYLE,
      minPoints: 3,
      maxPoints: 3,
    });

    this.mapService.addInteraction(this.mapInteraction);

    this.mapInteraction.on('drawstart', (evt: DrawEvent) => {
      this.currentTooltip = this.createMeasureTooltip(`${0}°`);
      this.mapService.addOverlay(this.currentTooltip);

      evt.feature.getGeometry().on('change', (_) => {
        if (evt.feature.getGeometry().getCoordinates().length > 2) {
          this.currentTooltip.setPosition(evt.feature.getGeometry().getCoordinates()[1]);
          this.currentTooltip.getElement()!.innerHTML = `${this.getAngle(evt.feature.getGeometry().getCoordinates()).toFixed(3)}°`;
        }
      });
    });

    this.mapInteraction.on('drawend', (evt: DrawEvent) => {
      this.removeCurrentTooltip();
      const feat = evt.feature.clone();
      feat.setId(`${FEATURE_MEASURE_PREFIX}.${cuid()}`);
      this.mapService.drawFeature(feat, MEASURE_STYLE);
      const value = this.getAngle(feat.getGeometry().getCoordinates());
      const tooltip = this.createMeasureTooltip(`${value.toFixed(3)}°`);
      tooltip.setPosition(feat.getGeometry().getCoordinates()[1]);
      this.mapService.addOverlay(tooltip);
      this.toolTipsGenerate.push({ id: feat.getId() as string, type: 'angle', tooltip: tooltip });
    });
  }

  measureArea() {
    this.mapInteraction = new Draw({
      source: this.sourceInteraction,
      type: 'Polygon',
      style: DRAWING_MEASURE_STYLE,
    });

    this.mapService.addInteraction(this.mapInteraction);

    this.mapInteraction.on('drawstart', (evt: DrawEvent) => {
      const value = evt.feature.getGeometry().getArea();
      this.currentTooltip = this.createMeasureTooltip(this.getAreaString(value));
      this.currentTooltip.setPosition(evt.feature.getGeometry().getInteriorPoint().getCoordinates());
      this.mapService.addOverlay(this.currentTooltip);

      evt.feature.getGeometry().on('change', (_) => {
        this.currentTooltip.setPosition(evt.feature.getGeometry().getInteriorPoint().getCoordinates());
        this.currentTooltip.getElement()!.innerHTML = this.getAreaString(evt.feature.getGeometry().getArea());
      });
    });

    this.mapInteraction.on('drawend', (evt: DrawEvent) => {
      this.removeCurrentTooltip();
      const feat: Feature<Polygon> = evt.feature.clone();
      feat.setId(`${FEATURE_MEASURE_PREFIX}.${cuid()}`);
      this.mapService.drawFeature(feat, MEASURE_STYLE);
      const value = feat.getGeometry()?.getArea();
      const tooltip = this.createMeasureTooltip(this.getAreaString(value as number));
      tooltip.setPosition(feat.getGeometry()?.getInteriorPoint().getCoordinates());
      this.mapService.addOverlay(tooltip);
      this.toolTipsGenerate.push({ id: feat.getId() as string, type: 'area', tooltip: tooltip });
    });
  }

  deleteGeom() {
    const overlayStyle = (() => {
      const styles = {};
      styles['Polygon'] = [
        new Style({
          fill: new Fill({
            color: [255, 255, 255, 0.5],
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: [255, 255, 255, 1],
            width: 5,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: [0, 153, 255, 1],
            width: 3,
          }),
        }),
      ];
      styles['MultiPolygon'] = styles['Polygon'];
    
      styles['LineString'] = [
        new Style({
          stroke: new Stroke({
            color: [255, 255, 255, 1],
            width: 5,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: [0, 153, 255, 1],
            width: 3,
          }),
        }),
      ];
      styles['MultiLineString'] = styles['LineString'];
    
      styles['Point'] = [
        new Style({
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: [0, 153, 255, 1],
            }),
            stroke: new Stroke({
              color: [255, 255, 255, 0.75],
              width: 1.5,
            }),
          }),
          zIndex: 100000,
        }),
      ];
      styles['MultiPoint'] = styles['Point'];
    
      styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point']);
    
      return (feature) => {
        const newTooTip: { id: string, type: string, tooltip: Overlay }[] = [];
        this.toolTipsGenerate.map((ttip) => {
          if (ttip.id === feature.getId()) {
            this.mapService.removeOverlay(ttip.tooltip);
          } else {
            newTooTip.push(ttip);
          }
        });
        this.toolTipsGenerate = newTooTip;
        this.mapService.clearDrawings(feature.getId());
        return styles[feature.getGeometry().getType()];
      };
    })();

    this.selectInteraction = new Select({
      style: overlayStyle,
    });

    this.mapService.addInteraction(this.selectInteraction);
  }

  editGeom() {
    const overlayStyleModify = (() => {
      const styles = {};
      styles['Polygon'] = [
        new Style({
          fill: new Fill({
            color: [255, 255, 255, 0.5],
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: [255, 255, 255, 1],
            width: 5,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: [0, 153, 255, 1],
            width: 3,
          }),
        }),
      ];
      styles['MultiPolygon'] = styles['Polygon'];
    
      styles['LineString'] = [
        new Style({
          stroke: new Stroke({
            color: [255, 255, 255, 1],
            width: 5,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: [0, 153, 255, 1],
            width: 3,
          }),
        }),
      ];
      styles['MultiLineString'] = styles['LineString'];
    
      styles['Point'] = [
        new Style({
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: [0, 153, 255, 1],
            }),
            stroke: new Stroke({
              color: [255, 255, 255, 0.75],
              width: 1.5,
            }),
          }),
          zIndex: 100000,
        }),
      ];
      styles['MultiPoint'] = styles['Point'];
    
      styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point']);
    
      return (feature) => {
        if (feature.getId() != undefined) {
          const ttip = this.toolTipsGenerate.findIndex((t) => t.id === feature.getId());
          switch (feature.getGeometry().getType()) {
            case 'Point':
              if (ttip < 0) {
                const value = feature.getGeometry().getCoordinates();
                const tooltip = this.createMeasureTooltip(`x: ${value[0].toFixed(3)}<br>y: ${value[1].toFixed(3)}`);
                tooltip.setPosition(feature.getGeometry().getLastCoordinate());
                this.mapService.addOverlay(tooltip);
                this.toolTipsGenerate.push({ id: feature.getId(), type: 'point', tooltip: tooltip});
              } else {
                this.mapService.removeOverlay(this.toolTipsGenerate[ttip].tooltip);
                const value = feature.getGeometry().getCoordinates();
                const tooltip = this.createMeasureTooltip(`x: ${value[0].toFixed(3)}<br>y: ${value[1].toFixed(3)}`);
                tooltip.setPosition(feature.getGeometry().getLastCoordinate());
                this.mapService.addOverlay(tooltip);
                this.toolTipsGenerate[ttip].tooltip = tooltip;
              }
              break;
            case 'LineString':
              if (ttip < 0) {
                if (feature.getGeometry().getCoordinates().length === 3) {
                  const value = this.getAngle(feature.getGeometry().getCoordinates());
                  const tooltip = this.createMeasureTooltip(`${value.toFixed(3)}°`);
                  tooltip.setPosition(feature.getGeometry().getCoordinates()[1]);
                  this.mapService.addOverlay(tooltip);
                  this.toolTipsGenerate.push({ id: feature.getId(), type: 'angle', tooltip: tooltip});
                } else {
                  const value = feature.getGeometry()?.getLength();
                  const tooltip = this.createMeasureTooltip(this.getLongitudeString(value as number));
                  tooltip.setPosition(getCenter(feature.getGeometry()?.getExtent() as number[]));
                  this.mapService.addOverlay(tooltip);
                  this.toolTipsGenerate.push({ id: feature.getId(), type: 'longitude', tooltip: tooltip});
                }
              } else {
                this.mapService.removeOverlay(this.toolTipsGenerate[ttip].tooltip);
                if (feature.getGeometry().getCoordinates().length === 3 && this.toolTipsGenerate[ttip].type === 'angle') {
                  const value = this.getAngle(feature.getGeometry().getCoordinates());
                  const tooltip = this.createMeasureTooltip(`${value.toFixed(3)}°`);
                  tooltip.setPosition(feature.getGeometry().getCoordinates()[1]);
                  this.mapService.addOverlay(tooltip);
                  this.toolTipsGenerate[ttip].tooltip = tooltip;
                } else {
                  const value = feature.getGeometry()?.getLength();
                  const tooltip = this.createMeasureTooltip(this.getLongitudeString(value as number));
                  tooltip.setPosition(getCenter(feature.getGeometry()?.getExtent() as number[]));
                  this.mapService.addOverlay(tooltip);
                  this.toolTipsGenerate[ttip].tooltip = tooltip;
                }
              }
              break;
            case 'Polygon':
              if (ttip < 0) {
                const value = feature.getGeometry()?.getArea();
                const tooltip = this.createMeasureTooltip(this.getAreaString(value as number));
                tooltip.setPosition(feature.getGeometry()?.getInteriorPoint().getCoordinates());
                this.mapService.addOverlay(tooltip);
                this.toolTipsGenerate.push({ id: feature.getId(), type: 'area', tooltip: tooltip});
              } else {
                this.mapService.removeOverlay(this.toolTipsGenerate[ttip].tooltip);
                const value = feature.getGeometry()?.getArea();
                const tooltip = this.createMeasureTooltip(this.getAreaString(value as number));
                tooltip.setPosition(feature.getGeometry()?.getInteriorPoint().getCoordinates());
                this.mapService.addOverlay(tooltip);
                this.toolTipsGenerate[ttip].tooltip = tooltip;
              }
              break;  
            default:
              console.log('No definido');
              break;
          }
        }
        return styles[feature.getGeometry().getType()];
      };
    })();

    this.selectInteraction = new Select({
      style: overlayStyleModify,
    });

    this.modifyInteraction = new Modify({
      features: this.selectInteraction.getFeatures(),
      style: overlayStyleModify
    })

    this.mapService.addInteraction(this.selectInteraction);
    this.mapService.addInteraction(this.modifyInteraction);
  }

  private createMeasureTooltip(text: string) {
    const measureTooltipElement = document.createElement('div');
    measureTooltipElement.innerHTML = text;
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    const measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -7],
      positioning: 'bottom-center',
    });
    return measureTooltip;
  }

  private getLongitudeString(longitude: number): string {
    return longitude > 1000 ? `${(longitude / 1000.0).toFixed(2)} Km` : `${longitude.toFixed(2)} m`;
  }

  private getAngle(line: number[][3]) {
    const translate = (point: number[], dx: number, dy: number) => [point[0] - dx, point[1] - dy];
    const module = (point: number[]) =>
      Math.sqrt(point.reduce((result, coordinate) => result + coordinate * coordinate, 1));
    const vectorProduct = (point1: number[], point2: number[]) => point1[0] * point2[0] + point1[1] * point2[1];

    const pointA = translate(line[0], line[1][0], line[1][1]);
    const pointB = translate(line[2], line[1][0], line[1][1]);

    const radianAngle = Math.acos(vectorProduct(pointA, pointB) / (module(pointA) * module(pointB)));
    return (radianAngle * 180.0) / Math.PI;
  }

  private getAreaString(area: number): string {
    let areaResult: string;
    if (area > 1000000) {
      areaResult = `${(area / 1000000.0).toFixed(2)} Km²`;
    } else if (area > 10000) {
      areaResult = `${(area / 10000.0).toFixed(2)} ha`;
    } else {
      areaResult = `${area.toFixed(2)} m²`;
    }
    return areaResult;
  }

  /* SNAP */
  snapStateChangeHandler(evt: MatCheckboxChange) {
    if (evt.checked) {
      this.activateSnap();
      this.snapActive = true;
    } else {
      this.deactivateSnap();
      this.snapActive = false;
    }
  }

  private activateSnap() {
    const self = this;
    if (!this.snapLayers || !Array.isArray(this.snapLayers)) {
      this.snapLayers = this.snapService.getSnapLayers();
    }
    if (!!this.mapMoveSnapHandler) {
      this.mapService.removeEventHandler(this.mapMoveSnapHandler);
      this.mapMoveSnapHandler = null as unknown as string;
    }
    this.mapMoveSnapHandler = this.mapService.addEventHandler(
      MapEventType.MOVEEND,
      (evt) => {
        const evtview = evt.map.getView();
        const evtextent = evtview.calculateExtent(evt.map.getSize());
        const evtdpi = 25.4 / 0.28;
        const evtscale = evtview.getResolution() * 1 * 39.37 * evtdpi;
        self.loadSnapFeatures(evtextent, evtscale);
      },
      'SPECIAL'
    );
    const dpi = 25.4 / 0.28;
    const extent = this.mapService.getMapById(this.mapService.default).getViewExtent();
    const scale = this.mapService.getMapById(this.mapService.default).getViewResolution() * 1 * 39.37 * dpi;

    /*const view = this.mapService.getMapById(this.mapService.default)._innerMap.getView();
    const extent = view.calculateExtent(this.mapService.getMapById(this.mapService.default)._innerMap.getSize());
    const dpi = 25.4 / 0.28;
    const scale = view.getResolution() * 1 * 39.37 * dpi;*/

    this.loadSnapFeatures(extent, scale);
    this.snapInteraction = new Snap({
      source: this.snapSource,
    });
    this.mapService.addInteraction(this.snapInteraction);
  }

  private deactivateSnap() {
    if (!!this.mapMoveSnapHandler) {
      this.mapService.removeEventHandler(this.mapMoveSnapHandler);
      this.mapMoveSnapHandler = null as unknown as string;
    }
    this.mapService.removeInteraction(this.snapInteraction);
    this.snapInteraction = null as unknown as Snap;
    this.snapSource.clear();
    this.mapService.clearDrawings(FEATURE_SNAP_PREFIX);
  }

  private loadSnapFeatures(extent, scale) {
    const self = this;
    forkJoin(
      self.snapLayers.map((layer) => {
        return self.snapService.getFeatures(layer.id, extent, scale);
      })
    ).subscribe((result: any) => {
      const json = new format.GeoJSON();
      const snapFeatures = result.map((snapLayer: any) =>
          snapLayer.geometries.map((geom) => {
            const olGeom = json.readGeometry(geom, {
              dataProjection: 'EPSG:32613',
              featureProjection: 'EPSG:32613',
            });
            const olFeature: Feature<Geometry> = new Feature(olGeom);
            olFeature.setId(FEATURE_SNAP_PREFIX + cuid());
            olFeature.setStyle(SNAP_STYLE);
            return olFeature;
          })
        )
        .reduce((a, b) => a.concat(b), []);
      self.mapService.clearDrawings(FEATURE_SNAP_PREFIX);
      snapFeatures.map((feat) => self.mapService.drawFeature(feat, SNAP_STYLE));
      this.snapSource.addFeatures(snapFeatures);
    });
  }

  openSnapConfigDialog() {
    if (!this.snapLayers || !Array.isArray(this.snapLayers)) {
      this.snapLayers = this.snapService.getSnapLayers();
    }
    const dialogRef = this.dialog.open(SnapConfigComponent, {
      data: {
        snapConfiguration: this.snapConfig,
        snapLayers: this.snapLayers
      },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((dialogResponse) => {
      if(dialogResponse){
        this.snapLayers = dialogResponse;
        this.snapService.saveSnapConfig(this.snapLayers);
      }
    });
  }
}
