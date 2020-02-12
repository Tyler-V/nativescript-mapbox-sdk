import { MapboxViewBase } from './mapbox-sdk.common';

import { Map } from './ios/map.ios';
import { Offline } from './ios/offline.ios';
import { Style } from './ios/style.ios';
import { Location } from './ios/location.ios';
import { Annotation } from './ios/annotation.ios';

export { CameraMode, RenderMode, LocationOptions } from './common/location.common';
export { MapStyle } from './common/style.common';

export class MapboxView extends MapboxViewBase {
  private nativeMapView: MGLMapView;
  private delegate: MGLMapViewDelegate;

  constructor() {
    super();
    this.mapbox.map = new Map(this);
    this.mapbox.style = new Style(this);
    this.mapbox.offline = new Offline(this);
    this.mapbox.location = new Location(this);
    this.mapbox.annotation = new Annotation(this);
  }

  public createNativeView(): Object {
    let nativeView = super.createNativeView();

    setTimeout(() => {
      this.initMap();
    });

    return nativeView;
  }

  disposeNativeView(): void {}

  initMap(): void {
    if (!this.nativeMapView && this.config.accessToken) {
      // let settings = Mapbox.merge(this.config, Mapbox.defaults);

      console.log('MapboxView::initMap(): to with config:', this.config);

      let drawMap = () => {
        MGLAccountManager.accessToken = 'sk.eyJ1IjoidHZvcnBhaGwiLCJhIjoiY2s1dml5YXlxMHNncTNnbXgzNXVnYXQ0NyJ9.y0ofxDzXB4vi6KW372rLEQ';

        this.nativeMapView = MGLMapView.alloc().initWithFrameStyleURL(
          CGRectMake(0, 0, this.nativeView.frame.size.width, this.nativeView.frame.size.height),
          NSURL.URLWithString('mapbox://styles/mapbox/streets-v11')
        );

        // this delegate class is defined later in this file and is where, in Obj-C land,
        // callbacks are delivered and handled.

        this.nativeMapView.delegate = this.delegate = MGLMapViewDelegateImpl.new().initWithCallback(() => {
          console.log('MapboxView:initMap(): MLMapViewDeleteImpl onMapReady callback');

          this.notify({
            eventName: MapboxViewBase.mapReadyEvent,
            object: this,
            map: this,
            ios: this.nativeMapView,
          });
        });

        // this.nativeMapView.rotateEnabled = true;
        this.nativeMapView.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;

        // _setMapboxMapOptions(this.nativeMapView, settings);

        this.nativeView.addSubview(this.nativeMapView);
      };

      setTimeout(drawMap, 0);
    }
  }

  public onLayout(left: number, top: number, right: number, bottom: number): void {
    super.onLayout(left, top, right, bottom);
    if (this.nativeMapView) {
      this.nativeMapView.layer.frame = this.ios.layer.bounds;
    }
  }

  protected onDisableScrollChanged(oldValue: boolean, newValue: boolean) {
    if (this.mapbox) {
      //this.getMapboxApi().setScrollingEnabled(!newValue);
    }
  }
}

class MGLMapViewDelegateImpl extends NSObject implements MGLMapViewDelegate {
  public static ObjCProtocols = [MGLMapViewDelegate];
  private mapLoadedCallback: (mapView: MGLMapView) => void;
  private styleLoadedCallback: (mapView: MGLMapView) => void;
  private mapboxApi: any;
  private userLocationClickListener: any;
  private userLocationRenderMode: any;

  static new(): MGLMapViewDelegateImpl {
    return <MGLMapViewDelegateImpl>super.new();
  }

  // -----------------------

  /**
   * initialize with the mapReady callback
   */

  public initWithCallback(mapLoadedCallback: (mapView: MGLMapView) => void): MGLMapViewDelegateImpl {
    console.log('MGLMapViewDelegateImpl::initWithCallback()');

    this.mapLoadedCallback = mapLoadedCallback;
    return this;
  }
}
