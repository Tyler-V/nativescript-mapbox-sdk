import { MapboxViewBase } from '../mapbox-sdk.common';

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
