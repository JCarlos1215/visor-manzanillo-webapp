import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PredioInformation } from '../../models/predio-information';
import { CatastroService } from '../../services/catastro.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'sic-predio-preview',
  templateUrl: './predio-preview.component.html',
  styleUrls: ['./predio-preview.component.scss']
})
export class PredioPreviewComponent implements OnInit {
  title: string = 'Predio';
  backdropMessage: string = 'Descargando ficha técnica...';
  showLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PredioPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public res: { PredioUrbano: PredioInformation[], PredioUP: PredioInformation[], PredioParcela: PredioInformation[], PredioRustico: PredioInformation[] },
    public dialog: MatDialog,
    private catastroService: CatastroService
  ) { }

  ngOnInit(): void {
  }

  callClose(): void {
    this.dialogRef.close(true);
  }

  getFichaReport(clave: string, type: string) {
    this.showLoading = true;
    this.catastroService.getFichaTecnicaReport(clave, type).subscribe((report: any) => {
      this.showLoading = false;
      window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
    }, (error) => {
      console.log(error);
      this.showLoading = false;
      window.alert(`No se pudo generar la ficha técnica con la clave ${clave}`);
    });
  }

}
