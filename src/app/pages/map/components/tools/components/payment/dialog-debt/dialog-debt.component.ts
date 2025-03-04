import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Extent } from 'ol/extent';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { MapService } from 'sic-mapping-toolkit';
import { PredioDebt } from 'src/app/pages/map/models/predio-debt';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { PaymentService } from 'src/app/pages/map/services/payment.service';
import { getFormattedNumber } from 'src/app/utils/formatted-number';
import { environment } from 'src/environments/environment';

const SELECT_PAYMENT_PREDIO_PREFIX = '[PAYMENT_TOOL][PREDIO_DEBT]';
const SELECT_PAYMENT_PREDIO_STYLE: Style = new Style({
  stroke: new Stroke({
    color: '#b72331',
    width: 2,
    lineDash: undefined,
  }),
  fill: new Fill({
    color: 'rgba(183, 35, 49, 0.2)',
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: '#b72331',
    }),
    fill: new Fill({
      color: '#b72331',
    }),
  }),
});

@Component({
  selector: 'sic-dialog-debt',
  templateUrl: './dialog-debt.component.html',
  styleUrls: ['./dialog-debt.component.scss']
})
export class DialogDebtComponent implements OnInit {
  displayedColumns: string[] = ['colonia', 'type', 'cuenta', 'claveCatastral', 'ubication', 'numberExt', 'saldo'];
  dataSource = new MatTableDataSource<PredioDebt>(this.data);
  saldo: number = 0;
  title: string = '';

  @ViewChild(MatPaginator) paginator !: MatPaginator;

  backdropMessage: string = 'Espere un momento...';
  showLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogDebtComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PredioDebt[],
    private featureService: FeatureService,
    private mapService: MapService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    if (this.data[0].manzana === '') {
      this.title = `colonia ${this.data[0].colonia.toLowerCase()}`;
    } else {
      this.title = `manzana ${this.data[0].manzana}`;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  callClose(): void {
    this.dialogRef.close();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getTotalSaldo() {
    this.saldo = this.data.map(t => t.saldo).reduce((acc, value) => acc + value, 0);
    return getFormattedNumber(this.saldo);
  }

  moveToGeom(row: PredioDebt) {
    const feature = this.featureService.createFeature(
      SELECT_PAYMENT_PREDIO_PREFIX,
      row.predioGeometry
    );
    this.mapService.clearDrawings(SELECT_PAYMENT_PREDIO_PREFIX);
    this.mapService.drawFeature(feature, SELECT_PAYMENT_PREDIO_STYLE);
    this.mapService.getMapById(this.mapService.default).moveTo(feature.getGeometry()?.getExtent() as Extent);
  }

  getInform() {
    this.showLoading = true;
    if (this.data[0].manzana === '') {
      this.paymentService.getDebtReportXCol(this.data[0].colonia).subscribe((report: any) => {
        this.showLoading = false;
        window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
      });
    } else {
      this.paymentService.getDebtReportXMnz(this.data[0].manzana).subscribe((report: any) => {
        this.showLoading = false;
        window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
      });
    }
  }
}
