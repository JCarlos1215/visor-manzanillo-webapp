import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import cuid from 'cuid';
import Projection from 'ol/proj/Projection';
import { ScaleLine, MousePosition } from 'ol/control';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { MapEventType, MapService, MapViewerComponent } from 'sic-mapping-toolkit';
import { IdentifyData } from 'src/app/modules/identify/models/identify-data';
import { SearchGroup } from 'src/app/modules/search/models/search-group';
import { LayerService } from 'src/app/modules/layer/services/layer.service';
import { TocService } from '../services/toc.service';
import { createStringXY } from 'ol/coordinate';
import { IdentifyService } from 'src/app/modules/identify/services/identify.service';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { FeatureService } from '../services/feature.service';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { SidePanelService } from '../components/side-panel/services/side-panel.service';
import { Extent } from 'ol/extent';
import { TableOfContentComponent } from '../components/table-of-content/table-of-content.component';
import { SearchService } from '../services/search.service';
import { TocTreeItem } from '../models/toc-tree-item';
import { PredioInformation } from '../models/predio-information';
import { CatastroService } from '../services/catastro.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PredioPreviewComponent } from '../components/predio-preview/predio-preview.component';
import { Loader } from '@googlemaps/js-api-loader';
import { ProjectionEnum, ReprojectionService } from '../services/reprojection.service';
import { ConoStreetView } from '../models/cono-street-view';

proj4.defs("EPSG:32613","+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs");
register(proj4);

const IDENTIFY_DRAWING_PREFIX = '[IDENTIFY]';
const SEARCH_DRAWING_PREFIX = '[SEARCH]';
const PREDIO_DRAWING_PREFIX = '[CATASTRO][PREDIO]';
const STREET_VIEW_DRAWING_PREFIX = '[STREET_VIEW]';

@Component({
  selector: 'sic-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss']
})
export class MapPageComponent implements OnInit, AfterViewInit, OnDestroy {
  mapId = `MapId.${cuid()}`;
  @ViewChild('mainMap', { static: true }) mainMap!: MapViewerComponent;

  projection: Projection = 'EPSG:32613' as unknown as Projection;
  center: [number, number] = [569507.684, 2114302.492];
  initialZoom: number = 12;

  // Identify
  activeIdentify = false;
  identifyCoordinates: any = [0, 0];
  identifyHandler!: string;
  identifyResults!: Array<IdentifyData>;

  predioHandler!: string;
  predioUrban!: PredioInformation[];
  predioUP!: PredioInformation[];
  predioParcela!: PredioInformation[];
  predioRustico!: PredioInformation[];
  backdropMessage: string = 'Obteniendo información...';
  showLoading: boolean = false;

  // Search
  isSearchActive = false;
  isSearching = false;
  searchResult: SearchGroup<any>[] = [];
  paintFeatures = false;
  private searchingService: any = null;

  // User information
  watchUser = true;

  hightLight: Style;

  controlScale: ScaleLine = new ScaleLine({
    units: 'metric',
    bar: true,
    steps: 2,
    text: true,
    minWidth: 100,
  });

  // StreetView
  svInProgrees: boolean = false;
  streetViewHandler!: string;
  movingStreetViewHandler!: string;
  streetviewBtn;
  streetViewService!: google.maps.StreetViewService;
  private gettingStreetViewTaking: any = null;

