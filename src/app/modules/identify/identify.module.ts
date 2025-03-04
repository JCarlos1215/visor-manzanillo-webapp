import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentifyContainerComponent } from './components/identify-container/identify-container.component';
import { FeatureContainerComponent } from './components/feature-container/feature-container.component';
import { SharedModule } from '../shared/shared.module';
import { IdentifyService } from './services/identify.service';

/**
 * Modulo de identifica
 * 
 * Incluye cuadro con información geográfica de un punto en particular.
 */
@NgModule({
  declarations: [
    IdentifyContainerComponent, 
    FeatureContainerComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    IdentifyContainerComponent
  ],
  providers: [
    IdentifyService
  ]
})
export class IdentifyModule { }
