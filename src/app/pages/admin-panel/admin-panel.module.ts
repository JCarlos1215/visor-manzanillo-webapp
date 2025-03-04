import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPanelPageComponent } from './admin-panel-page/admin-panel-page.component';
import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { LoadingModule } from 'src/app/modules/loading/loading.module';
import { QuestionDialogComponent } from './components/question-dialog/question-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AdminPanelPageComponent,
    QuestionDialogComponent
  ],
  imports: [
    CommonModule,
    AdminPanelRoutingModule,
    SharedModule,
    LoadingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminPanelModule { }
