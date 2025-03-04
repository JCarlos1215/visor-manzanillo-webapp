import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TocTreeItem } from '../../models/toc-tree-item';
import { TocService } from '../../services/toc.service';
import { SidePanel } from '../side-panel/models/side-panel';

@Component({
  selector: 'sic-table-of-content',
  templateUrl: './table-of-content.component.html',
  styleUrls: ['./table-of-content.component.scss']
})
export class TableOfContentComponent extends SidePanel implements OnInit {
  toc$!: Observable<TocTreeItem[]>;

  constructor(
    private tocService: TocService
  ) {
    super();
    this.toc$ = this.tocService.loadLayers();
  }

  ngOnInit(): void {
  }

  hide(): void {}

  show(): void {}
}
