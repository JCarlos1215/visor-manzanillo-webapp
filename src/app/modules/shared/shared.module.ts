import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';

/**
 * Modulo compartido
 * 
 * Importa y exporta el módulo de Angular Material.
 */
@NgModule({
  imports: [
    MaterialModule
  ],
  exports: [
    MaterialModule
  ]
})
export class SharedModule { }
