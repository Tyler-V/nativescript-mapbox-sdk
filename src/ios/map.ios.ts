import { MapboxView, MapClickHandlerImpl, MapLongClickHandlerImpl, MapPanHandlerImpl } from '../mapbox-sdk.ios';
import { LatLng } from '../mapbox-sdk.common';
import * as utils from '@nativescript/core/utils';
import { MapboxMap, LatLngBounds, LatLngCameraOptions, BoundsCameraOptions, MapPanEvent } from '../common/map.common';
import * as turf from '@turf/turf';

function _getFeatures(features) {
  const results: Array<GeoJSON.Feature> = [];

  for (let i = 0; i < features.count; i++) {
    const feature: MGLFeature = features.objectAtIndex(i);

    const properties = {};
    if (feature.attributes && feature.attributes.count > 0) {
      const keys = utils.iOSNativeHelper.collections.nsArrayToJSArray(feature.attributes.allKeys);
      for (let key of keys) {
        properties[key] = feature.attributes.valueForKey(key);
      }
    }

    results.push({
      id: feature.identifier,
      type: 'Feature',
      properties,
      geometry: {
        type: 'Point',
        coordinates: [feature.coordinate.longitude, feature.coordinate.latitude],
      },
    });
  }

  return results;
}
export class Map extends MapboxMap {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  private setCamera(camera: MGLMapCamera, animationDuration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const mapView: MGLMapView = this.view.mapView;
      if (animationDuration) {
        mapView.flyToCameraWithDurationCompletionHandler(camera, animationDuration / 1000, () => {
          resolve();
        });
      } else {
        mapView.setCameraAnimated(camera, false);
        resolve();
      }
    });
  }

  setCameraToLatLng(latLng: LatLng, options?: LatLngCameraOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      options.bearing = options.bearing ? options.bearing : this.getBearing();
      options.tilt = options.tilt ? options.tilt : this.getTilt();
      options.zoom = options.zoom ? options.zoom : this.getZoom();

      const viewportSize = CGSizeMake(this.view.getActualSize().width, this.view.getActualSize().height);
      const altitude = MGLAltitudeForZoomLevel(options.zoom, options.tilt, latLng.lat, viewportSize);

      let mglMapCamera = MGLMapCamera.alloc();
      mglMapCamera.centerCoordinate = CLLocationCoordinate2DMake(latLng.lat, latLng.lng);
      mglMapCamera.heading = options.bearing;
      mglMapCamera.pitch = options.tilt;
      mglMapCamera.altitude = altitude;

      resolve(this.setCamera(mglMapCamera, options.animationDuration));
    });
  }

  setCameraToBounds(latLngBounds: LatLngBounds, options?: BoundsCameraOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let mglCoordinateBounds: MGLCoordinateBounds = {
        sw: CLLocationCoordinate2DMake(latLngBounds.south, latLngBounds.west),
        ne: CLLocationCoordinate2DMake(latLngBounds.north, latLngBounds.east),
      };

      let insets: UIEdgeInsets = {
        top: options.padding ? options.padding : 0,
        left: options.padding ? options.padding : 0,
        bottom: options.padding ? options.padding : 0,
        right: options.padding ? options.padding : 0,
      };

      const mapView: MGLMapView = this.view.mapView;
      const mglMapCamera = mapView.cameraThatFitsCoordinateBoundsEdgePadding(mglCoordinateBounds, insets);
      mglMapCamera.heading = options.bearing ? options.bearing : this.getBearing();
      mglMapCamera.pitch = options.tilt ? options.tilt : this.getTilt();

      resolve(this.setCamera(mglMapCamera, options.animationDuration));
    });
  }

  setCameraToCoordinates(latLngs: LatLng[], options?: BoundsCameraOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let coordinates = [];
      latLngs.forEach((latLng) => {
        coordinates.push([latLng.lng, latLng.lat]);
      });
      const points = turf.points(coordinates);
      const bbox = turf.bbox(points);

      let mglCoordinateBounds: MGLCoordinateBounds = {
        sw: CLLocationCoordinate2DMake(bbox[1], bbox[0]),
        ne: CLLocationCoordinate2DMake(bbox[3], bbox[2]),
      };

      let insets: UIEdgeInsets = {
        top: options.padding ? options.padding : 0,
        left: options.padding ? options.padding : 0,
        bottom: options.padding ? options.padding : 0,
        right: options.padding ? options.padding : 0,
      };

      const mapView: MGLMapView = this.view.mapView;
      const mglMapCamera = mapView.cameraThatFitsCoordinateBoundsEdgePadding(mglCoordinateBounds, insets);
      mglMapCamera.heading = options.bearing ? options.bearing : this.getBearing();
      mglMapCamera.pitch = options.tilt ? options.tilt : this.getTilt();

      resolve(this.setCamera(mglMapCamera, options.animationDuration));
    });
  }

  addOnMapClickListener(listener: (latLng: LatLng) => void) {
    this.view.mapView.mapClickHandler = MapClickHandlerImpl.initWithOwnerAndListenerForMap(new WeakRef(this), listener, this.view.mapView);
    const tapGestureRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(this.view.mapView.mapClickHandler, 'tap');

    for (let i = 0; i < this.view.mapView.gestureRecognizers.count; i++) {
      let recognizer: UIGestureRecognizer = this.view.mapView.gestureRecognizers.objectAtIndex(i);
      if (recognizer instanceof UITapGestureRecognizer) {
        tapGestureRecognizer.requireGestureRecognizerToFail(recognizer);
      }
    }

    this.view.mapView.addGestureRecognizer(tapGestureRecognizer);

    return false;
  }

  addOnMapLongClickListener(listener: (latLng: LatLng) => void) {
    this.view.mapView.mapLongClickHandler = MapLongClickHandlerImpl.initWithOwnerAndListenerForMap(new WeakRef(this), listener, this.view.mapView);
    const longClickGestureRecognizer = UILongPressGestureRecognizer.alloc().initWithTargetAction(this.view.mapView.mapLongClickHandler, 'longClick');

    for (let i = 0; i < this.view.mapView.gestureRecognizers.count; i++) {
      let recognizer: UIGestureRecognizer = this.view.mapView.gestureRecognizers.objectAtIndex(i);
      if (recognizer instanceof UILongPressGestureRecognizer) {
        longClickGestureRecognizer.requireGestureRecognizerToFail(recognizer);
      }
    }

    this.view.mapView.addGestureRecognizer(longClickGestureRecognizer);

    return false;
  }

  addOnMapPanListener(listener: (event: MapPanEvent) => void) {
    this.view.mapView.mapPanHandler = MapPanHandlerImpl.initWithOwnerAndListenerForMap(new WeakRef(this), listener, this.view.mapView);
    const panGestureRecognizer = UIPanGestureRecognizer.alloc().initWithTargetAction(this.view.mapView.mapPanHandler, 'pan');

    for (let i = 0; i < this.view.mapView.gestureRecognizers.count; i++) {
      let recognizer: UIGestureRecognizer = this.view.mapView.gestureRecognizers.objectAtIndex(i);
      if (recognizer instanceof UIPanGestureRecognizer) {
        panGestureRecognizer.requireGestureRecognizerToFail(recognizer);
      }
    }

    this.view.mapView.addGestureRecognizer(panGestureRecognizer);
  }

  getZoom() {
    const zoom = this.view.mapView.zoomLevel;
    return zoom;
  }

  setMinimumZoomLevel(zoomLevel: number): void {
    this.view.mapView.minimumZoomLevel = zoomLevel;
  }

  setMaximumZoomLevel(zoomLevel: number): void {
    this.view.mapView.maximumZoomLevel = zoomLevel;
  }

  getTilt() {
    const tilt = this.view.mapView.camera.pitch;
    return tilt;
  }

  getBearing() {
    const bearing = this.view.mapView.camera.heading;
    return bearing;
  }

  getCenter() {
    const coordinate = this.view.mapView.centerCoordinate;
    return {
      lat: coordinate.latitude,
      lng: coordinate.longitude,
    };
  }

  getBounds(): LatLngBounds {
    let visibleCoordinateBounds = this.view.mapView.visibleCoordinateBounds;
    return {
      north: visibleCoordinateBounds.ne.latitude,
      east: visibleCoordinateBounds.ne.longitude,
      south: visibleCoordinateBounds.sw.latitude,
      west: visibleCoordinateBounds.sw.longitude,
    };
  }

  queryRenderedFeatures(point: LatLng, ...layerIds: string[]): Array<GeoJSON.Feature> {
    const mapView: MGLMapView = this.view.mapView;
    const coordinate = CLLocationCoordinate2DMake(point.lat, point.lng);
    const cgPoint = mapView.convertCoordinateToPointToView(coordinate, mapView);

    let features;
    if (layerIds != null && layerIds.length) {
      const styleLayerIdentifiers = NSSet.setWithArray(layerIds);
      features = mapView.visibleFeaturesAtPointInStyleLayersWithIdentifiers(cgPoint, styleLayerIdentifiers);
    } else {
      features = mapView.visibleFeaturesAtPoint(cgPoint);
    }

    return _getFeatures(features);
  }

  queryRenderedFeaturesByBounds(bounds?: LatLngBounds, ...layerIds: string[]): Array<GeoJSON.Feature> {
    const mapView: MGLMapView = this.view.mapView;
    let rect;

    if (!bounds) {
      let mglCoordinateBounds = mapView.visibleCoordinateBounds;
      rect = mapView.convertCoordinateBoundsToRectToView(mglCoordinateBounds, mapView);
    } else {
      let swCoordinate = CLLocationCoordinate2DMake(bounds.south, bounds.west);
      let neCoordinate = CLLocationCoordinate2DMake(bounds.north, bounds.east);
      let mglCoordinateBounds: MGLCoordinateBounds = { sw: swCoordinate, ne: neCoordinate };
      rect = mapView.convertCoordinateBoundsToRectToView(mglCoordinateBounds, mapView);
    }

    let features;
    if (layerIds != null && layerIds.length) {
      const styleLayerIdentifiers = NSSet.setWithArray(layerIds);
      features = mapView.visibleFeaturesInRectInStyleLayersWithIdentifiers(rect, styleLayerIdentifiers);
    } else {
      features = mapView.visibleFeaturesInRect(rect);
    }

    return _getFeatures(features);
  }

  setAllGesturesEnabled(enabled: boolean) {
    this.view.mapView.zoomEnabled = enabled;
    this.view.mapView.scrollEnabled = enabled;
    this.view.mapView.pitchEnabled = enabled;
    this.view.mapView.rotateEnabled = enabled;
  }

  setCompassEnabled(enabled: boolean) {
    this.view.mapView.compassView.hidden = enabled;
  }

  setLogoEnabled(enabled: boolean) {
    this.view.mapView.attributionButton.hidden = enabled; // This is for the info icon on bottom right
    this.view.mapView.logoView.hidden = enabled; // This is for the mapbox logo on bottom left
  }
}
