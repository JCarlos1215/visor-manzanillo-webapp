import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { Construction } from 'src/app/pages/map/models/construction';
import { Predio } from 'src/app/pages/map/models/predio';
import { PredioOption } from 'src/app/pages/map/models/predio-option';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { MatTableDataSource } from '@angular/material/table';
import { Lindero } from './models/lindero';
import { Extent } from 'ol/extent';
import { SnapService } from '../measure/services/snap.service';
import { default as Draw, DrawEvent } from 'ol/interaction/Draw';
import { Vector } from 'ol/source';
import { Geometry, LineString, Polygon } from 'ol/geom';
import Snap from 'ol/interaction/Snap';
import { forkJoin } from 'rxjs';
import * as format from 'ol/format';
import Feature from 'ol/Feature';
import cuid from 'cuid';
import { Geometry as GeoJsonGeom, GeometryCollection } from 'geojson';
import { Division } from 'src/app/pages/map/models/division';
import { Paralela } from './models/paralela';

const FEATURE_DIVISION_PREFIX = '[DIVISION_TOOL]';
const FEATURE_DIVISION_LINDERO_PREFIX = '[DIVISION_TOOL][LINDERO]';
const FEATURE_DIVISION_LINESTRING_PREFIX = '[DIVISION_TOOL][LINESTRING]';
const FEATURE_DIVISION_RESULT_PREFIX = '[DIVISION_TOOL][RESULT]';
const DRAWING_DIVISION_STYLE: Style = new Style({
  fill: new Fill({
    color: 'rgba(143, 175, 0, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(143, 175, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(143, 175, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(143, 175, 0, 0.2)',
    }),
  }),
});

const DIVISION_STYLE: Style = new Style({
  stroke: new Stroke({
    color: '#8faf00',
    width: 3,
    lineDash: undefined,
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: '#8faf00',
    }),
    fill: new Fill({
      color: '#8faf00',
    }),
  }),
});

const DIVISION_STYLE_RESULT: Style = new Style({
  stroke: new Stroke({
    color: '#0000FF',
    width: 2,
    lineDash: undefined,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.2)',
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 255, 0.3)',
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.3)',
    }),
  }),
});

const FEATURE_SNAP_PREFIX = '[DIVISION_SNAP]';
const SNAP_STYLE: Style = new Style({
  stroke: new Stroke({
    color: 'rgba(241, 229, 53, 0.8)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(241, 229, 53, 0.8)',
    }),
    fill: new Fill({
      color: 'rgba(241, 229, 53, 0.8)',
    }),
  }),
});

@Component({
  selector: 'sic-predio-divison',
  templateUrl: './predio-divison.component.html',
  styleUrls: ['./predio-divison.component.scss']
})
export class PredioDivisonComponent implements OnInit, OnDestroy {
  backdropMessage: string = '...';
  showLoading: boolean = false;
  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  layerSelected: string = '';
  isLayerSelected: boolean = false;
  layerToFusion: string = '';

  mapEventHandlerId!: string;
  objectGeoSelected!: Predio | Construction;
  mapInteraction!: Draw;
  sourceInteraction: Vector<Geometry>;
  snapLayers;
  snapSource: Vector<Geometry>;
  snapInteraction!: Snap;
  mapMoveSnapHandler!: string;
  lineStringDivision = null as unknown as GeoJsonGeom;

  currentDivision: Division = {
    idDivision: '',
    lineJSON: '',
    idGeometry: '',
    user: '',
    fecha: null as unknown as Date,
    tramite: '',
    generado: false,
    geometry: null as unknown as GeoJsonGeom
  };

  linderos = new MatTableDataSource<Lindero>([]);
  linderoColumns: string[] = ['lado', 'medida', 'distancia', 'elemento', 'dirigido', 'limpiar', 'actions'];

  paralelas = new MatTableDataSource<Paralela>([]);

  folioSICAM: number = 0;
  drawActive: boolean = false;

  configSnapLayers: { name: string, snap: boolean}[] = [{
    name: 'Puntos', snap: true
  }, {
    name: 'Predio', snap: false
  }, {
    name: 'Construccion', snap: false
  }];

