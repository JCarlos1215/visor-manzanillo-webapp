import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'sic-snap-config',
  templateUrl: './snap-config.component.html',
  styleUrls: ['./snap-config.component.scss']
})
export class SnapConfigComponent implements OnInit {
  displayedColumns: string[] = ['layer', 'select'];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataSource.data = data.snapConfiguration;
    this.selection.select(...this.dataSource.data.filter(x => data.snapLayers.find(s => s.id === x.id)));
  }

  ngOnInit(): void {
  }
}
