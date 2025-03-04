import { DomPortalOutlet, PortalOutlet } from '@angular/cdk/portal';
import { ApplicationRef, Component, ComponentFactoryResolver, Injector, OnInit, ViewChild } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { SidePanelService } from './services/side-panel.service';
import { PortalInterface } from './models/portal';

@Component({
  selector: 'sic-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  animations: [
    trigger('toggleSidePanel', [
      state(
        'open',
        style({ width: '360px', 'max-width': '100%', display: 'flex' })
      ),
      state(
        'close',
        style({
          width: '0px',
          'max-width': '0px',
          display: 'flex',
          visibility: 'hidden',
        })
      ),
      transition(
        'open => close',
        animate('150ms ease-in', style({ width: '0px', visibility: 'hidden' }))
      ),
      transition(
        'close => open',
        animate(
          '150ms ease-in',
          style({ width: '360px', 'max-width': '100%', visibility: 'unset' })
        )
      ),
    ]),
  ]
})
export class SidePanelComponent implements OnInit {
  state = 'open';
  header = 'small';
  title = 'Side panel';

  @ViewChild('portalOutletContainer', { static: true })
  portalOutletContainer!: { nativeElement: Element; };

  private portalOutlet!: PortalOutlet;

  constructor(
    private panelService: SidePanelService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  ngOnInit(): void {
    this.portalOutlet = new DomPortalOutlet(
      this.portalOutletContainer.nativeElement,
      this.componentFactoryResolver,
      this.appRef,
      this.injector
    );
    this.panelService.registerPortalOutletComponent(this.portalOutlet);

    this.panelService.portal$.subscribe((portal: PortalInterface) => {
      if (!!portal) {
        this.header = portal.options.headerSize;
        this.title = portal.options.title;
        this.state = 'open';
      } else {
        this.title = '';
        // this.header = 'large';
        this.state = 'close';
      }
    });
  }

  closePanel(): void {
    this.panelService.close();
  }
}
