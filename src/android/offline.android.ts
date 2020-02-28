import * as utils from 'tns-core-modules/utils/utils';
import { MapboxView } from '../mapbox-sdk.android';
import { MapboxOffline, DownloadOfflineRegionOptions, DeleteOfflineRegionOptions } from '../common/offline.common';

declare const android, com, java, org: any;

export class Offline extends MapboxOffline {
  private offlineManager;

  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  _getOfflineManager() {
    if (!this.offlineManager) {
      this.offlineManager = com.mapbox.mapboxsdk.offline.OfflineManager.getInstance(utils.ad.getApplicationContext());
    }
    return this.offlineManager;
  }

  downloadOfflineRegion(options: DownloadOfflineRegionOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!options.mapStyle) {
        options.mapStyle = this.view.mapbox.style.getUri();
      }

      if (!options.bounds) {
        options.bounds = this.view.mapbox.map.getBounds();
      }

      if (!options.minZoom) {
        options.minZoom = 0;
      }

      if (!options.maxZoom) {
        options.maxZoom = Math.min(Math.ceil(this.view.mapbox.map.getZoom()), 20);
      }

      const latLngBounds = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
        .include(new com.mapbox.mapboxsdk.geometry.LatLng(options.bounds.north, options.bounds.east))
        .include(new com.mapbox.mapboxsdk.geometry.LatLng(options.bounds.south, options.bounds.west))
        .build();

      const offlineRegionDefinition = new com.mapbox.mapboxsdk.offline.OfflineTilePyramidRegionDefinition(
        options.mapStyle,
        latLngBounds,
        options.minZoom,
        options.maxZoom,
        utils.layout.getDisplayDensity()
      );

      const info = '{name:"' + options.name + '"}';
      const infoStr = new java.lang.String(info);
      const metadata = infoStr.getBytes();

      this._getOfflineManager().createOfflineRegion(
        offlineRegionDefinition,
        metadata,
        new com.mapbox.mapboxsdk.offline.OfflineManager.CreateOfflineRegionCallback({
          onError: (error: string) => {
            reject(error);
          },
          onCreate: (offlineRegion) => {
            offlineRegion.setDownloadState(com.mapbox.mapboxsdk.offline.OfflineRegion.STATE_ACTIVE);
            offlineRegion.setObserver(
              new com.mapbox.mapboxsdk.offline.OfflineRegion.OfflineRegionObserver({
                onStatusChanged: (status) => {
                  let percentage =
                    status.getRequiredResourceCount() >= 0 ? (100.0 * status.getCompletedResourceCount()) / status.getRequiredResourceCount() : 0.0;
                  if (options.onProgress) {
                    options.onProgress({
                      name: options.name,
                      completedSize: status.getCompletedResourceSize(),
                      completed: status.getCompletedResourceCount(),
                      expected: status.getRequiredResourceCount(),
                      percentage: Math.round(percentage * 100) / 100,
                      complete: status.isComplete(),
                    });
                  }
                  if (status.isComplete()) {
                    resolve('Complete');
                  }
                },
                onError: (error) => {
                  reject(`${error.getMessage()}, reason: ${error.getReason()}`);
                },
                mapboxTileCountLimitExceeded: (limit) => {
                  reject(`Mapbox tile count limited exceed: ${limit}`);
                },
              })
            );
          },
        })
      );
    });
  }

  _getRegionName(offlineRegion) {
    const metadata = offlineRegion.getMetadata();
    const jsonStr = new java.lang.String(metadata, 'UTF-8');
    const jsonObj = new org.json.JSONObject(jsonStr);
    return jsonObj.getString('name');
  }

  listOfflineRegions(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getOfflineManager().listOfflineRegions(
        new com.mapbox.mapboxsdk.offline.OfflineManager.ListOfflineRegionsCallback({
          onError: (error: string) => {
            reject(error);
          },
          onList: (offlineRegions) => {
            const regions = [];
            if (offlineRegions !== null) {
              for (let i = 0; i < offlineRegions.length; i++) {
                let offlineRegion = offlineRegions[i];
                let name = this._getRegionName(offlineRegion);
                let offlineRegionDefinition = offlineRegion.getDefinition();
                let bounds = offlineRegionDefinition.getBounds();

                regions.push({
                  name: name,
                  style: offlineRegionDefinition.getStyleURL(),
                  minZoom: offlineRegionDefinition.getMinZoom(),
                  maxZoom: offlineRegionDefinition.getMaxZoom(),
                  bounds: {
                    north: bounds.getLatNorth(),
                    east: bounds.getLonEast(),
                    south: bounds.getLatSouth(),
                    west: bounds.getLonWest(),
                  },
                });
              }
            }
            resolve(regions);
          },
        })
      );
    });
  }

  resetDatabase(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getOfflineManager().resetDatabase(
        new com.mapbox.mapboxsdk.offline.OfflineManager.FileSourceCallback({
          onError: (error: string) => {
            reject(error);
          },
          onSuccess: () => {
            resolve();
          },
        })
      );
    });
  }

  deleteOfflineRegion(options: DeleteOfflineRegionOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getOfflineManager().listOfflineRegions(
        new com.mapbox.mapboxsdk.offline.OfflineManager.ListOfflineRegionsCallback({
          onError: (error: string) => {
            reject(error);
          },
          onList: (offlineRegions) => {
            for (let offlineRegion of offlineRegions) {
              let name = this._getRegionName(offlineRegion);
              if (name === options.name) {
                offlineRegion.delete(
                  new com.mapbox.mapboxsdk.offline.OfflineRegion.OfflineRegionDeleteCallback({
                    onError: (error: string) => {
                      reject(error);
                    },
                    onDelete: () => {
                      resolve();
                    },
                  })
                );
                break;
              }
            }
          },
        })
      );
    });
  }

  setOfflineTileCountLimit(limit: number): void {
    this._getOfflineManager().setOfflineMapboxTileCountLimit(limit);
  }
}
