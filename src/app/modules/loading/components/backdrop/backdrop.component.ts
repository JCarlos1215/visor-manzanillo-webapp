import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sic-backdrop',
  templateUrl: './backdrop.component.html',
  styleUrls: ['./backdrop.component.scss']
})
export class BackdropComponent implements OnInit {
  @Input() backdropMessage: string = 'Espere un momento...';
  @Input() showingLoading: boolean = false;

  /**
   * @ignore
   */
  constructor() { }

  ngOnInit(): void {
  }

}
