import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PredioFrente } from 'src/app/pages/map/models/predio-frente';
import { AvaluoService } from 'src/app/pages/map/services/avaluo.service';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { Extent, getCenter } from 'ol/extent';
import { ProjectionEnum, ReprojectionService } from 'src/app/pages/map/services/reprojection.service';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { AvaluoData } from '../models/avaluo-data';
import { AvaluoConstruction } from '../models/avaluo-construction';
import { environment } from 'src/environments/environment';
import { Geometry } from 'geojson';
import { FormControl } from '@angular/forms';
import { SICAMService } from 'src/app/pages/map/services/sicam.service';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { MapService } from 'sic-mapping-toolkit';

const AVALUO_PREFIX = '[AVALUO_TOOL][DETAIL]';
const AVALUO_STYLE: Style = new Style({
  stroke: new Stroke({
    color: '#e94e1b',
    width: 2,
    lineDash: undefined,
  }),
  fill: new Fill({
    color: 'rgba(233, 78, 27, 0.2)',
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: '#e94e1b',
    }),
    fill: new Fill({
      color: '#e94e1b',
    }),
  }),
});

@Component({
  selector: 'sic-analysis-detail',
  templateUrl: './analysis-detail.component.html',
  styleUrls: ['./analysis-detail.component.scss']
})
export class AnalysisDetailComponent implements OnInit, AfterViewInit {
  title: string = 'Análisis del avalúo';
  fronts = new MatTableDataSource<PredioFrente>([]);
  frontColumns: string[] = ['numero', 'calle', 'longitud', 'valorZona', 'valorCalle', 'actions'];
  constructions = new MatTableDataSource<AvaluoConstruction>([]);
  constructionColumns: string[] = ['numero', 'bloque', 'nivel', 'area', 'clasificacion', 'valor'];
  avaluo: AvaluoData = {
    predio: {
      idPredio: '',
      clave: '',
      formattedClave: '',
      CURT: '',
      caso: 0,
      forma: '',
      sct: 0,
      claveManzana: '',
      numeroOficial: '',
      superficieConstruction: 0,
      description: '',
      observation: '',
      predio: '',
      frente: [],
      construction: [],
      geometry: null as unknown as Geometry,
    },
    clasification: '',
    clave: {
      cuenta: '',
      clave: '',
      CURT: '',
      forma: '',
      estado: '',
      region: '',
      municipio: '',
      zona: '',
      localidad: '',
      sector: '',
      manzana: '',
      predio: '',
      edificio: '',
      unidad: '',
      areaCartografica: -1,
      perimetro: -1
    },
    ubication: {
      cuenta: '',
      clave: '',
      ubicacion: '',
      numeroExterior: '',
      numeroInterior: '',
      colonia: '',
      areaTitulo: -1
    },
    construction: [],
    totalConstruction: 0,
    totalConstructionValue: 0,
    terrain: [],
    totalTerrainValue: 0,
    corner: [],
    totalCornerValue: 0,
    frente: [],
    totalTerrainCornerValue: 0,
    totalValue: 0
  };

  backdropMessage: string = 'Cargando información avalúo...';
  showLoading: boolean = true;

  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  comment = new FormControl('');
  folio = new FormControl(0);

  // Permission
  canPrintAvaluo!: boolean;
  canSendSICAM!: boolean;

  constructor(
    public dialogRef: MatDialogRef<AnalysisDetailComponent>,
    private avaluoService: AvaluoService,
    private featureService: FeatureService,
    private reprojectionService: ReprojectionService,
    private catastroService: CatastroService,
    private sicamService: SICAMService,
    private authService: AuthService,
    private mapService: MapService,
    @Inject(MAT_DIALOG_DATA) public data: { idPredio: string, isReferred: boolean, year: number }
  ) { }

  ngOnInit(): void {
    if (this.data.isReferred) {
      this.canPrintAvaluo = this.authService.hasPermission('avri3');
      this.canSendSICAM = this.authService.hasPermission('avre4');
    } else {
      this.canPrintAvaluo = this.authService.hasPermission('avii3');
      this.canSendSICAM = this.authService.hasPermission('avie4');
    }
  }

