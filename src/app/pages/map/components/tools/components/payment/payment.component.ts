import { Component, OnDestroy, OnInit } from '@angular/core';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { Geometry } from "geojson";
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { PaymentService } from 'src/app/pages/map/services/payment.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { DialogDebtComponent } from './dialog-debt/dialog-debt.component';
import { DialogPaidComponent } from './dialog-paid/dialog-paid.component';
import { AuthService } from 'src/app/modules/security/services/auth.service';

const SELECT_PAYMENT_PREFIX = '[PAYMENT_TOOL]';
const SELECT_PAYMENT_STYLE: Style = new Style({
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
  selector: 'sic-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentList: string = '';
  paymentListTitle: string = '';
  mapEventHandlerId: string = null as unknown as string;

  backdropMessage: string = 'Cargando lista...';
  showLoading: boolean = false;

  // Permission
  canSeePaid!: boolean;
  canSeeDebt!: boolean;

  constructor(
    private mapService: MapService,
    private paymentService: PaymentService,
    public dialog: MatDialog,
    private featureService: FeatureService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.canSeePaid = this.authService.hasPermission('gdpp2');
    this.canSeeDebt = this.authService.hasPermission('gdpd3');
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(SELECT_PAYMENT_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  selectPaymentList(type: string) {
    this.paymentList = type;
    switch(type) {
      case 'paid-col':
        this.paymentListTitle = 'Lista de pagos por colonia';
        break;
      case 'debt-col':
        this.paymentListTitle = 'Lista de deudores por colonia';
        break;
      case 'paid-mnz':
        this.paymentListTitle = 'Lista de pagos por manzana';
        break;
      case 'debt-mnz':
        this.paymentListTitle = 'Lista de deudores por manzana';
        break;
      default:
    }
    if (this.mapEventHandlerId === null) {
      this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
    }
  }

  backSelectPaymentList() {
    this.paymentList = '';
    this.paymentListTitle = '';
  }

  mapClickHandler() {
    return (evt: any) => {
      this.showLoading = true;
      const [x, y] = evt.coordinate;
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = true;
      dialogConfig.width = '70vw';
      switch (this.paymentList) {
        case 'debt-col':
          this.paymentService.getPredioDebtXCol(x, y).subscribe((res) => {
            if (res.length !== 0) {
              this.highlightGeom(res[0].colonyGeometry);
            }
            dialogConfig.data = res;
            this.dialog.open(DialogDebtComponent, dialogConfig);
            this.showLoading = false;
          });
          break;
        case 'paid-col':
          this.paymentService.getPredioPaidXCol(x, y).subscribe((res) => {
            if (res.length !== 0) {
              this.highlightGeom(res[0].colonyGeometry);
            }
            dialogConfig.data = res;
            this.dialog.open(DialogPaidComponent, dialogConfig);
            this.showLoading = false;
          });
          break;
        case 'paid-mnz':
          this.paymentService.getPredioPaidXMnz(x, y).subscribe((res) => {
            if (res.length !== 0) {
              this.highlightGeom(res[0].colonyGeometry);
            }
            dialogConfig.data = res;
            this.dialog.open(DialogPaidComponent, dialogConfig);
            this.showLoading = false;
          }, (error) => {
            console.log(error);
            this.showLoading = false;
          });
          break;
        case 'debt-mnz':
          this.paymentService.getPredioDebtXMnz(x, y).subscribe((res) => {
            if (res.length !== 0) {
              this.highlightGeom(res[0].colonyGeometry);
            }
            dialogConfig.data = res;
            this.dialog.open(DialogDebtComponent, dialogConfig);
            this.showLoading = false;
          }, (error) => {
            console.log(error);
            this.showLoading = false;
          });
          break;
        default:
          break;
      }
    }
  }

  private highlightGeom(geom: Geometry) {
    const feature = this.featureService.createFeature(
      SELECT_PAYMENT_PREFIX,
      geom
    );
    this.mapService.clearDrawings(SELECT_PAYMENT_PREFIX);
    this.mapService.drawFeature(feature, SELECT_PAYMENT_STYLE);
  }
}
