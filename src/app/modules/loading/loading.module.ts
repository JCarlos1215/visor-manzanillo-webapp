import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackdropComponent } from './components/backdrop/backdrop.component';
import { SharedModule } from '../shared/shared.module';

/**
 * Modulo de loading
 * 
 * Incluye modulo de carga al hacer peticiones y desplegar datos
 */
@NgModule({
  declarations: [
    BackdropComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    BackdropComponent
  ]
})
export class LoadingModule { }
