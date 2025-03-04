import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuSearchBarComponent } from './components/menu-search-bar/menu-search-bar.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { SearchResultComponent } from './components/search-result/search-result.component';

/**
 * Modulo de búsqueda
 * 
 * Incluye la barra de búsqueda, barra de búsqueda con menu y resultados de búsqueda.
 */
@NgModule({
  declarations: [
    MenuSearchBarComponent, 
    SearchBarComponent, 
    SearchResultComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    MenuSearchBarComponent,
    SearchBarComponent,
    SearchResultComponent
  ]
})
export class SearchModule { }
