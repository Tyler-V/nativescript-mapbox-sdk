import { MapboxViewBase } from '../mapbox-sdk.common';
import { LatLngBounds } from '../common/map.common';

export interface RegionOptions {
  name: string;
  mapStyle?: string;
  minZoom?: number;
  maxZoom?: number;
  bounds?: LatLngBounds;
}
export interface DownloadProgress {
  name: string;
  completed: number;
  expected: number;
  percentage: number;
  complete: boolean;
  // Android only, the size in bytes of the download so far.
  completedSize?: number;
}
export interface DownloadOfflineRegionOptions extends RegionOptions {
  onProgress?: (data: DownloadProgress) => void;
  // Optional for Android only. Setting this, in case no map has been show yet (and thus, no accessToken has been passed in yet).
  accessToken?: string;
}

export interface DeleteOfflineRegionOptions {
  name: string;
}
export abstract class MapboxOffline {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract setOfflineTileCountLimit(limit: number);
  abstract resetDatabase(): Promise<any>;
  abstract downloadOfflineRegion(options: any, onProgress?: (data: any) => void): Promise<any>;
  abstract listOfflineRegions(): Promise<any>;
}
