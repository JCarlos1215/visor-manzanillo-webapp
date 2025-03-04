import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { Construction } from 'src/app/pages/map/models/construction';
import { EditionAttribute } from 'src/app/pages/map/models/edition-attribute';
import { EditionLayer } from 'src/app/pages/map/models/edition-layer';
import { Predio } from 'src/app/pages/map/models/predio';
import { PredioOption } from 'src/app/pages/map/models/predio-option';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { Colonia } from '../multiple-avaluo/models/colonia';
import { Manzana } from '../multiple-avaluo/models/manzana';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { firstValueFrom } from 'rxjs';
import { NumeroExterior } from 'src/app/pages/map/models/numero-exterior';
import { EditionObject } from 'src/app/pages/map/models/edition-object';

const FEATURE_ATTRIBUTE_EDITION_PREFIX = '[ATTRIBUTE_EDITION_TOOL]';
const ATTRIBUTE_EDITION_STYLE: Style = new Style({
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

@Component({
  selector: 'sic-attribute-edition',
  templateUrl: './attribute-edition.component.html',
  styleUrls: ['./attribute-edition.component.scss']
})
export class AttributeEditionComponent implements OnInit, OnDestroy {
  backdropMessage: string = '...';
  showLoading: boolean = false;

  mapEventHandlerId!: string;
  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  layerSelected!: EditionLayer;
  isLayerSelected: boolean = false;
  layerEdition: string = '';

  objectGeoSelected!: Predio | Construction | Colonia | Manzana | NumeroExterior | EditionObject;
  idGeoSelected: string = '';
  hasValidObject = false;
  showQuestion = false;
  showDelete = false;

  editionLayers!: EditionLayer[];
  editionAttributes = new MatTableDataSource<EditionAttribute>([]);
  attributeColumns: string[] = ['key', 'value'];

  constructor(
    public dialogRef: MatDialogRef<AttributeEditionComponent>,
    private mapService: MapService,
    private catastroService: CatastroService,
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
    this.backdropMessage = 'Cargando capas editables...';
    this.showLoading = true;
    this.catastroService.getEditionLayers().subscribe((result) => {
      this.editionLayers = result;
      this.showLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  callClose(): void {
    this.dialogRef.close();
  }

  handleSelectLayer() {
    this.backdropMessage = 'Cargando atributos editables...';
    this.showLoading = true;
    this.showResult = false;
    this.showQuestion = false;
    this.showDelete = false;
    this.hasValidObject = false;
    this.isLayerSelected = true;
    switch (this.layerSelected.name) {
      case 'Predio':
        this.layerEdition = 'predio';
        break;
      case 'Construccion':
        this.layerEdition = 'construcción';
        break;
      case 'Manzana':
        this.layerEdition = 'manzana';
        break;
      case 'Colonia':
        this.layerEdition = 'colonia';
        break;
      case 'PredioNumeroExterior':
        this.layerEdition = 'número exterior';
        break;
      default:
        this.layerEdition = this.layerSelected.layerName.toLowerCase();
        break;
    }
    this.catastroService.getEditionAttributes(this.layerSelected.idLayer).subscribe((res) => {
      this.editionAttributes.data = res;
      this.showLoading = false;
    });
    if (this.layerEdition !== '' && !this.mapEventHandlerId) {
      this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
    }
  }

  mapClickHandler() {
    return (evt: any) => {
      this.showResult = false;
      this.showQuestion = false;
      this.showDelete = false;
      this.hasValidObject = false;
      this.backdropMessage = 'Cargando datos...';
      this.showLoading = true;
      const [x, y] = evt.coordinate;
      /*switch (this.layerSelected.name) {
        case 'Predio':
          const predioOption: PredioOption = {
            frentes: false,
            construcciones: false,
          };
          this.catastroService.getPredioAtPoint(x, y, predioOption).subscribe((res) => {
            if (res !== null) {
              this.objectGeoSelected = res as Predio;
              this.idGeoSelected = this.objectGeoSelected.idPredio;
              this.hasValidObject = true;
              const feature = this.featureService.createFeature(
                FEATURE_ATTRIBUTE_EDITION_PREFIX,
                this.objectGeoSelected.geometry,
                {
                  idPredio: this.objectGeoSelected.idPredio,
                  clave: this.objectGeoSelected.clave,
                  cuenta: this.objectGeoSelected.cuenta,
                }
              );
              this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
              this.mapService.drawFeature(feature, ATTRIBUTE_EDITION_STYLE);
              this.editionAttributes.data.map((attr) => {
                const data = this.objectGeoSelected[attr.attributeName];
                attr.value = data;
              });
            } else {
              this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
            }
            this.showLoading = false;
          });
        break;
      case 'Construccion':
        this.catastroService.getConstructionAtPoint(x, y).subscribe((res) => {
          if (res !== null) {
            this.objectGeoSelected = res as Construction;
            this.idGeoSelected = this.objectGeoSelected.idConstruccion;
            this.hasValidObject = true;
            const feature = this.featureService.createFeature(
              FEATURE_ATTRIBUTE_EDITION_PREFIX,
              this.objectGeoSelected.geometry,
              {
                idConstruccion: this.objectGeoSelected.idConstruccion,
                bloque: this.objectGeoSelected.bloque,
                nivel: this.objectGeoSelected.niveles,
              }
            );
            this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
            this.mapService.drawFeature(feature, ATTRIBUTE_EDITION_STYLE);
            this.editionAttributes.data.map((attr) => {
              const data = this.objectGeoSelected[attr.attributeName];
              attr.value = data;
            });
          } else {
            this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
          }
          this.showLoading = false;
        });
        break;
        case 'Manzana':
          this.catastroService.getManzanaAtPoint(x, y).subscribe((res) => {
            if (res !== null) {
              this.objectGeoSelected = res as Manzana;
              this.idGeoSelected = this.objectGeoSelected.idManzana;
              this.hasValidObject = true;
              const feature = this.featureService.createFeature(
                FEATURE_ATTRIBUTE_EDITION_PREFIX,
                this.objectGeoSelected.geometry,
                { 
                  idManzana: this.objectGeoSelected.idManzana,
                  clave: this.objectGeoSelected.clave
                }
              );
              this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
              this.mapService.drawFeature(feature, ATTRIBUTE_EDITION_STYLE);
              this.editionAttributes.data.map((attr) => {
                const data = this.objectGeoSelected[attr.attributeName];
                attr.value = data;
              });
            } else {
              this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
            }
            this.showLoading = false;
          });
          break;
        case 'Colonia':
          this.catastroService.getColoniaAtPoint(x, y).subscribe((res) => {
            if (res !== null) {
              this.objectGeoSelected = res as Colonia;
              this.idGeoSelected = this.objectGeoSelected.idColonia;
              this.hasValidObject = true;
              const feature = this.featureService.createFeature(
                FEATURE_ATTRIBUTE_EDITION_PREFIX,
                this.objectGeoSelected.geometry,
                { 
                  idColonia: this.objectGeoSelected.idColonia,
                  nombre: this.objectGeoSelected.nombre
                }
              );
              this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
              this.mapService.drawFeature(feature, ATTRIBUTE_EDITION_STYLE);
              this.editionAttributes.data.map((attr) => {
                const data = this.objectGeoSelected[attr.attributeName];
                attr.value = data;
              });
            } else {
              this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
            }
            this.showLoading = false;
          });
          break;
        case 'PredioNumeroExterior':
          this.catastroService.getNumeroExteriorAtPoint(x, y).subscribe((res) => {
            if (res !== null) {
              this.objectGeoSelected = res as NumeroExterior;
              this.idGeoSelected = this.objectGeoSelected.idNumeroExterior;
              this.hasValidObject = true;
              const feature = this.featureService.createFeature(
                FEATURE_ATTRIBUTE_EDITION_PREFIX,
                this.objectGeoSelected.geometry,
                { 
                  idNumeroExterior: this.objectGeoSelected.idNumeroExterior,
                  idPredio: this.objectGeoSelected.idPredio,
                  numExt: this.objectGeoSelected.n_ext,
                  numInt: this.objectGeoSelected.n_int
                }
              );
              this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
              this.mapService.drawFeature(feature, ATTRIBUTE_EDITION_STYLE);
              this.editionAttributes.data.map((attr) => {
                const data = this.objectGeoSelected[attr.attributeName];
                attr.value = data;
              });
            } else {
              this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
            }
            this.showLoading = false;
          });
          break;
        default:
          this.showLoading = false;
          break;
      }*/
      this.catastroService.getObjectAtPoint(this.layerSelected, this.editionAttributes.data, x, y).subscribe((res) => {
        if (res !== null) {
          this.objectGeoSelected = res as EditionObject;
          this.idGeoSelected = this.objectGeoSelected.id;
          this.hasValidObject = true;
          const feature = this.featureService.createFeature(
            FEATURE_ATTRIBUTE_EDITION_PREFIX,
            this.objectGeoSelected.geometry,
            { 
              id: this.objectGeoSelected.id,
            }
          );
          this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
          this.mapService.drawFeature(feature, ATTRIBUTE_EDITION_STYLE);
          
          this.objectGeoSelected.properties.map((obj) => {
            this.editionAttributes.data.map((attr) => {
              if (obj.key === attr.attributeName) {
                attr.value = obj.value;
              }
            });
          });
        } else {
          this.mapService.clearDrawings(FEATURE_ATTRIBUTE_EDITION_PREFIX);
        }
        this.showLoading = false;
      });
    }
  }

  showingQuestion() {
    this.showResult = false;
    this.showQuestion = true;
  }

  async validateData() {
    this.showResult = false;
    this.showQuestion = false;
    this.showDelete = false;
    if (this.layerSelected.name === 'Construccion') {
      this.backdropMessage = 'Validando datos...';
      this.showLoading = true;
      const indexNiveles = this.editionAttributes.data.findIndex((a) => a.attributeName === 'niveles');
      const indexClasificacion = this.editionAttributes.data.findIndex((a) => a.attributeName === 'clasificacion');
      const expReg = /^\d+\:\d+$/;
      const niveles = +this.editionAttributes.data[indexNiveles].value;
      const clasificacion = this.editionAttributes.data[indexClasificacion].value.trim();
      const clasificaciones = clasificacion.split(',');
      let totalLevels = 0;
      let canContinue = true;
      for (const c of clasificaciones) {
        const clasif = c.trim();
        if (clasif.match(expReg) != null) {
          const partsClasification = clasif.split(':');
          totalLevels += +partsClasification[0];
          const isValid: boolean = await firstValueFrom(this.catastroService.isValidClasificationConstruction(partsClasification[1]));
          if (!isValid) {
            this.resultCorrect = false;
            this.resultMessage = `La clave de clasificación ${partsClasification[1]} no es válida`;
            this.showResult = true;
            canContinue = false;
            this.showLoading = false;
            break;
          }
        } else {
          this.resultCorrect = false;
          this.resultMessage = 'Formato de clasificación incorrecto';
          this.showResult = true;
          canContinue = false;
          this.showLoading = false;
          break;
        }
      }
      if (canContinue) {
        if (totalLevels === niveles) {
          //this.showLoading = false;
          //this.showQuestion = true;
          this.updateData();
        } else {
          this.resultCorrect = false;
          this.resultMessage = 'El número de niveles no coincide con el de la clasificación';
          this.showResult = true;
          this.showLoading = false;
        }
      }
    } else {
      // this.showQuestion = true;
      this.updateData();
    }
  }

  updateData() {
    this.backdropMessage = 'Actualizando datos...';
    this.showLoading = true;
    this.catastroService.updateAttributes(this.layerSelected, this.editionAttributes.data, this.idGeoSelected).subscribe((res) => {
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = 'Datos actualizados';
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'No se pudo realizar actualización';
      }
      this.showResult = true;
      this.hasValidObject = false;
      this.showLoading = false;
    }, (error) => {
      console.log(error);
      this.resultCorrect = false;
      this.resultMessage = 'Error al actualizar';
      this.showResult = true;
      this.hasValidObject = false;
      this.showLoading = false;
    });
    this.showQuestion = false;
    this.showDelete = false;
  }

  cancelUpdate() {
    this.showQuestion = false;
    this.showDelete = false;
  }

  deleteData() {
    this.backdropMessage = 'Eliminando objeto geométrico...';
    this.showLoading = true;
    this.catastroService.deleteObjectById(this.layerSelected, this.idGeoSelected).subscribe((res) => {
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = 'Datos eliminados';
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'No se pudo eliminar el objeto geométrico';
      }
      this.showResult = true;
      this.hasValidObject = false;
      this.showLoading = false;
    }, (error) => {
      console.log(error);
      this.resultCorrect = false;
      this.resultMessage = 'Error al eliminar';
      this.showResult = true;
      this.hasValidObject = false;
      this.showLoading = false;
    });
    this.showDelete = false;
    this.showQuestion = false;
  }
}
