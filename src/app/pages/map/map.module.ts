import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { MapPageComponent } from './map-page/map-page.component';
import { SicMappingToolkitModule } from 'sic-mapping-toolkit';
import { NgChartsModule } from 'ng2-charts';
import { SearchModule } from 'src/app/modules/search/search.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IdentifyModule } from 'src/app/modules/identify/identify.module';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { ToolsComponent } from './components/tools/tools.component';
import { LoggedUserComponent } from './components/logged-user/logged-user.component';
import { TableOfContentComponent } from './components/table-of-content/table-of-content.component';
import { LayerItemComponent } from './components/table-of-content/layer-item/layer-item.component';
import { ChartDialogComponent } from './components/table-of-content/chart-dialog/chart-dialog.component';
import { GotoLocationComponent } from './components/tools/components/goto-location/goto-location.component';
import { MeasureComponent } from './components/tools/components/measure/measure.component';
import { SnapConfigComponent } from './components/tools/components/measure/snap-config/snap-config.component';
import { WatchFrontComponent } from './components/tools/components/watch-front/watch-front.component';
import { LoadingModule } from 'src/app/modules/loading/loading.module';
import { UserComponent } from './components/tools/components/user/user.component';
import { GroupItemComponent } from './components/table-of-content/group-item/group-item.component';
import { SimpleAvaluoComponent } from './components/tools/components/simple-avaluo/simple-avaluo.component';
import { AnalysisDetailComponent } from './components/tools/components/simple-avaluo/analysis-detail/analysis-detail.component';
import { MultipleAvaluoComponent } from './components/tools/components/multiple-avaluo/multiple-avaluo.component';

import { PrintComponent } from './components/tools/components/print/print.component';
import { PadronDataComponent } from './components/tools/components/padron-data/padron-data.component';
import { PadronDataDetailComponent } from './components/tools/components/padron-data/padron-data-detail/padron-data-detail.component';
import { PredioFusionComponent } from './components/tools/components/predio-fusion/predio-fusion.component';
import { PredioDivisonComponent } from './components/tools/components/predio-divison/predio-divison.component';
import { AttributeEditionComponent } from './components/tools/components/attribute-edition/attribute-edition.component';
import { DeslindeCatastralComponent } from './components/tools/components/deslinde-catastral/deslinde-catastral.component';
import { ConstructionAdjustComponent } from './components/tools/components/construction-adjust/construction-adjust.component';
import { PaymentComponent } from './components/tools/components/payment/payment.component';
import { DialogPaidComponent } from './components/tools/components/payment/dialog-paid/dialog-paid.component';
import { DialogDebtComponent } from './components/tools/components/payment/dialog-debt/dialog-debt.component';
import { PredioPreviewComponent } from './components/predio-preview/predio-preview.component';
import { UploadGeomComponent } from './components/tools/components/upload-geom/upload-geom.component';

/**
 * Modulo mapa
 * 
 * Incluye la página del mapa y sus componentes.
 */
@NgModule({
  declarations: [
    MapPageComponent,
    SidePanelComponent,
    ToolsComponent,
    LoggedUserComponent,
    TableOfContentComponent,
    LayerItemComponent,
    ChartDialogComponent,
    GotoLocationComponent,
    MeasureComponent,
    SnapConfigComponent,
    WatchFrontComponent,
    UserComponent,
    GroupItemComponent,
    SimpleAvaluoComponent,
    AnalysisDetailComponent,
    MultipleAvaluoComponent,
    PaymentComponent,
    DialogPaidComponent,
    DialogDebtComponent,
    PrintComponent,
    PadronDataComponent,
    PadronDataDetailComponent,
    PredioFusionComponent,
    PredioDivisonComponent,
    AttributeEditionComponent,
    DeslindeCatastralComponent,
    ConstructionAdjustComponent,
    PredioPreviewComponent,
    UploadGeomComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    SicMappingToolkitModule,
    NgChartsModule,
    SearchModule,
    IdentifyModule,
    FormsModule,
    SharedModule,
    LoadingModule,
    ReactiveFormsModule
  ]
})
export class MapModule { }
