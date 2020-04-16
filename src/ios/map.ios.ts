import { MapboxView, MapClickHandlerImpl, MapLongClickHandlerImpl } from '../mapbox-sdk.ios';
import { LatLng } from '../mapbox-sdk.common';
import * as utils from 'tns-core-modules/utils/utils';
import { MapboxMap, CameraPosition, LatLngBounds } from '../common/map.common';
import { toReferenceToCArray } from './utils.ios';

function _getFeatures(features) {
  const results: Array<GeoJSON.Feature> = [];

  for (let i = 0; i < features.count; i++) {
    const feature: MGLFeature = features.objectAtIndex(i);

    const properties = {};
    if (feature.attributes && feature.attributes.count > 0) {
      const keys = utils.ios.collections.nsArrayToJSArray(feature.attributes.allKeys);
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

  animateCamera(options: CameraPosition, duration: number = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!options.latLng) {
        reject('A position is required');
        return;
      }

      options.bearing = options.bearing ? options.bearing : this.getBearing();
      options.tilt = options.tilt ? options.tilt : this.getTilt();
      options.zoom = options.zoom ? options.zoom : this.getZoom();

      const viewportSize = CGSizeMake(this.view.getMeasuredWidth(), this.view.getMeasuredHeight());
      const altitude = MGLAltitudeForZoomLevel(options.zoom, options.tilt, options.latLng.lat, viewportSize);

      let camera = MGLMapCamera.alloc();
      camera.centerCoordinate = CLLocationCoordinate2DMake(options.latLng.lat, options.latLng.lng);
      camera.heading = options.bearing;
      camera.pitch = options.tilt;
      camera.altitude = altitude;

      this.view.mapView.flyToCameraWithDurationCompletionHandler(camera, duration / 1000, () => {
        resolve();
      });
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

  setCameraToBounds(latLngBounds: LatLngBounds, padding?: number, animated?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const mapView: MGLMapView = this.view.mapView;

      let bounds: MGLCoordinateBounds = {
        sw: CLLocationCoordinate2DMake(latLngBounds.south, latLngBounds.west),
        ne: CLLocationCoordinate2DMake(latLngBounds.north, latLngBounds.east),
      };

      let insets: UIEdgeInsets = {
        top: padding ? padding : 0,
        left: padding ? padding : 0,
        bottom: padding ? padding : 0,
        right: padding ? padding : 0,
      };

      mapView.setVisibleCoordinateBoundsEdgePaddingAnimatedCompletionHandler(bounds, insets, animated, () => {
        resolve();
      });
    });
  }

  setCameraToCoordinates(latLngs: LatLng[], padding?: number, duration?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const mapView: MGLMapView = this.view.mapView;

      let insets: UIEdgeInsets = {
        top: padding ? padding : 0,
        left: padding ? padding : 0,
        bottom: padding ? padding : 0,
        right: padding ? padding : 0,
      };

      const coordinates: CLLocationCoordinate2D[] = [];
      for (let latLng of latLngs) {
        const coordinate = CLLocationCoordinate2DMake(latLng.lat, latLng.lng);
        coordinates.push(coordinate);
      }

      const coordinatesAsCArray = toReferenceToCArray(coordinates, CLLocationCoordinate2D);

      mapView.setVisibleCoordinatesCountEdgePaddingDirectionDurationAnimationTimingFunctionCompletionHandler(
        coordinatesAsCArray,
        coordinates.length,
        insets,
        0,
        duration / 1000,
        CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut),
        () => {
          resolve();
        }
      );
    });
  }
}
