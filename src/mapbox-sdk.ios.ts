import { Utils } from '@nativescript/core';
import { MapboxViewBase, LatLng, MapViewOptions } from './mapbox-sdk.common';
import { Map } from './ios/map.ios';
import { Offline } from './ios/offline.ios';
import { Style } from './ios/style.ios';
import { Location } from './ios/location.ios';
import { Annotation } from './ios/annotation.ios';
import { MapStyle } from './common/style.common';
import { MapPanEvent } from './common/map.common';

export { TrackingMode, LocationOptions } from './common/location.common';
export { MapStyle, LayerType } from './common/style.common';
export { MapboxColor } from './common/color.common';
export { MapPanEvent } from './common/map.common';

export class MapboxView extends MapboxViewBase {
  delegate: MGLMapViewDelegate;

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

    Utils.setTimeout(() => {
      this.initMap();
    });

    return nativeView;
  }

  disposeNativeView(): void {}

  initMap(): void {
    if (!this.mapView && this.config.accessToken) {
      let settings = this.config;

      let drawMap = () => {
        MGLAccountManager.accessToken = this.config.accessToken;

        this.mapView = MGLMapView.alloc().initWithFrame(CGRectMake(0, 0, this.nativeView.frame.size.width, this.nativeView.frame.size.height));

        this.mapView.delegate = this.delegate = createMGLMapViewDelegate((mapView: MGLMapView) => {
          this.notify({
            eventName: MapboxViewBase.mapReadyEvent,
            object: this,
          });
          const mapStyle = settings.mapStyle ? settings.mapStyle : MapStyle.MAPBOX_STREETS;
          this.mapbox.style.setStyleUri(mapStyle);
        });

        let delegate = this.mapView.delegate;
        delegate.onMapViewDidBecomeIdle = (mapView: MGLMapView) => {
          this.notify({
            eventName: MapboxViewBase.mapIdleEvent,
            object: this,
          });
        };

        delegate.onMapViewAnnotationCanShowCallout = (mapView: MGLMapView, annotation: MGLAnnotation) => {
          this.notify({
            eventName: 'annotationCanShowCallout',
            object: <any>annotation,
          });
          return true;
        };

        delegate.onMapViewTapOnCalloutForAnnotation = (mapView: MGLMapView, annotation: MGLAnnotation) => {
          this.notify({
            eventName: 'tapOnCalloutForAnnotation',
            object: <any>annotation,
          });
        };

        delegate.onMapViewViewForAnnotation = (mapView: MGLMapView, annotation: MGLAnnotation) => {
          if (annotation.isKindOfClass(MGLUserLocation.class())) {
            return null;
          }
          this.notify({
            eventName: 'viewViewForAnnotation',
            object: <any>annotation,
          });
          return MGLAnnotationView.alloc().initWithFrame(CGRectMake(0, 0, 20, 20));
        };

        this.mapView.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;

        this.setMapboxOptions(this.mapView, settings);

        this.nativeView.addSubview(this.mapView);
      };

      Utils.setTimeout(drawMap);
    }
  }

  public onLayout(left: number, top: number, right: number, bottom: number): void {
    super.onLayout(left, top, right, bottom);
    if (this.mapView) {
      this.mapView.layer.frame = this.ios.layer.bounds;
    }
  }

  private setMapboxOptions(mapView: MGLMapView, settings: MapViewOptions) {
    mapView.compassView.hidden = settings.hideCompass;
    mapView.rotateEnabled = !settings.disableRotation;
    mapView.scrollEnabled = !settings.disableScroll;
    mapView.allowsTilting = !settings.disableTilt;
    mapView.zoomEnabled = !settings.disableZoom;
    mapView.attributionButton.hidden = settings.hideAttribution;
    mapView.logoView.hidden = settings.hideLogo;

    if (settings.minZoom) mapView.minimumZoomLevel = settings.minZoom;
    if (settings.maxZoom) mapView.maximumZoomLevel = settings.maxZoom;

    if (settings.center && settings.center.lat && settings.center.lng) {
      let centerCoordinate = CLLocationCoordinate2DMake(settings.center.lat, settings.center.lng);
      mapView.setCenterCoordinateZoomLevelAnimated(centerCoordinate, this.config.zoomLevel, false);
    } else {
      mapView.setZoomLevelAnimated(this.config.zoomLevel, false);
    }
  }
}

