import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { KMLGeometryData } from './models/kml-geometry-data';
import { MapService } from 'sic-mapping-toolkit';
import { Extent } from 'ol/extent';

const FEATURE_UPLOAD_GEOM_PREFIX = '[UPLOAD_GEOM_TOOL]';
const UPLOAD_GEOM_STYLE: Style = new Style({
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
  selector: 'sic-upload-geom',
  templateUrl: './upload-geom.component.html',
  styleUrls: ['./upload-geom.component.scss']
})
export class UploadGeomComponent implements OnInit {
  selectedFormat: string = '.kml, application/vnd.google-earth.kml+xml';
  files = { type: 'KML', fileData: null as unknown as File };
  name = new FormControl('');
  description = new FormControl('');

  backdropMessage: string = 'Cargando KML...';
  showLoading: boolean = false;

  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  constructor(
    private catastroService: CatastroService,
    private mapService: MapService
  ) { }

  ngOnInit(): void {
  }

  async onFileChange(event) {
    if (event.target.files.length > 0) {
      const file: File = event.target.files[0];
      this.files.fileData = file;
    } else {
      this.files.fileData = null as unknown as File;
    }
  }

  async uploadGeom() {
    this.showLoading = true;
    const data = await (this.files.fileData as any).text();
    this.catastroService.uploadGeometryKML(data, this.name.value, this.description.value, FEATURE_UPLOAD_GEOM_PREFIX).subscribe((res) => {
      res.map((kml: KMLGeometryData) => {
        this.mapService.drawFeature(kml.feature, UPLOAD_GEOM_STYLE);
      });
      const extent = res[0].feature.getGeometry()?.getExtent();
      this.mapService.getMapById(this.mapService.default).moveTo(extent as Extent);
      this.showResult = true;
      this.resultCorrect = true;
      this.resultMessage = 'KML cargado correctamente';
      this.showLoading = false;
    }, (err) => {
      this.showLoading = false;
      this.showResult = true;
      this.resultCorrect = false;
      this.resultMessage = err;
    });
  }

  cleanKMLs() {
    this.mapService.clearDrawings(FEATURE_UPLOAD_GEOM_PREFIX);
  }
}
