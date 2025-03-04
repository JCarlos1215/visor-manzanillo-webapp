import { NgModule } from '@angular/core';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { DragDropModule } from '@angular/cdk/drag-drop';
/*import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
*/

/**
 * Módulos para la aplicación de Angular Material.
 */
const MODULES = [
  MatCardModule,
  MatButtonModule,
  // MatButtonToggleModule,
  MatCheckboxModule,
  MatListModule,
  MatIconModule,
  MatInputModule,
  // MatMenuModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatSliderModule,
  MatSelectModule,
  MatTableModule,
  MatAutocompleteModule,
  // MatSnackBarModule,
  MatProgressBarModule,
  MatTabsModule,
  MatFormFieldModule,
  MatExpansionModule,
  MatRadioModule,
  MatDialogModule,
  MatDividerModule,
  // MatBottomSheetModule,
  MatTooltipModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatNativeDateModule,
  MatGridListModule,
  DragDropModule
];

/**
 * Modulo Material
 * 
 * Importa y exporta los módulos a usar de Angular Material.
 */
@NgModule({
  imports: [
    MODULES
  ],
  exports: [
    MODULES
  ]
})
export class MaterialModule { }
