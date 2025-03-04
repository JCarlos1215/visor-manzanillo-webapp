import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { Construction } from 'src/app/pages/map/models/construction';
import { Predio } from 'src/app/pages/map/models/predio';
import { PredioOption } from 'src/app/pages/map/models/predio-option';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { MatTableDataSource } from '@angular/material/table';
import { Geometry } from 'geojson';
import { Extent } from 'ol/extent';
import { Fusion } from 'src/app/pages/map/models/fusion';
import { AvaluoService } from 'src/app/pages/map/services/avaluo.service';

const FEATURE_FUSION_PREFIX = '[FUSION_TOOL]';
const FUSION_STYLE: Style = new Style({
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

const FUSION_STYLE_RESULT: Style = new Style({
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

@Component({
  selector: 'sic-predio-fusion',
  templateUrl: './predio-fusion.component.html',
  styleUrls: ['./predio-fusion.component.scss'],
})
export class PredioFusionComponent implements OnInit, AfterViewInit, OnDestroy {
  backdropMessage: string = '...';
  showLoading: boolean = false;

  layerSelected: string = '';
  isLayerSelected: boolean = false;
  layerToFusion: string = '';

  predios = new MatTableDataSource<Predio>([]);
  predioColumns: string[] = [
    'clave',
    'subpredio',
    'cuenta',
    'areaCartografica',
    'actions',
  ];
  constructions = new MatTableDataSource<Construction>([]);
  constructionColumns: string[] = [
    'bloque',
    'niveles',
    'clasificacion',
    'areaConstruction',
    'actions',
  ];

  mapEventHandlerId!: string;
  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  prediosSelected: Predio[] = [];
  predioPredominante: any = {
    idPredio: '',
    predio: '',
    edificio: '',
    unidad: '',
    cuenta: '',
    clave: '',
    folioreal: '',
    CURT: '',
    idambito: '',
    casoVinculoPadron: 0,
    frente: [],
    geometry: null as unknown as Geometry,
    construction: [],
    area: 0,
  };
  constructionsSelected: Construction[] = [];
  constructionPredominante: any = {
    idConstruccion: '',
    bloque: '',
    niveles: 0,
    idtechumbre: '',
    clasificacion: '',
    alturaPromedio: 0,
    alturaMedia: 0,
    alturaMinima: 0,
    alturaMaxima: 0,
    alturaMayoritaria: 0,
    idCons: '',
    idPredio: '',
    sc: 0,
    geometry: null as unknown as Geometry,
  };

  currentFusion: Fusion = {
    idFusion: '',
    json: '',
    user: '',
    fecha: null as unknown as Date,
    tramite: '',
    generado: false,
    geometry: null as unknown as Geometry,
  };

  folioSICAM: number = 0;

  constructor(
    public dialogRef: MatDialogRef<PredioFusionComponent>,
    private mapService: MapService,
    private catastroService: CatastroService,
    private featureService: FeatureService,
    private avaluoService: AvaluoService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_FUSION_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  callClose(): void {
    this.dialogRef.close();
  }

  handleSelectLayer() {
    this.layerToFusion =
      this.layerSelected === 'predio' ? 'predios' : 'construcciones';
    this.isLayerSelected = true;
    this.folioSICAM = 0;
    if (this.layerToFusion !== '' && !this.mapEventHandlerId) {
      this.mapEventHandlerId = this.mapService.addEventHandler(
        MapEventType.SINGLECLICK,
        this.mapClickHandler(),
        'HIGH'
      );
    }
  }

  mapClickHandler() {
    return (evt: any) => {
      this.showResult = false;
      this.backdropMessage = 'Obteniendo datos...';
      this.showLoading = true;
      this.folioSICAM = 0;
      const [x, y] = evt.coordinate;
      switch (this.layerSelected) {
        case 'predio':
          const predioOption: PredioOption = {
            frentes: false,
            construcciones: false,
          };
          this.catastroService
            .getPredioAtPoint(x, y, predioOption)
            .subscribe((res) => {
              if (res !== null) {
                const index = this.prediosSelected.findIndex(
                  (p) => p.idPredio === res.idPredio
                );
                if (index === -1) {
                  this.prediosSelected.push(res);
                  this.predios.data = this.prediosSelected;
                  const feature = this.featureService.createFeature(
                    `${FEATURE_FUSION_PREFIX}.${res.idPredio}`,
                    res.geometry,
                    {
                      idPredio: res.idPredio,
                      clave: res.clave,
                      cuenta: ''//res.cuenta,
                    }
                  );
                  this.mapService.drawFeature(feature, FUSION_STYLE);
                }
              }
              this.showLoading = false;
            });
          break;
        case 'construction':
          this.catastroService.getConstructionAtPoint(x, y).subscribe((res) => {
            if (res !== null) {
              const index = this.constructionsSelected.findIndex(
                (c) => c.idConstruccion === res.idConstruccion
              );
              if (index === -1) {
                this.constructionsSelected.push(res);
                this.constructions.data = this.constructionsSelected;
                const feature = this.featureService.createFeature(
                  `${FEATURE_FUSION_PREFIX}.${res.idConstruccion}`,
                  res.geometry,
                  {
                    idConstruccion: res.idConstruccion,
                    bloque: res.bloque,
                    niveles: res.niveles,
                    clasificacion: res.clasificacion,
                  }
                );
                this.mapService.drawFeature(feature, FUSION_STYLE);
              }
            }
            this.showLoading = false;
          });
          break;
        default:
          break;
      }
    };
  }

  deleteSelected(id: string) {
    switch (this.layerSelected) {
      case 'predio':
        const prediosFilter = this.prediosSelected.filter(
          (p) => p.idPredio !== id
        );
        this.prediosSelected = prediosFilter;
        this.predios.data = this.prediosSelected;
        this.mapService.clearDrawings(`${FEATURE_FUSION_PREFIX}.${id}`);
        this.predioPredominante = {
          idPredio: '',
          predio: '',
          edificio: '',
          unidad: '',
          cuenta: '',
          clave: '',
          folioreal: '',
          CURT: '',
          idambito: '',
          casoVinculoPadron: 0,
          frente: [],
          geometry: null as unknown as Geometry,
          construction: [],
          area: 0,
        };
        break;
      case 'construction':
        const constructionFilter = this.constructionsSelected.filter(
          (c) => c.idConstruccion !== id
        );
        this.constructionsSelected = constructionFilter;
        this.constructions.data = this.constructionsSelected;
        this.mapService.clearDrawings(`${FEATURE_FUSION_PREFIX}.${id}`);
        this.constructionPredominante = {
          idConstruccion: '',
          bloque: '',
          niveles: 0,
          idtechumbre: '',
          clasificacion: '',
          alturaPromedio: 0,
          alturaMedia: 0,
          alturaMinima: 0,
          alturaMaxima: 0,
          alturaMayoritaria: 0,
          idCons: '',
          idPredio: '',
          sc: 0,
          geometry: null as unknown as Geometry,
        };
        break;
      default:
        break;
    }
  }

  selectedPredominante(row: Predio | Construction) {
    let feature;
    switch (this.layerSelected) {
      case 'predio':
        this.predioPredominante = row as Predio;
        feature = this.featureService.createFeature(
          FEATURE_FUSION_PREFIX,
          this.predioPredominante.geometry,
          {
            idPredio: this.predioPredominante.idPredio,
            clave: this.predioPredominante.clave,
            cuenta: this.predioPredominante.cuenta,
          }
        );
        break;
      case 'construction':
        this.constructionPredominante = row as Construction;
        feature = this.featureService.createFeature(
          FEATURE_FUSION_PREFIX,
          this.constructionPredominante.geometry,
          {
            idConstruccion: this.constructionPredominante.idConstruccion,
            bloque: this.constructionPredominante.bloque,
            niveles: this.constructionPredominante.niveles,
            clasificacion: this.constructionPredominante.clasificacion,
          }
        );
        break;
      default:
        break;
    }
    const extent = feature.getGeometry()?.getExtent();
    this.mapService
      .getMapById(this.mapService.default)
      .moveTo(extent as Extent);
  }

  generateFusion() {
    this.backdropMessage = 'Generando fusión...';
    this.showLoading = true;
    let data = '';
    const claves: string[] = [];
    switch (this.layerSelected) {
      case 'predio':
        const dataPredio = {
          Predio: this.prediosSelected.map((p) => {
            claves.push(p.clave);
            return { id: p.idPredio };
          }),
        };
        data = JSON.stringify(dataPredio);
        break;
      case 'construction':
        const dataConstruction = {
          Construccion: this.constructionsSelected.map((c) => {
            return { id: c.idConstruccion };
          }),
        };
        data = JSON.stringify(dataConstruction);
        break;
      default:
        this.showLoading = false;
        break;
    }

    if (data !== '') {
      this.catastroService.createFusion(data).subscribe((res) => {
        this.currentFusion = res;
        if (this.currentFusion.geometry === null) {
          this.resultMessage = 'La fusión no es posible';
          this.resultCorrect = false;
          this.showResult = true;
          this.showLoading = false;
        } else {
          if (this.layerSelected === 'predio') {
            this.catastroService.validateFusion(claves).subscribe(
              (isValid) => {
                this.folioSICAM = isValid;
                if (this.folioSICAM !== 0) {
                  this.catastroService.validateFusionOwnerDebt(claves).subscribe((messageValid) => {
                    if (messageValid === 'Procede') {
                      this.resultCorrect = true;
                      this.resultMessage = 'Fusión generada';

                      const feature = this.featureService.createFeature(
                        FEATURE_FUSION_PREFIX,
                        this.currentFusion.geometry,
                        {
                          idFusion: this.currentFusion.idFusion,
                          json: this.currentFusion.json,
                          user: this.currentFusion.user,
                        }
                      );
                      this.mapService.drawFeature(feature, FUSION_STYLE_RESULT);
                      const extent = feature.getGeometry()?.getExtent();
                      this.mapService.getMapById(this.mapService.default).moveTo(extent as Extent);
                    } else {
                      this.folioSICAM = 0;
                      this.resultCorrect = false;
                      this.resultMessage = messageValid;
                    }
                    this.showResult = true;
                    this.showLoading = false;
                  }, (error) => {
                    console.log(error);
                    this.showResult = true;
                    this.showLoading = false;
                    this.resultCorrect = false;
                    this.resultMessage = 'Error al validar mismo propietario y si adeuda';
                  });
                } else {
                  this.resultCorrect = false;
                  this.resultMessage = 'Fusión no válida';
                  this.showResult = true;
                  this.showLoading = false;
                }
              },
              (err) => {
                console.log(err);
                this.showResult = true;
                this.showLoading = false;
                this.resultCorrect = false;
                this.resultMessage = 'Error al validar fusión';
              }
            );
          } else {
            this.folioSICAM = -1;
            this.resultCorrect = true;
            this.resultMessage = 'Fusión generada';

            const feature = this.featureService.createFeature(
              FEATURE_FUSION_PREFIX,
              this.currentFusion.geometry,
              {
                idFusion: this.currentFusion.idFusion,
                json: this.currentFusion.json,
                user: this.currentFusion.user,
              }
            );
            this.mapService.drawFeature(feature, FUSION_STYLE_RESULT);
            const extent = feature.getGeometry()?.getExtent();
            this.mapService
              .getMapById(this.mapService.default)
              .moveTo(extent as Extent);

            this.showResult = true;
            this.showLoading = false;
          }
        }
      });
    } else {
      this.resultMessage = 'Sin datos para fusionar';
      this.resultCorrect = false;
      this.showResult = true;
      this.showLoading = false;
    }
  }

  applyFusion() {
    this.backdropMessage = 'Aplicando fusión...';
    this.showLoading = true;
    this.showResult = false;
    if (this.folioSICAM !== 0) {
      if (this.currentFusion.idFusion !== '') {
        if (this.currentFusion.geometry !== null) {
          switch (this.layerSelected) {
            case 'predio':
              this.catastroService
                .applyFusion(
                  this.currentFusion.idFusion,
                  this.predioPredominante.idPredio
                )
                .subscribe((res) => {
                  if (res) {
                    const feature = this.featureService.createFeature(
                      FEATURE_FUSION_PREFIX,
                      this.currentFusion.geometry,
                      {
                        idFusion: this.currentFusion.idFusion,
                        json: this.currentFusion.json,
                        user: this.currentFusion.user,
                      }
                    );
                    const extent = feature.getGeometry()?.getExtent();
                    this.mapService
                      .getMapById(this.mapService.default)
                      .moveTo(extent as Extent);

                    this.cleanFusion();
                    this.resultMessage = 'Fusión de predios aplicada';
                    this.resultCorrect = true;
                    this.showLoading = false;

                    /*this.backdropMessage = 'Cancelando predios...';
                    const canceledPredios = this.prediosSelected.filter(
                      (p) => p.idPredio !== this.predioPredominante.idPredio
                    );
                    console.log('Predios a cancelar', canceledPredios);*/

                    /*this.backdropMessage = 'Ejecutando avalúo...';
                    this.avaluoService
                      .executeSimpleAvaluo(this.predioPredominante.idPredio)
                      .subscribe(
                        (_resAvaluo) => {
                          this.avaluoService.getAvaluoData(this.predioPredominante.idPredio).subscribe((_resDataAvaluo) => {
                            //this.backdropMessage = 'Enviando avalúo a SICAM...';
                            this.cleanFusion();
                            this.resultMessage = 'Fusión de predios aplicada';
                            this.resultCorrect = true;
                            this.showLoading = false;
                            this.externalSICAMService.saveAvaluoSICAM(resDataAvaluo.avaluoSICAM, 'Fusión prueba', this.folioSICAM.toString()).subscribe((res: any) => {
                              this.cleanFusion();
                              if (res.status === 'ok') {
                                this.resultMessage = 'Fusión de predios aplicada';
                                this.resultCorrect = true;
                                this.showLoading = false;
                              } else {
                                this.resultCorrect = false;
                                this.resultMessage = 'Error al enviar a SICAM';
                                this.showLoading = false;
                              }
                            }, (error) => {
                              console.log(error);
                              this.resultMessage = 'Error al usar servicio de SICAM.';
                              this.resultCorrect = false;
                              this.showLoading = false;
                            });
                          }, (_error) => {
                            this.resultMessage = 'Error al obtener datos del avalúo.';
                            this.resultCorrect = false;
                            this.showLoading = false;
                          });
                        },
                        (_error) => {
                          this.resultMessage =
                            'Error al ejecutar la función para el avalúo individual';
                          this.resultCorrect = false;
                          this.showLoading = false;
                        }
                      );*/
                  } else {
                    this.resultMessage = 'Error al aplicar fusión de predios';
                    this.resultCorrect = false;
                    this.showLoading = false;
                  }
                  this.showResult = true;
                });
              break;
            case 'construction':
              this.catastroService
                .applyFusion(
                  this.currentFusion.idFusion,
                  this.constructionPredominante.idConstruccion
                )
                .subscribe((res) => {
                  if (res) {
                    const feature = this.featureService.createFeature(
                      FEATURE_FUSION_PREFIX,
                      this.currentFusion.geometry,
                      {
                        idFusion: this.currentFusion.idFusion,
                        json: this.currentFusion.json,
                        user: this.currentFusion.user,
                      }
                    );
                    const extent = feature.getGeometry()?.getExtent();
                    this.mapService
                      .getMapById(this.mapService.default)
                      .moveTo(extent as Extent);
                    this.resultMessage = 'Fusión de construcciones aplicada';
                    this.resultCorrect = true;
                    this.showLoading = false;
                  } else {
                    this.resultMessage =
                      'Error al aplicar fusión de construcciones';
                    this.resultCorrect = false;
                    this.showLoading = false;
                  }
                  this.showResult = true;
                  this.cleanFusion();
                });
              break;
            default:
              break;
          }
        } else {
          this.resultMessage = 'No se puede aplicar esta fusión';
          this.resultCorrect = false;
          this.showResult = true;
          this.showLoading = false;
        }
      } else {
        this.resultMessage = 'No se ha generado la fusión';
        this.resultCorrect = false;
        this.showResult = true;
        this.showLoading = false;
      }
    } else {
      this.resultMessage = 'La fusión debe ser valida';
      this.resultCorrect = false;
      this.showResult = true;
      this.showLoading = false;
    }
  }

  cleanFusion() {
    this.mapService.clearDrawings(FEATURE_FUSION_PREFIX);
    this.prediosSelected = [];
    this.predioPredominante = {
      idPredio: '',
      predio: '',
      edificio: '',
      unidad: '',
      cuenta: '',
      clave: '',
      folioreal: '',
      CURT: '',
      idambito: '',
      casoVinculoPadron: 0,
      frente: [],
      geometry: null as unknown as Geometry,
      construction: [],
      area: 0,
    };
    this.constructionsSelected = [];
    this.constructionPredominante = {
      idConstruccion: '',
      bloque: '',
      niveles: 0,
      idtechumbre: '',
      clasificacion: '',
      alturaPromedio: 0,
      alturaMedia: 0,
      alturaMinima: 0,
      alturaMaxima: 0,
      alturaMayoritaria: 0,
      idCons: '',
      idPredio: '',
      sc: 0,
      geometry: null as unknown as Geometry,
    };
    this.currentFusion = {
      idFusion: '',
      json: '',
      user: '',
      fecha: null as unknown as Date,
      tramite: '',
      generado: false,
      geometry: null as unknown as Geometry,
    };
    this.constructions.data = [];
    this.predios.data = [];
    this.folioSICAM = 0;
  }
}
