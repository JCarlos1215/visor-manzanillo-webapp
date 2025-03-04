import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MapService } from 'sic-mapping-toolkit';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { PredioFusionComponent } from './components/predio-fusion/predio-fusion.component';
import { PredioDivisonComponent } from './components/predio-divison/predio-divison.component';
import { AttributeEditionComponent } from './components/attribute-edition/attribute-edition.component';
import { ConstructionAdjustComponent } from './components/construction-adjust/construction-adjust.component';

@Component({
  selector: 'sic-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit, OnDestroy {
  activeTool: string = '';

  @Input() watchUser!: boolean;
  @Output() identify = new EventEmitter();
  @Output() resultWatch = new EventEmitter<boolean>();

  // Permission
  toolMeasure!: boolean;
  toolGoto!: boolean;
  toolFront!: boolean;
  toolIndividualAvaluo!: boolean;
  toolReferredAvaluo!: boolean;
  toolMultipleAvaluo!: boolean;
  toolPayment!: boolean;
  toolPrint!: boolean;
  toolPadronData!: boolean;
  toolFusion!: boolean;
  toolDivision!: boolean;
  toolEditionAttribute!: boolean;
  toolDeslinde!: boolean;
  toolConstructionAdjust!: boolean;
  toolUploadGeom!: boolean;

  constructor(
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.toolMeasure = this.authService.hasPermission('medv1');
    this.toolGoto = this.authService.hasPermission('iacv1');
    this.toolFront = this.authService.hasPermission('vrfv1');
    this.toolIndividualAvaluo = this.authService.hasPermission('aviv1');
    this.toolReferredAvaluo = this.authService.hasPermission('avrv1');
    this.toolMultipleAvaluo = this.authService.hasPermission('avmv1');
    this.toolPayment = this.authService.hasPermission('gdpv1');
    this.toolPrint = this.authService.hasPermission('impv1');
    this.toolPadronData = this.authService.hasPermission('dpdv1');
    this.toolFusion = this.authService.hasPermission('fusv1');
    this.toolDivision = this.authService.hasPermission('subv1');
    this.toolEditionAttribute = this.authService.hasPermission('easv1');
    this.toolDeslinde = this.authService.hasPermission('dscv1');
    this.toolConstructionAdjust = this.authService.hasPermission('aacv1');
    this.toolUploadGeom = this.authService.hasPermission('cgkv1');
  }

  toggleTool(tool: string) {
    if (tool === 'identify' || this.activeTool === 'identify') {
      this.identify.emit();
    }
    if (this.activeTool === tool) {
      this.activeTool = '';
    } else {
      this.activeTool = tool;
    }
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  toggleUserInfo(watch: boolean) {
    this.resultWatch.emit(watch);
  }

  deactiveTool(tool: string) {
    if (this.activeTool === tool) {
      this.dialog.closeAll();
      this.activeTool = '';
    }
  }

  async showFusion() {
    if (this.activeTool === 'fusion') {
      this.deactiveTool('fusion');
    } else {
      this.activeTool = 'fusion';
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '40vw';
      dialogConfig.height = '38vw';
      dialogConfig.position = {right: '0px'};
      dialogConfig.hasBackdrop = false;
      this.dialog.open(PredioFusionComponent, dialogConfig);
    }
  }

  async showDivision() {
    if (this.activeTool === 'division') {
      this.deactiveTool('division');
    } else {
      this.activeTool = 'division';
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '40vw';
      dialogConfig.height = '38vw';
      dialogConfig.position = {right: '0px'};
      dialogConfig.hasBackdrop = false;
      this.dialog.open(PredioDivisonComponent, dialogConfig);
    }
  }

  async showAttributeEdition() {
    if (this.activeTool === 'identify') {
      this.identify.emit();
    }
    if (this.activeTool === 'edition') {
      this.deactiveTool('edition');
    } else {
      this.activeTool = 'edition';
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '30vw';
      dialogConfig.maxHeight = '50%';
      dialogConfig.position = {right: '64px', top: '80px'};
      dialogConfig.hasBackdrop = false;
      this.dialog.open(AttributeEditionComponent, dialogConfig);
    }
  }

  async showConstructionAdjust() {
    if (this.activeTool === 'adjust') {
      this.deactiveTool('adjust');
    } else {
      this.activeTool = 'adjust';
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '30vw';
      dialogConfig.height = '36vw';
      dialogConfig.position = {right: '0px'};
      dialogConfig.hasBackdrop = false;
      this.dialog.open(ConstructionAdjustComponent, dialogConfig);
    }
  }
}
