import { ComponentPortal, PortalOutlet } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import cuid from 'cuid';
import { BehaviorSubject } from 'rxjs';
import { PortalInterface } from '../models/portal';
import { SidePanel } from '../models/side-panel';

@Injectable({
  providedIn: 'root'
})
export class SidePanelService {
  private portalOutlet: PortalOutlet | undefined;
  private attachedPortal: any;
  status: string = 'close';

  portal$!: BehaviorSubject<PortalInterface>;

  constructor() {
    this.portal$ = new BehaviorSubject((null) as unknown as PortalInterface);
  }

  registerPortalOutletComponent(component: PortalOutlet) {
    if (!component) {
      throw Error('PortalOutlet component no puede ser nulo');
    }

    this.portalOutlet = component;
  }

  open(component: SidePanel, options: any) {
    this.status = 'open';
    if (!this.portalOutlet) {
      throw Error('PortalOutlet no registrado');
    }

    if (this.portalOutlet.hasAttached()) {
      this.portalOutlet.detach();
    }

    const portal: PortalInterface = {
      id: !!options.id ? options.id : '' + options.label + '.' + cuid(),
      portal: new ComponentPortal<SidePanel>(component as any),
      options,
    };

    this.portal$.next(portal);
    this.attachedPortal = this.portalOutlet.attach(portal.portal);
    this.attachedPortal.instance.setData(options.data);
    this.attachedPortal.instance.show();
  }

  close() {
    this.status = 'close';
    if (!this.portalOutlet) {
      throw Error('PortalHost no registrado');
    }

    if (this.portalOutlet.hasAttached()) {
      this.attachedPortal.instance.hide();
      this.portalOutlet.detach();
    }

    this.attachedPortal = null;
    this.portal$.next((null) as unknown as PortalInterface);
  }
}
