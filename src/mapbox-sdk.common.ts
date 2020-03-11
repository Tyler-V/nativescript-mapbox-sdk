import { ContentView } from 'tns-core-modules/ui/content-view';
import { booleanConverter, Property } from 'tns-core-modules/ui/core/view';
import { MapboxStyle } from './common/style.common';
import { MapboxLocation } from './common/location.common';
import { MapboxMap } from './common/map.common';
import { MapboxOffline } from './common/offline.common';
import { MapboxAnnotation } from './common/annotation.common';

export interface LatLng {
  lat: number;
  lng: number;
}

export class MapboxStatic {
  public static defaults = {
    margins: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    zoomLevel: 0, // 0 (a big part of the world) to 20 (street level)
    showUserLocation: false, // true requires adding `NSLocationWhenInUseUsageDescription` or `NSLocationAlwaysUsageDescription` in the .plist
    hideLogo: false, // required for the 'starter' plan
    hideAttribution: true,
    hideCompass: false,
    disableRotation: false,
    disableScroll: false,
    disableZoom: false,
    disableTilt: false,
    delay: 0,
  };

  public static merge(obj1: {}, obj2: {}): any {
    // Our merge function
    let result = {}; // return result
    for (let i in obj1) {
      // for every property in obj1
      if (i in obj2 && typeof obj1[i] === 'object' && i !== null) {
        result[i] = this.merge(obj1[i], obj2[i]); // if it's an object, merge
      } else {
        result[i] = obj1[i]; // add it to result
      }
    }
    for (let i in obj2) {
      // add the remaining properties from object 2
      if (i in result) {
        // conflict
        continue;
      }
      result[i] = obj2[i];
    }
    return result;
  }
}

export interface ShowOptions {
  accessToken: string;
  style?: string;
  styleUri?: string;
  center?: LatLng;
  zoomLevel?: number;
  showUserLocation?: boolean;
  hideLogo?: boolean;
  hideAttribution?: boolean;
  hideCompass?: boolean;
  disableRotation?: boolean;
  disableScroll?: boolean;
  disableZoom?: boolean;
  disableTilt?: boolean;
}

export abstract class MapboxApi extends ContentView {}

export const accessTokenProperty = new Property<MapboxApi, string>({ name: 'accessToken' });
accessTokenProperty.register(MapboxApi);

export const mapStyleProperty = new Property<MapboxApi, string>({ name: 'mapStyle' });
mapStyleProperty.register(MapboxApi);

export const zoomLevelProperty = new Property<MapboxApi, number>({ name: 'zoomLevel' });
zoomLevelProperty.register(MapboxApi);

export const latitudeProperty = new Property<MapboxApi, number>({ name: 'latitude' });
latitudeProperty.register(MapboxApi);

export const longitudeProperty = new Property<MapboxApi, number>({ name: 'longitude' });
longitudeProperty.register(MapboxApi);

export const showUserLocationProperty = new Property<MapboxApi, boolean>({
  name: 'showUserLocation',
  defaultValue: MapboxStatic.defaults.showUserLocation,
  valueConverter: booleanConverter,
});
showUserLocationProperty.register(MapboxApi);

export const hideLogoProperty = new Property<MapboxApi, boolean>({
  name: 'hideLogo',
  defaultValue: MapboxStatic.defaults.hideLogo,
  valueConverter: booleanConverter,
});
hideLogoProperty.register(MapboxApi);

export const hideAttributionProperty = new Property<MapboxApi, boolean>({
  name: 'hideAttribution',
  defaultValue: MapboxStatic.defaults.hideAttribution,
  valueConverter: booleanConverter,
});
hideAttributionProperty.register(MapboxApi);

export const hideCompassProperty = new Property<MapboxApi, boolean>({
  name: 'hideCompass',
  defaultValue: MapboxStatic.defaults.hideCompass,
  valueConverter: booleanConverter,
});
hideCompassProperty.register(MapboxApi);

export const disableZoomProperty = new Property<MapboxApi, boolean>({
  name: 'disableZoom',
  defaultValue: MapboxStatic.defaults.disableZoom,
  valueConverter: booleanConverter,
});
disableZoomProperty.register(MapboxApi);

export const disableRotationProperty = new Property<MapboxApi, boolean>({
  name: 'disableRotation',
  defaultValue: MapboxStatic.defaults.disableRotation,
  valueConverter: booleanConverter,
});
disableRotationProperty.register(MapboxApi);

export const disableScrollProperty = new Property<MapboxApi, boolean>({
  name: 'disableScroll',
  defaultValue: MapboxStatic.defaults.disableScroll,
  valueConverter: booleanConverter,
});
disableScrollProperty.register(MapboxApi);

export const disableTiltProperty = new Property<MapboxApi, boolean>({
  name: 'disableTilt',
  defaultValue: MapboxStatic.defaults.disableTilt,
  valueConverter: booleanConverter,
});
disableTiltProperty.register(MapboxApi);

export const delayProperty = new Property<MapboxApi, number>({ name: 'delay' });
delayProperty.register(MapboxApi);

export class Mapbox {
  public map: MapboxMap;
  public style: MapboxStyle;
  public offline: MapboxOffline;
  public location: MapboxLocation;
  public annotation: MapboxAnnotation;
}

export abstract class MapboxViewBase extends MapboxApi {
  static mapReadyEvent: string = 'mapReady';
  static styleLoadedEvent: string = 'styleLoaded';

  protected config: any = {};

  public mapbox: Mapbox;
  public mapView;
  public mapStyle;
  public mapboxMap; // android

  constructor() {
    super();
    this.mapbox = new Mapbox();
  }

  [zoomLevelProperty.setNative](value: number) {
    this.config.zoomLevel = +value;
  }

  [mapStyleProperty.setNative](value: string) {
    this.config.style = value;
    this.config.mapStyle = value;
  }

  [accessTokenProperty.setNative](value: string) {
    this.config.accessToken = value;
  }

  [delayProperty.setNative](value: number) {
    this.config.delay = parseInt('' + value);
  }

  [latitudeProperty.setNative](value: number) {
    this.config.center = this.config.center || {};
    this.config.center.lat = +value;
  }

  [longitudeProperty.setNative](value: number) {
    this.config.center = this.config.center || {};
    this.config.center.lng = +value;
  }

  [showUserLocationProperty.setNative](value: boolean) {
    this.config.showUserLocation = value;
  }

  [hideLogoProperty.setNative](value: boolean) {
    this.config.hideLogo = value;
  }

  [hideAttributionProperty.setNative](value: boolean) {
    this.config.hideAttribution = value;
  }

  [hideCompassProperty.setNative](value: boolean) {
    this.config.hideCompass = value;
  }

  [disableZoomProperty.setNative](value: boolean) {
    this.config.disableZoom = value;
  }

  [disableRotationProperty.setNative](value: boolean) {
    this.config.disableRotation = value;
  }

  [disableScrollProperty.setNative](value: boolean) {
    this.config.disableScroll = value;
  }

  [disableTiltProperty.setNative](value: boolean) {
    this.config.disableTilt = value;
  }
}
