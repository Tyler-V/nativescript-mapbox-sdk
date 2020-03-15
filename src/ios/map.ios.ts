import { MapboxView, MapClickHandlerImpl, MapLongClickHandlerImpl } from '../mapbox-sdk.ios';
import { LatLng } from '../mapbox-sdk.common';
import * as utils from 'tns-core-modules/utils/utils';
import { MapboxMap, CameraPosition, LatLngBounds, Feature } from '../common/map.common';

function _getFeatures(features) {
  const results: Array<Feature> = [];

  for (let i = 0; i < features.count; i++) {
    const feature: MGLFeature = features.objectAtIndex(i);
    const properties = [];

    if (feature.attributes && feature.attributes.count > 0) {
      const keys = utils.ios.collections.nsArrayToJSArray(feature.attributes.allKeys);

      for (let key of keys) {
        properties.push({
          key,
          value: feature.attributes.valueForKey(key),
        });
      }
    }
    results.push({
      id: feature.identifier,
      properties,
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
      try {
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

        this.view.mapView.setCameraWithDurationAnimationTimingFunctionCompletionHandler(
          camera,
          duration / 1000,
          CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut),
          () => {
            resolve();
          }
        );
      } catch (ex) {
        console.log('Error in mapbox.animateCamera: ' + ex);
        reject(ex);
      }
    });
  }

  addOnMapClickListener(listener: (latLng: LatLng) => void) {
    this.view.mapView['mapClickHandler'] = MapClickHandlerImpl.initWithOwnerAndListenerForMap(new WeakRef(this), listener, this.view.mapView);
    const tapGestureRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(this.view.mapView['mapClickHandler'], 'tap');

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
    this.view.mapView['mapLongClickHandler'] = MapLongClickHandlerImpl.initWithOwnerAndListenerForMap(new WeakRef(this), listener, this.view.mapView);
    const longClickGestureRecognizer = UILongPressGestureRecognizer.alloc().initWithTargetAction(this.view.mapView['mapLongClickHandler'], 'longClick');

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

  queryRenderedFeatures(point: LatLng, ...layerIds: string[]): Array<Feature> {
    const { x, y } = this.view.mapView.convertCoordinateToPointToView({ latitude: point.lat, longitude: point.lng }, this.view.mapView);
    const features = this.view.mapView.visibleFeaturesAtPointInStyleLayersWithIdentifiers({ x, y }, layerIds);

    return _getFeatures(features);
  }

  queryRenderedFeaturesByBounds(bounds: LatLngBounds, ...layerIds: string[]): Array<Feature> {
    let swCoordinate = CLLocationCoordinate2DMake(bounds.south, bounds.west);
    let neCoordinate = CLLocationCoordinate2DMake(bounds.north, bounds.east);
    let coordBounds: MGLCoordinateBounds = { sw: swCoordinate, ne: neCoordinate };

    const rect = this.view.mapView.convertCoordinateBoundsToRectToView(coordBounds, this.view.mapView);
    const features = this.view.mapView.visibleFeaturesInRectInStyleLayersWithIdentifiers(rect, layerIds);

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
