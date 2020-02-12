import { MapboxView } from "../mapbox-sdk.ios";
import { MapboxOffline } from "../common/offline.common";

export class Offline extends MapboxOffline {
  private offlineManager;

  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  _getOfflineManager() {}

  downloadOfflineRegion(options: any, onProgress?: (data: any) => void): Promise<any> {
    return null;
  }

  _getRegionName(offlineRegion) {}

  listOfflineRegions(): Promise<any> {
    return null;
  }

  resetDatabase(): Promise<any> {
    return null;
  }

  deleteOfflineRegion(options: any): Promise<any> {
    return null;
  }

  setOfflineTileCountLimit(limit: number): void {}
}