  ngAfterViewInit(): void {
    this.mapService.clearDrawings(AVALUO_PREFIX);
    if (this.data.isReferred) {
      this.avaluoService.getAvaluoReferred(this.data.idPredio, this.data.year).subscribe((res) => {
        this.title = `Análisis del avalúo referido ${this.data.year}`;
        this.avaluo = res;
        this.constructions.data = this.avaluo.construction;
        this.fronts.data = this.avaluo.frente;
        this.showLoading = false;
      }, (error) => {
        console.log(error);
        this.showLoading = false;
        window.alert(`Error al obtener datos del avalúo del año ${this.data.year}`);
      });
    } else {
      this.avaluoService.getAvaluoData(this.data.idPredio).subscribe((res) => {
        this.avaluo = res;
        this.constructions.data = this.avaluo.construction;
        this.fronts.data = this.avaluo.frente;
        this.showLoading = false;
      }, (error) => {
        console.log(error);
        this.showLoading = false;
        window.alert('Error al obtener datos del avalúo.');
      });
    }
  }

  callClose(): void {
    this.dialogRef.close();
    this.mapService.clearDrawings(AVALUO_PREFIX);
  }

  openGoogleMaps(row: PredioFrente): void {
    this.backdropMessage = 'Abriendo StreetView...';
    this.showLoading = true;
    const frente = this.featureService.createFeature(
      '[FRONT_PREDIO]',
      row.geometry
    );
    let point = getCenter(frente.getGeometry()?.getExtent() as Extent);
    const geom: any = row.geometry;
    if (geom.coordinates.length > 2) { 
      point = frente.getGeometry()?.getClosestPoint(point) as number[];
    }
    const latLongCoordinates = this.reprojectionService.reproject(ProjectionEnum.EPSG_6368, ProjectionEnum.LatLong, { x: point[0], y: point[1] });

    if (this.data.isReferred) {
      this.catastroService.getReferredHeading(row.idPredioFrente).subscribe((heading) => {
        this.showLoading = false;
        window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latLongCoordinates.y},${latLongCoordinates.x}&heading=${heading}`, '_blank', 'noopener noreferrer');
      });
    } else {
      this.catastroService.getHeading(row.idPredioFrente).subscribe((heading) => {
        this.showLoading = false;
        window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latLongCoordinates.y},${latLongCoordinates.x}&heading=${heading}`, '_blank', 'noopener noreferrer');
      });
    }
  }

  getReportAvaluo(type: string) {
    this.backdropMessage = 'Generando reporte del avalúo...';
    this.showLoading = true;
    if (this.data.isReferred) {
      this.avaluoService.getAvaluoReferredReport(this.data.idPredio, this.data.year).subscribe((report: any) => {
        this.showLoading = false;
        window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
      });
    } else {
      this.avaluoService.getAvaluoReport(this.data.idPredio, type).subscribe((report: any) => {
        this.showLoading = false;
        window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
      });
    }
  }

  async sendData() {
    this.backdropMessage = 'Enviando a SICAM...';
    this.showLoading = true;
    const sentYear: number = this.data.year === 0? new Date(Date.now()).getFullYear() : this.data.year;
    this.sicamService.sendAvaluoToSICAM(this.data.idPredio, this.folio.value.toString(), this.comment.value, sentYear).subscribe((res) => {
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = 'Avalúo enviado a SICAM';
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Error al enviar a SICAM';
      }
      this.showLoading = false;
      this.showResult = true;
    }, (error) => {
      console.log(error);
      this.showLoading = false;
    });
  }

  moveToGeom(row: AvaluoConstruction) {
    if (row.geometry !== null) {
      const feature = this.featureService.createFeature(
        AVALUO_PREFIX,
        row.geometry
      );
      this.mapService.clearDrawings(AVALUO_PREFIX);
      this.mapService.drawFeature(feature, AVALUO_STYLE);
    } else {
      this.mapService.clearDrawings(AVALUO_PREFIX);
    }
  }
}