  constructor(
    private mapService: MapService,
    private layerService: LayerService,
    private tocService: TocService,
    private identifyService: IdentifyService,
    private featureService: FeatureService,
    private panelService: SidePanelService,
    private searchService: SearchService,
    private catastroService: CatastroService,
    private reprojectionService: ReprojectionService,
    public dialog: MatDialog
  ) {
    this.hightLight = new Style({
      fill: new Fill({
        color: 'rgba(181, 30, 28, 0.5)',
      }),
      stroke: new Stroke({
        color: '#b51e1c',
        width: 2,
      }),
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color: 'rgba(181, 30, 28, 0.5)',
        }),
      }),
    });
  }

  ngOnInit(): void {
    const loader = new Loader({
      apiKey: 'AIzaSyDSN-bEJrChUaYEwBvld5XNIz2hi2YT1rw',
      version: "weekly",
    });
    loader.load().then(() => {
      this.streetViewService = new google.maps.StreetViewService();
    });
  }

  ngOnDestroy(): void {
    this.panelService.close();
    this.deactivateIdentify();
    if (!!this.predioHandler) {
      this.mapService.removeEventHandler(this.predioHandler);
      this.predioHandler = null as unknown as string;
    }
  }

  ngAfterViewInit(): void {
    const mapId = this.mainMap.getMapId();
    this.mapService.setDefaultMapa(mapId);
    this.layerService.initialize();
    this.mapSettings(mapId);
    this.predioSelectionHandler();
  }

  private mapSettings(mapId: string): void {
    this.tocService.reloadLayers().subscribe((result) => {
      result.forEach((group) =>
        this.turnOnActiveLayers(group)
      );
    });

    const mousePosition = new MousePosition({
      coordinateFormat: createStringXY(2),
    });

    this.mapService.addControl(this.controlScale, mapId);
    this.mapService.addControl(mousePosition, mapId);

    this.addStreetViewGoogle();
    // this.activateIdentify();
  }

  

  turnOnActiveLayers(toc: TocTreeItem) {
    if (toc.isLayer) {
      if (toc.IsActive) {
        const data = toc.getLayerData();
        this.layerService.addLayer(data.id, data);
        this.layerService.setOpacity(data.id, data.opacity);
      }
    } else {
      toc.children.forEach((layer) => {
        this.turnOnActiveLayers(layer);
      });
    }
  }

  // #region Identifica

  toggleIdentify(): void {
    if (this.activeIdentify) {
      this.deactivateIdentify();
    } else {
      this.activateIdentify();
    }
    this.activeIdentify = !this.activeIdentify;
  }

  activateIdentify(): void {
    this.identifyHandler = this.mapService.addEventHandler(
      MapEventType.SINGLECLICK,
      (evt) => {
        const mapResolution = this.mapService
          .getMapById(this.mapId)
          .getViewResolution();
        if (
          this.layerService.LayerCount > 0 &&
          this.layerService.hasLayerVisible()
        ) {
          this.identifyResults = [];
          this.identifyService
            .identifyFeatures(evt.coordinate, mapResolution, this.projection)
            .subscribe((identifyData) => {
              this.identifyResults = identifyData;
              this.identifyCoordinates = evt.coordinate;
              this.markResult(identifyData);
            });
        } else {
          this.cleanIdentify();
        }
      },
      'HIGH',
      this.mapId
    );
  }

  deactivateIdentify(): void {
    this.cleanIdentify();
    if (!!this.identifyHandler) {
      this.mapService.removeEventHandler(this.identifyHandler);
      this.identifyHandler = null as unknown as string;
    }
  }

  cleanIdentify(): void {
    this.mapService.clearDrawings(IDENTIFY_DRAWING_PREFIX, this.mapId);
    this.identifyCoordinates = null;
    this.identifyResults = [];
  }

  markResult(data: any): void {
    const highlight = new Style({
      stroke: new Stroke({
        color: '#0000FF',
        width: 2,
      }),
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.3)',
        }),
      }),
    });
    const features: Feature<Geometry>[] = [];
    data.map((content: any) => {
      content.layers.map((item: any) => {
        if (item.geometry !== null) {
          features.push(
            this.featureService.createFeature(
              IDENTIFY_DRAWING_PREFIX,
              item.geometry,
              item
            )
          );
        }
      });
    });
    this.mapService.clearDrawings(IDENTIFY_DRAWING_PREFIX, this.mapId);
    this.mapService.getMapById(this.mapId).drawFeatures(features, highlight);
  }

  // Search bar and toc
  openMenu(): void {
    if (this.panelService.status === 'close') {
      this.panelService.open(TableOfContentComponent as any, {
        title: 'CAPAS Y MAPAS',
        headerSize: 'small',
      });
    } else {
      this.panelService.close();
    }
  }

  doSearch(search: any): void {
    if (!search.value) {
      this.isSearchActive = false;
      this.isSearching = false;
      this.searchResult = [];
      this.mapService.clearDrawings(SEARCH_DRAWING_PREFIX, this.mapId);
      return;
    }

    if (this.searchingService) {
      this.searchingService.unsubscribe();
    }
    
    this.isSearching = true;
    this.isSearchActive = true;
    this.mapService.clearDrawings(SEARCH_DRAWING_PREFIX, this.mapId);
    this.searchingService = this.searchService.search(search.value, SEARCH_DRAWING_PREFIX).subscribe((resp) => {
      this.isSearching = false;
      this.searchResult = resp;
      this.paintFeatures = false;
      this.searchingService = null;
      if (this.searchResult.length > 0) {
        if (search.keyCode === 'Enter') {
          this.paintFeatures = true;
          resp.map((feature: any) => {
            feature.content.map((item: any) => {
              this.mapService
                .getMapById(this.mapId)
                .drawFeatures([item.feature], this.hightLight);
            });
          });
        }
      }
    }, (err) => {
      console.log(err);
      this.isSearching = false;
      this.isSearchActive = false;
      this.searchResult = [];
      this.searchingService = null;
    });
    
  }

  onResultSelected(result: Feature<Geometry>) {
    if (!this.paintFeatures) {
      this.mapService.getMapById(this.mapId).drawFeatures([result], this.hightLight);
    }
    this.mapService
      .getMapById(this.mapId)
      .moveTo(result.getGeometry()?.getExtent() as Extent);
  }

  toggleUserInfo(watch: boolean) {
    this.watchUser = watch;
  }

  predioSelectionHandler() {
    let dialogRef;
    this.predioHandler = this.mapService.addEventHandler(
      MapEventType.SINGLECLICK, 
      (evt) => {
        const [x, y] = evt.coordinate;
        this.unselectPredio();
        if (dialogRef) {
          dialogRef.close();
        }
        this.showLoading = true;
        this.catastroService.getPredioInformationAtPoint(x, y).subscribe((res) => {
          this.predioUrban = res.PredioUrbano;
          this.predioUP = res.PredioUP;
          this.predioParcela = res.PredioParcela;
          this.predioRustico = res.PredioRustico;

          if (this.predioUrban.length > 0 || this.predioUP.length > 0 || this.predioParcela.length > 0 || this.predioRustico.length > 0) {
            this.predioUrban.map((p: PredioInformation) => {
              const feature = this.featureService.createFeature(
                PREDIO_DRAWING_PREFIX,
                p.geometry,
                { 
                  idPredio: p.idPredio,
                  clave: p.formattedClave
                }
              );
              this.mapService.drawFeature(feature, this.hightLight);
              this.mapService.getMapById(this.mapId).moveTo(feature.getGeometry().getExtent());
            });
            this.predioUP.map((p: PredioInformation) => {
              const feature = this.featureService.createFeature(
                PREDIO_DRAWING_PREFIX,
                p.geometry,
                { 
                  idPredio: p.idPredio,
                  clave: p.formattedClave
                }
              );
              this.mapService.drawFeature(feature, this.hightLight);
              this.mapService.getMapById(this.mapId).moveTo(feature.getGeometry().getExtent());
            });
            this.predioParcela.map((p: PredioInformation) => {
              const feature = this.featureService.createFeature(
                PREDIO_DRAWING_PREFIX,
                p.geometry,
                { 
                  idPredio: p.idPredio,
                  clave: p.formattedClave
                }
              );
              this.mapService.drawFeature(feature, this.hightLight);
              this.mapService.getMapById(this.mapId).moveTo(feature.getGeometry().getExtent());
            });
            this.predioRustico.map((p: PredioInformation) => {
              const feature = this.featureService.createFeature(
                PREDIO_DRAWING_PREFIX,
                p.geometry,
                { 
                  idPredio: p.idPredio,
                  clave: p.formattedClave
                }
              );
              this.mapService.drawFeature(feature, this.hightLight);
              this.mapService.getMapById(this.mapId).moveTo(feature.getGeometry().getExtent());
            });
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '300px';
            dialogConfig.height = '340px';
            dialogConfig.hasBackdrop = false;
            dialogConfig.data = { PredioUrbano: this.predioUrban, PredioUP: this.predioUP, PredioParcela: this.predioParcela, PredioRustico: this.predioRustico };
            this.showLoading = false;
            dialogRef = this.dialog.open(PredioPreviewComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(_result => {
              this.unselectPredio();
            });
          } else {
            this.showLoading = false;
          }
        });
      },
      'NORMAL',
      this.mapId
    );
  }

  unselectPredio(): void {
    this.predioUrban = [];
    this.predioUP = [];
    this.predioParcela = [];
    this.predioRustico = [];
    this.mapService.clearDrawings(PREDIO_DRAWING_PREFIX);
  }

  async addStreetViewGoogle() {
    this.streetviewBtn = document.getElementById('svbtn');
    let intervalId;
    if (this.streetviewBtn) {
      this.streetviewBtn.addEventListener('click', () => {
        this.svInProgrees = !this.svInProgrees;
        const streetviewIcon = document.getElementById('street-view-icon') as HTMLElement;
        if (this.svInProgrees) {
          const layerSV = this.tocService.searchByService('google-street-view');
          if (layerSV) {
            if (!layerSV.IsActive) {
              layerSV.toggleActiveStatus();
              const layerSVData = layerSV.getLayerData();
              this.layerService.addLayer(layerSVData.id, layerSVData);
              this.layerService.setOpacity(layerSVData.id, layerSVData.opacity);
            } 
          }
          this.catastroService.deleteStreetViewTaking().subscribe((_deleted) => {});

          streetviewIcon.classList.replace('normal-button', 'clicked-street-view');
          const circlespan = document.getElementById('person') as HTMLElement;
          document.body.classList.toggle('custom-cursor');
          circlespan.classList.remove('ocultariframe');
          let mouseX = 0;
          let mouseY = 0;
          let xp = 0;
          let yp = 0;

          this.movingStreetViewHandler = this.mapService.addEventHandler(MapEventType.POINTERMOVE, (ev) => {
            mouseX = ev.pixel[0];
            mouseY = ev.pixel[1] + 80;
          }, 'NORMAL', this.mapId);
      
          intervalId = setInterval(() => {
            xp += (mouseX - xp) / 6;
            yp += (mouseY - yp) / 6;
            circlespan.style.left = xp + 'px';
            circlespan.style.top = yp + 'px';
          }, 10);

          this.streetViewHandler = this.mapService.addEventHandler(MapEventType.SINGLECLICK, (evt) => {
            const [x, y] = evt.coordinate;
            const ll2utm = this.reprojectionService.reproject(ProjectionEnum.EPSG_32613, ProjectionEnum.LatLong, { x, y });
            this.activateGoogleStreetView({lat: ll2utm.y, lng: ll2utm.x})
          },
          'HIGH',
          this.mapId);

        } else {
          streetviewIcon.classList.replace('clicked-street-view', 'normal-button');
          document.body.classList.toggle('custom-cursor');
          const circlespan = document.getElementById('person') as HTMLElement;
          circlespan.classList.add('ocultariframe');
          clearInterval(intervalId);
          this.mapService.removeEventHandler(this.streetViewHandler, this.mapId);
          this.mapService.removeEventHandler(this.movingStreetViewHandler, this.mapId);
        }
      });
    }
  }

  activateGoogleStreetView(coords: { lat: number, lng: number }) {
    let panorama;  
    this.streetViewService.getPanorama({ location: coords }, (data, status) => {
      if (status === 'OK') {
        const centralCoordinates = data?.location?.latLng?.toJSON();
        const targetCoordinates = coords;
  
        const heading = google.maps.geometry.spherical.computeHeading(
          new google.maps.LatLng(
            centralCoordinates?.lat as number,
            centralCoordinates?.lng as number
          ),
          new google.maps.LatLng(
            targetCoordinates.lat,
            targetCoordinates.lng
          )
        );
  
        panorama = new google.maps.StreetViewPanorama(
          document.getElementById('street-view') as HTMLElement,
          {
            position: data?.location?.latLng,
            pov: { heading: heading, pitch: 0 },
            zoom: 1,
            enableCloseButton: true,
            visible: true,
          }
        );
  
        const element = document.getElementById('street-view') as HTMLElement;
        element.classList.remove('ocultariframe');

        google.maps.event.addListener(panorama, 'pov_changed', () => {
          if (this.gettingStreetViewTaking) {
            this.gettingStreetViewTaking.unsubscribe();
          }
          this.gettingStreetViewTaking = this.catastroService.getStreetViewTaking(panorama.getPosition().lat(), panorama.getPosition().lng(), panorama.getPov().heading, panorama.getPov().pitch, panorama.getPov().zoom, STREET_VIEW_DRAWING_PREFIX).subscribe((resultView: ConoStreetView) => {
            this.gettingStreetViewTaking = null;
            this.mapService.clearDrawings(STREET_VIEW_DRAWING_PREFIX);
            this.mapService.getMapById(this.mapId).drawFeatures([resultView.featureGeometry, resultView.featureFuente], this.hightLight);
            this.mapService.getMapById(this.mapId).moveTo(resultView.featureExtent.getGeometry()?.getExtent() as Extent);
          }, (error) => {
            console.log(error);
            this.gettingStreetViewTaking = null;
          });
        });
  
        google.maps.event.addListener(panorama, 'closeclick', () => {
          const element = document.getElementById("street-view") as HTMLElement;
          element.classList.add('ocultariframe');
          element.innerHTML = '';
          this.mapService.clearDrawings(STREET_VIEW_DRAWING_PREFIX);
        });
      } else {
        const element = document.getElementById('street-view') as HTMLElement;
        element.classList.add('ocultariframe');
        element.innerHTML = '';
        this.mapService.clearDrawings(STREET_VIEW_DRAWING_PREFIX);
        alert('No se cuenta con visualización en street view');
      }
      this.streetviewBtn.dispatchEvent(new Event("click"));
    });
  }
}
