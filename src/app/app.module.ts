import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from './modules/shared/classes/custom-paginator';

/**
 * Modulo inicial de la aplicación
 * 
 * Importa y exporta el módulo de Angular Material.
 */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
  bootstrap: [AppComponent]
})
export class AppModule { }
