import { ComponentPortal } from "@angular/cdk/portal";
import { SidePanel } from "./side-panel";

export interface PortalOptions {
  title: string;
  headerSize: 'small' | 'large';
}

export interface PortalInterface {
  id: string;
  portal: ComponentPortal<SidePanel>;
  options: PortalOptions;
}