function createMGLMapViewDelegate(callback: (mapView: MGLMapView) => void): MGLMapViewDelegate {
  @NativeClass()
  class MGLMapViewDelegateImpl extends NSObject implements MGLMapViewDelegate {
    public static ObjCProtocols = [MGLMapViewDelegate];
    private mapLoadedCallback: (mapView: MGLMapView) => void;
    private styleLoadedCallback: (mapView: MGLMapView, style: MGLStyle) => void;
    public onMapViewDidBecomeIdle: (mapView: MGLMapView) => void;
    public onMapViewTapOnCalloutForAnnotation: (mapView: MGLMapView, annotation: MGLAnnotation) => void;
    public onMapViewAnnotationCanShowCallout: (mapView: MGLMapView, annotation: MGLAnnotation) => boolean;
    public onMapViewViewForAnnotation: (mapView: MGLMapView, annotation: MGLAnnotation) => MGLAnnotationView;
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

    /**
     * map ready callback
     */
    mapViewDidFinishLoadingMap(mapView: MGLMapView): void {
      console.log('MGLMapViewDelegateImpl:mapViewDidFinishLoadingMap(): top');

      if (this.mapLoadedCallback !== undefined) {
        this.mapLoadedCallback(mapView);

        // this should be fired only once, but it's also fired when the style changes, so just remove the callback
        this.mapLoadedCallback = undefined;
      }
    }

    /**
     * Callback when the style has been loaded.
     *
     * Based on my testing, it looks like this callback is invoked multiple times.
     *
     * @see Mapbox:setMapStyle()
     *
     * @link https://mapbox.github.io/mapbox-gl-native/macos/0.3.0/Protocols/MGLMapViewDelegate.html#/c:objc(pl)MGLMapViewDelegate(im)mapView:didFinishLoadingStyle:
     */
    mapViewDidFinishLoadingStyle(mapView: MGLMapView, style: MGLStyle): void {
      console.log('MGLMapViewDelegateImpl:mapViewDidFinishLoadingStyle(): callback called.');

      if (this.styleLoadedCallback !== undefined) {
        this.styleLoadedCallback(mapView, style);

        // to avoid multiple calls. This is only invoked from setMapStyle().
        this.styleLoadedCallback = undefined;
      }
    }

    /**
     * set style loaded callback.
     *
     * set an optional callback to be invoked when a style set with
     * setMapStyle() is finished loading
     *
     * Note, from testing, it seems this callback can be invoked multiple times
     * for a single style setting. It is up to the caller to handle this.
     *
     * @param {function} callback function with loaded style as parameter.
     */
    setStyleLoadedCallback(callback) {
      this.styleLoadedCallback = callback;
    }

    mapViewDidBecomeIdle(mapView: MGLMapView): void {
      console.log('MGLMapViewDelegateImpl:mapView:didBecomeIdle');
      this.onMapViewDidBecomeIdle(mapView);
    }

    mapViewTapOnCalloutForAnnotation(mapView: MGLMapView, annotation: MGLAnnotation): void {
      console.log('MGLMapViewDelegateImpl:mapView:tapOnCalloutForAnnotation');
      this.onMapViewTapOnCalloutForAnnotation(mapView, annotation);
    }

    mapViewAnnotationCanShowCallout(mapView: MGLMapView, annotation: MGLAnnotation): boolean {
      console.log('MGLMapViewDelegateImpl:mapView:annotationCanShowCallout');
      return this.onMapViewAnnotationCanShowCallout(mapView, annotation);
    }

    mapViewViewForAnnotation(mapView: MGLMapView, annotation: MGLAnnotation): MGLAnnotationView {
      console.log('MGLMapViewDelegateImpl:mapView:viewForAnnotation');
      return this.onMapViewViewForAnnotation(mapView, annotation);
    }
  }
  return MGLMapViewDelegateImpl.new().initWithCallback(callback);
}