  constructor(
    public dialogRef: MatDialogRef<PredioDivisonComponent>,
    private mapService: MapService,
    private catastroService: CatastroService,
    private featureService: FeatureService,
    private snapService: SnapService
  ) {
    this.sourceInteraction = new Vector();
    this.snapSource = new Vector();
    this.changeConfigSnap();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_DIVISION_PREFIX);
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
    if (this.objectGeoSelected) {
      this.cleanDivision();
      this.catastroService.deleteLinderos(this.objectGeoSelected.idPredio).subscribe((_res) => {
      });
    }
  }

  callClose(): void {
    this.dialogRef.close();
  }

  handleSelectLayer() {
    // this.stopMapClicEvents();
    this.deleteDraw();
    this.deactivateInteractions();
    this.deactivateSnap();
    this.folioSICAM = 0;
    this.linderos.data = [];
    this.paralelas.data = [];
    this.layerToFusion = this.layerSelected === 'predio' ? 'predio' : 'construcción';
    this.isLayerSelected = true;
    if (this.layerToFusion !== '' && !this.mapEventHandlerId) {
      this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
    }
  }

  mapClickHandler() {
    return (evt: any) => {
      // this.showResult = false;
      if (this.objectGeoSelected) {
        this.backdropMessage = 'Limpiando predio...';
        this.cleanDivision(false);
        this.catastroService.deleteLinderos(this.objectGeoSelected.idPredio).subscribe((_res) => {
        });
      } else {
        this.deleteDraw();
      }
      this.backdropMessage = 'Obteniendo linderos...';
      this.showLoading = true;
      this.showResult = false;
      this.folioSICAM = 0;
      this.linderos.data = [];
      this.paralelas.data = [];
      this.mapService.clearDrawings(FEATURE_DIVISION_LINDERO_PREFIX);
      const [x, y] = evt.coordinate;
      switch (this.layerSelected) {
        case 'predio':
          const predioOption: PredioOption = {
            frentes: false,
            construcciones: false,
          };
          this.catastroService.getPredioAtPoint(x, y, predioOption).subscribe((res) => {
            if (res !== null) {
              this.objectGeoSelected = res;
              this.catastroService.getLinderos(this.objectGeoSelected.idPredio).subscribe((lin) => {
                this.linderos.data = lin;
                this.showLoading = false;
              });

              // Obtener linderos
              // Dibujar
              const feature = this.featureService.createFeature(
                FEATURE_DIVISION_LINDERO_PREFIX,
                this.objectGeoSelected.geometry,
                {
                  idPredio: this.objectGeoSelected.idPredio,
                  clave: this.objectGeoSelected.clave,
                  cuenta: ''//this.objectGeoSelected.cuenta,
                }
              );
              this.mapService.drawFeature(feature, DIVISION_STYLE);

                /*const index = this.prediosSelected.findIndex(
                  (p) => p.idPredio === res.idPredio
                );
                if (index === -1) {
                  this.prediosSelected.push(res);
                  this.predios.data = this.prediosSelected;
                  
                }*/
            } else {
              this.showLoading = false;
            }
          });
          break;
        case 'construction':
          this.catastroService.getConstructionAtPoint(x, y).subscribe((res) => {
            if (res !== null) {
              this.objectGeoSelected = res;
              this.linderos.data = [];
              const feature = this.featureService.createFeature(
                FEATURE_DIVISION_LINDERO_PREFIX,
                this.objectGeoSelected.geometry,
                {
                  idConstruccion: this.objectGeoSelected.idConstruccion,
                  bloque: this.objectGeoSelected.bloque,
                  niveles: this.objectGeoSelected.niveles,
                  clasificacion: this.objectGeoSelected.clasificacion,
                }
              );
              this.mapService.drawFeature(feature, DIVISION_STYLE);
              this.showLoading = false;

              /*const index = this.constructionsSelected.findIndex(
                (c) => c.idConstruccion === res.idConstruccion
              );
              if (index === -1) {
                this.constructionsSelected.push(res);
                this.constructions.data = this.constructionsSelected;
              }*/
            } else {
              this.showLoading = false;
            }
          });
          break;
        default:
          break;
      }
    };
  }

  moveToLindero(lindero: Lindero) {
    const feature = this.featureService.createFeature(
      FEATURE_DIVISION_LINDERO_PREFIX,
      lindero.geometry,
      {
        idLindero: lindero.idLindero,
        idPredio: lindero.idPredio,
      }
    );
    this.mapService.clearDrawings(FEATURE_DIVISION_LINDERO_PREFIX);
    this.mapService.drawFeature(feature, DIVISION_STYLE);
    const extent = feature.getGeometry()?.getExtent();
    this.mapService.getMapById(this.mapService.default).moveTo(extent as Extent);
  }

  moveToParalela(paralela: Paralela) {
    const feature = this.featureService.createFeature(
      FEATURE_DIVISION_LINDERO_PREFIX,
      paralela.geometry,
      {
        idParalela: paralela.idParalela,
        idLindero: paralela.idLindero,
        idPredio: paralela.idPredio,
      }
    );
    this.mapService.clearDrawings(FEATURE_DIVISION_LINDERO_PREFIX);
    this.mapService.drawFeature(feature, DIVISION_STYLE);
    const extent = feature.getGeometry()?.getExtent();
    this.mapService.getMapById(this.mapService.default).moveTo(extent as Extent);
  }

  divideLindero(row: Lindero) {
    this.backdropMessage = 'Dividiendo lindero...';
    this.showLoading = true;
    this.catastroService.divideLindero(row).subscribe((_res) => {
      this.showLoading = false;
      this.resultMessage = 'Lindero seleccionado dividido';
      this.resultCorrect = true;
      this.showResult = true;
    }, (error) => {
      console.log(error);
      this.showLoading = false;
      this.resultMessage = 'Error al dividir lindero';
      this.resultCorrect = false;
      this.showResult = true;
    });
  }

  divideParalela(row: Paralela) {
    this.backdropMessage = 'Dividiendo paralela...';
    this.showLoading = true;
    const linderoTemp: Lindero = {
      idLindero: row.idParalela,
      idPredio: row.idPredio,
      usuario: row.user,
      fecha: row.fecha,
      procesado: true,
      lado: row.lado,
      distancia: row.distancia,
      geometry: row.geometry,
      distance: row.distance,
      element: row.element,
      isDirected: row.isDirected,
      needToClean: row.needToClean
    };
    this.catastroService.divideLindero(linderoTemp).subscribe((_res) => {
      this.showLoading = false;
      this.resultMessage = 'Paralela seleccionada dividida';
      this.resultCorrect = true;
      this.showResult = true;
    }, (error) => {
      console.log(error);
      this.showLoading = false;
      this.resultMessage = 'Error al dividir paralela';
      this.resultCorrect = false;
      this.showResult = true;
    });
  }
  

  getParalela(row: Lindero) {
    this.backdropMessage = 'Generando paralela...';
    this.showLoading = true;
    let id = '';
    this.catastroService.generateParalela(row).subscribe((_res) => {
      switch (this.layerSelected) {
        case 'predio':
          id = (this.objectGeoSelected as Predio).idPredio;
          break;
        case 'construction':
          id = (this.objectGeoSelected as Construction).idConstruccion;
          break;
        default:
          break;
      }
      this.catastroService.getParalelas(id).subscribe((resultParalelas) => {
        this.paralelas.data = resultParalelas;
        this.showLoading = false;
        this.resultMessage = 'Paralelas generadas al lindero';
        this.resultCorrect = true;
        this.showResult = true;
      });
    }, (error) => {
      console.log(error);
      this.showLoading = false;
      this.resultMessage = 'Error al generar paralelas';
      this.resultCorrect = false;
      this.showResult = true;
    });
  }

  activateSnapLayer(evt, layer: string) {
    const index = this.configSnapLayers.findIndex((config) => config.name === layer);
    if (index !== -1) {
      this.configSnapLayers[index].snap = evt.checked;
      this.changeConfigSnap();
    }
    this.deactivateSnap();
    if (this.drawActive) {
      this.activateSnap();
    }
  }

  drawDivision(evt) {
    this.drawActive = evt.checked;
    this.deactivateInteractions();
    this.deactivateSnap();
    this.stopMapClicEvents(this.drawActive);
    if (this.drawActive) {
      this.mapService.clearDrawings(FEATURE_DIVISION_LINESTRING_PREFIX);
      this.drawLine();
      this.activateSnap();
    }
  }

  deleteDraw() {
    this.mapService.clearDrawings(FEATURE_DIVISION_LINESTRING_PREFIX);
    this.lineStringDivision = null as unknown as GeoJsonGeom;
  }

  cleanDraw() {
    this.deleteDraw();
    this.deactivateInteractions();
    this.deactivateSnap();
    this.drawLine();
    this.activateSnap();
  }

  cleanDivision(showload = true) {
    if (showload) {
      this.backdropMessage = 'Limpiando predio...';
      this.showLoading = true;
    }
    this.showResult = false;
    this.deleteDraw();
    this.catastroService.cleanPredioDivision(this.objectGeoSelected.idPredio).subscribe((_res) => {
      this.paralelas.data = [];
      if (showload) {
        this.showLoading = false;
      }
    }, (error) => {
      console.log(error);
      if (showload) {
        this.showLoading = false;
      }
    });
  }

  generateDivision() {
    this.backdropMessage = 'Generando subdivisión...';
    this.showLoading = true;
    let data = '';
    let id = '';
    const claves: string[] = [];
    switch (this.layerSelected) {
      case 'predio':
        id = (this.objectGeoSelected as Predio).idPredio;
        claves.push((this.objectGeoSelected as Predio).clave);
        const dataPredio = {
          Predio: this.lineStringDivision
        }
        data = JSON.stringify(dataPredio);
        break;
      case 'construction':
        id = (this.objectGeoSelected as Construction).idConstruccion;
        const dataConstruction = {
          Construccion: this.lineStringDivision
        }
        data = JSON.stringify(dataConstruction);
        break;
      default:
        this.showLoading = false;
        break;
    }
    if (data !== '') {
      this.catastroService.createDivision(data, id).subscribe((res) => {
        this.currentDivision = res;
        if (this.currentDivision.geometry === null) {
          this.resultMessage = 'La subdivisión no es posible';
          this.resultCorrect = false;
        } else {
          this.catastroService.validateDivision(claves).subscribe((isValid) => {
            this.folioSICAM = isValid;
            if (this.folioSICAM !== 0) {
              this.resultCorrect = true;
              this.resultMessage = 'Subdivisión generada';
              if (this.currentDivision.geometry.type === 'GeometryCollection') {
                const features: Feature<Geometry>[] = [];
                const geometries = this.currentDivision.geometry as GeometryCollection;
                geometries.geometries.map((g) => {
                  features.push(
                    this.featureService.createFeature(
                      FEATURE_DIVISION_RESULT_PREFIX,
                      g,
                      {
                        idDivision: this.currentDivision.idDivision,
                        json: this.currentDivision.lineJSON,
                        idGeom: this.currentDivision.idGeometry,
                        user: this.currentDivision.user,
                      }
                    )
                  );
                });
                this.mapService.getMapById(this.mapService.default).drawFeatures(features, DIVISION_STYLE_RESULT);
                const extent = features[0].getGeometry()?.getExtent();
                this.mapService.getMapById(this.mapService.default).moveTo(extent as Extent);
              }
            } else {
              this.resultCorrect = false;
              this.resultMessage = 'Subdivisión no válida';
            }
            this.mapService.clearDrawings(FEATURE_DIVISION_LINESTRING_PREFIX);
            this.showResult = true;
            this.showLoading = false;
          } , (err) => {
            console.log(err);
            this.showResult = true;
            this.showLoading = false;
            this.resultCorrect = false;
            this.resultMessage = 'Error al validar subdivisión';
          });
        }
      });
    }
  }

  applyDivision() {
    this.backdropMessage = 'Aplicando subdivisión...';
    this.showLoading = true;
    this.showResult = false;
    if (this.folioSICAM !== 0) {
      if (this.currentDivision.idDivision !== '') {
        if (this.currentDivision.geometry !== null) {
          this.catastroService.applyDivision(this.currentDivision.idDivision).subscribe((res) => {
            if (res) {
              /*const feature = this.featureService.createFeature(
                FEATURE_DIVISION_RESULT_PREFIX,
                this.currentDivision.geometry,
                {
                  idDivision: this.currentDivision.idDivision,
                  json: this.currentDivision.lineJSON,
                  idGeom: this.currentDivision.idGeometry,
                  user: this.currentDivision.user,
                }
              );
              const extent = feature.getGeometry()?.getExtent();
              this.mapService
                .getMapById(this.mapService.default)
                .moveTo(extent as Extent);*/
              this.cleanResults();
              this.resultMessage = 'Subdivisión aplicada';
              this.resultCorrect = true;
              this.showLoading = false;
            } else {
              this.resultMessage = 'Error al aplicar subdivisión';
              this.resultCorrect = false;
              this.showLoading = false;
            }
            this.showResult = true;
          })
        } else {
          this.resultMessage = 'No se puede aplicar esta subdivisión';
          this.resultCorrect = false;
          this.showResult = true;
          this.showLoading = false;
        }
      } else {
        this.resultMessage = 'No se ha generado la subdivisión';
        this.resultCorrect = false;
        this.showResult = true;
        this.showLoading = false;
      }
    } else {
      this.resultMessage = 'La subdivisión debe ser valida';
      this.resultCorrect = false;
      this.showResult = true;
      this.showLoading = false;
    }
  }

  deactivateInteractions() {
    if (this.mapInteraction) {
      this.mapService.removeInteraction(this.mapInteraction);
    }
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

  stopMapClicEvents(active: boolean) {
    if (this.layerToFusion === '') {
      if (active) {
        if (!this.mapEventHandlerId) {
          this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, () => {}, 'HIGH');
        }
      } else {
        this.mapService.removeEventHandler(this.mapEventHandlerId);
        this.mapEventHandlerId = null as unknown as string;
      }
    } else {
      if (active) {
        this.mapService.removeEventHandler(this.mapEventHandlerId);
        this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, () => {}, 'HIGH');
      } else {
        this.mapService.removeEventHandler(this.mapEventHandlerId);
        this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
      }
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
              dataProjection: 'EPSG:6368',
              featureProjection: 'EPSG:6368',
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

  drawLine() {
    this.mapInteraction = new Draw({
      source: this.sourceInteraction,
      type: 'LineString',
      style: DRAWING_DIVISION_STYLE,
    });

    this.mapService.addInteraction(this.mapInteraction);

    this.mapInteraction.once('drawstart', (evt: DrawEvent) => {
      // const value = evt.feature.getGeometry().getLength();
      //this.currentTooltip = this.createMeasureTooltip(this.getLongitudeString(value));
      //this.currentTooltip.setPosition(evt.feature.getGeometry().getLastCoordinate());
      //this.mapService.addOverlay(this.currentTooltip);

      /*evt.feature.getGeometry().on('change', (_) => {
        this.currentTooltip.setPosition(evt.feature.getGeometry().getLastCoordinate());
        this.currentTooltip.getElement()!.innerHTML = this.getLongitudeString(evt.feature.getGeometry().getLength());
      });*/
    });

    this.mapInteraction.once('drawend', (evt: DrawEvent) => {
      // this.removeCurrentTooltip();
      const feat: Feature<LineString> = evt.feature.clone();
      feat.setId(`${FEATURE_DIVISION_LINESTRING_PREFIX}.${cuid()}`);
      this.lineStringDivision = this.featureService.parseFeatureGeometry2Geojson(feat);
      this.mapService.drawFeature(feat, DIVISION_STYLE);

      // const value = feat.getGeometry()?.getLength();
      // const tooltip = this.createMeasureTooltip(this.getLongitudeString(value as number));
      // tooltip.setPosition(getCenter(feat.getGeometry()?.getExtent() as number[]));
      // this.mapService.addOverlay(tooltip);
      // this.toolTips.push(tooltip);
    });
  }

  cleanResults() {
    this.mapService.clearDrawings(FEATURE_DIVISION_PREFIX);
    this.cleanDivision();
    this.currentDivision = {
      idDivision: '',
      lineJSON: '',
      idGeometry: '',
      user: '',
      fecha: null as unknown as Date,
      tramite: '',
      generado: false,
      geometry: null as unknown as GeoJsonGeom
    };
    this.catastroService.deleteLinderos(this.objectGeoSelected.idPredio).subscribe((_res) => {
      this.objectGeoSelected = null as unknown as Predio;
    });
    this.linderos.data = [];
    this.paralelas.data = [];
    this.folioSICAM = 0;
  }

  changeConfigSnap() {
    this.snapService.getConfiguration().subscribe((l) => {
      this.snapLayers = l.filter((snapLayer) => {
        const canSnap = this.configSnapLayers.find((config) => config.name === snapLayer.layer);
        if (canSnap !== undefined && canSnap.snap) {
          return snapLayer;
        }
      });
    });
    
  }
}