export function createMapClickHandler(owner: WeakRef<Map>, listener: (data: LatLng) => void, mapView: MGLMapView): any {
  @NativeClass()
  class MapClickHandlerImpl extends NSObject {
    private _owner: WeakRef<Map>;
    private _listener: (data: LatLng) => void;
    private _mapView: MGLMapView;

    public static initWithOwnerAndListenerForMap(owner: WeakRef<Map>, listener: (data: LatLng) => void, mapView: MGLMapView): MapClickHandlerImpl {
      let handler = <MapClickHandlerImpl>MapClickHandlerImpl.new();
      handler._owner = owner;
      handler._listener = listener;
      handler._mapView = mapView;
      return handler;
    }

    public tap(recognizer: UITapGestureRecognizer): void {
      const tapPoint = recognizer.locationInView(this._mapView);

      const tapCoordinate = this._mapView.convertPointToCoordinateFromView(tapPoint, this._mapView);
      this._listener({
        lat: tapCoordinate.latitude,
        lng: tapCoordinate.longitude,
      });
    }

    public static ObjCExposedMethods = {
      tap: { returns: interop.types.void, params: [interop.types.id] },
    };
  }

  return MapClickHandlerImpl.initWithOwnerAndListenerForMap(owner, listener, mapView);
}

export function createMapLongClickHandler(owner: WeakRef<Map>, listener: (data?: LatLng) => void, mapView: MGLMapView): any {
  @NativeClass()
  class MapLongClickHandlerImpl extends NSObject {
    private _owner: WeakRef<Map>;
    private _listener: (data?: LatLng) => void;
    private _mapView: MGLMapView;

    public static initWithOwnerAndListenerForMap(owner: WeakRef<Map>, listener: (data?: LatLng) => void, mapView: MGLMapView): MapLongClickHandlerImpl {
      let handler = <MapLongClickHandlerImpl>MapLongClickHandlerImpl.new();
      handler._owner = owner;
      handler._listener = listener;
      handler._mapView = mapView;
      return handler;
    }

    public longClick(recognizer: UILongPressGestureRecognizer): void {
      const longClickPoint = recognizer.locationInView(this._mapView);
      const longClickCoordinate = this._mapView.convertPointToCoordinateFromView(longClickPoint, this._mapView);
      this._listener({
        lat: longClickCoordinate.latitude,
        lng: longClickCoordinate.longitude,
      });
    }

    public static ObjCExposedMethods = {
      longClick: { returns: interop.types.void, params: [interop.types.id] },
    };
  }
  return MapLongClickHandlerImpl.initWithOwnerAndListenerForMap(owner, listener, mapView);
}

export function createMapPanHandler(owner: WeakRef<Map>, listener: (data?: MapPanEvent) => void, mapView: MGLMapView): any {
  @NativeClass()
  class MapPanHandlerImpl extends NSObject {
    private _owner: WeakRef<Map>;
    private _listener: (event: MapPanEvent) => void;
    private onMoveBegin: boolean;
    private _mapView: MGLMapView;

    public static initWithOwnerAndListenerForMap(owner: WeakRef<Map>, listener: (event: MapPanEvent) => void, mapView: MGLMapView): MapPanHandlerImpl {
      let handler = <MapPanHandlerImpl>MapPanHandlerImpl.new();
      handler._owner = owner;
      handler._listener = listener;
      handler._mapView = mapView;
      return handler;
    }

    public pan(recognizer: UIPanGestureRecognizer): void {
      switch (recognizer.state) {
        case UIGestureRecognizerState.Began:
          this._listener(MapPanEvent.Begin);
          break;
        case UIGestureRecognizerState.Changed:
          this._listener(MapPanEvent.Pan);
          break;
        case UIGestureRecognizerState.Ended:
          this._listener(MapPanEvent.End);
          break;
      }
    }

    public static ObjCExposedMethods = {
      pan: { returns: interop.types.void, params: [interop.types.id] },
    };
  }

  return MapPanHandlerImpl.initWithOwnerAndListenerForMap(owner, listener, mapView);
}
