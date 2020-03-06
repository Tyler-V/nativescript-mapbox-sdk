import { MapboxView } from '../mapbox-sdk.ios';
import { MapboxOffline, DownloadOfflineRegionOptions, DeleteOfflineRegionOptions } from '../common/offline.common';

const _addObserver = (eventName, callback) => {
  return NSNotificationCenter.defaultCenter.addObserverForNameObjectQueueUsingBlock(eventName, null, NSOperationQueue.mainQueue, callback);
};
export class Offline extends MapboxOffline {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  _getOfflineManager() {}

  downloadOfflineRegion(options: DownloadOfflineRegionOptions): Promise<any> {
    let that = this;
    return new Promise((resolve, reject) => {
      try {
        if (!options.bounds) {
          options.bounds = that.view.mapbox.map.getBounds();
        }

        if (!options.minZoom) {
          options.minZoom = 0;
        }

        if (!options.maxZoom) {
          options.maxZoom = Math.min(Math.ceil(that.view.mapbox.map.getZoom()), 20);
        }

        if (!options.name) {
          Promise.reject('An offline region name is required.');
        }

        let styleURL = NSURL.URLWithString(that.view.mapbox.style.getStyle());

        let swCoordinate = CLLocationCoordinate2DMake(options.bounds.south, options.bounds.west);
        let neCoordinate = CLLocationCoordinate2DMake(options.bounds.north, options.bounds.east);

        let bbox: MGLCoordinateBounds = { sw: swCoordinate, ne: neCoordinate };

        let region = MGLTilePyramidOfflineRegion.alloc().initWithStyleURLBoundsFromZoomLevelToZoomLevel(styleURL, bbox, options.minZoom, options.maxZoom);

        // TODO there's more observers, see https://www.mapbox.com/ios-sdk/examples/offline-pack/
        if (options.onProgress) {
          _addObserver(MGLOfflinePackProgressChangedNotification, (notification: NSNotification) => {
            let offlinePack = notification.object;
            let offlinePackProgress = offlinePack.progress;
            let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
            let complete = offlinePackProgress.countOfResourcesCompleted === offlinePackProgress.countOfResourcesExpected;

            options.onProgress({
              name: userInfo.objectForKey('name'),
              completed: offlinePackProgress.countOfResourcesCompleted,
              expected: offlinePackProgress.countOfResourcesExpected,
              percentage: Math.round((offlinePackProgress.countOfResourcesCompleted / offlinePackProgress.countOfResourcesExpected) * 10000) / 100,
              complete: complete,
            });

            if (complete) {
              resolve();
            }
          });
        }

        _addObserver(MGLOfflinePackErrorNotification, (notification: NSNotification) => {
          let offlinePack = notification.object;
          let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
          let error = notification.userInfo[MGLOfflinePackUserInfoKeyError];
          reject({
            name: userInfo.objectForKey('name'),
            error: 'Download error. ' + error,
          });
        });

        _addObserver(MGLOfflinePackMaximumMapboxTilesReachedNotification, (notification: NSNotification) => {
          let offlinePack = notification.object;
          let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(offlinePack.context);
          let maximumCount = notification.userInfo[MGLOfflinePackUserInfoKeyMaximumCount];
          console.log(`Offline region '${userInfo.name}' reached the tile limit of ${maximumCount}`);
        });
        // Store some data for identification purposes alongside the downloaded resources.
        let userInfo = { name: options.name };
        let context = NSKeyedArchiver.archivedDataWithRootObject(userInfo);

        // Create and register an offline pack with the shared offline storage object.
        MGLOfflineStorage.sharedOfflineStorage.addPackForRegionWithContextCompletionHandler(region, context, (pack, error: NSError) => {
          if (error) {
            // The pack couldn’t be created for some reason.
            reject(error.localizedFailureReason);
          } else {
            // Start downloading.
            pack.resume();
          }
        });
      } catch (ex) {
        console.log('Error in mapbox.downloadOfflineRegion: ' + ex);
        reject(ex);
      }
    });
  }

  listOfflineRegions(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let packs = MGLOfflineStorage.sharedOfflineStorage.packs;
        if (!packs) {
          reject('No packs found or Mapbox not ready yet');
          return;
        }

        let regions = [];
        for (let i = 0; i < packs.count; i++) {
          let pack: MGLOfflinePack = packs.objectAtIndex(i);
          let region: MGLTilePyramidOfflineRegion = <MGLTilePyramidOfflineRegion>pack.region;
          let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(pack.context);
          regions.push({
            name: userInfo.objectForKey('name'),
            style: '' + region.styleURL,
            minZoom: region.minimumZoomLevel,
            maxZoom: region.maximumZoomLevel,
            bounds: {
              north: region.bounds.ne.latitude,
              east: region.bounds.ne.longitude,
              south: region.bounds.sw.latitude,
              west: region.bounds.sw.longitude,
            },
          });
        }
        resolve(regions);
      } catch (ex) {
        console.log('Error in mapbox.listOfflineRegions: ' + ex);
        reject(ex);
      }
    });
  }

  resetDatabase(): Promise<any> {
    return new Promise((resolve, reject) => {
      let packs = MGLOfflineStorage.sharedOfflineStorage.packs;

      MGLOfflineStorage.sharedOfflineStorage.resetDatabaseWithCompletionHandler((error) => {
        if (error) {
          console.log("Failed to reset Mapbox database!  Error:" + error);
        } else {
            console.log("Mapbox database was reset.");
        }
      });

      for (let i = 0; i < packs.count; i++) {
        let pack: MGLOfflinePack = packs.objectAtIndex(i);
          MGLOfflineStorage.sharedOfflineStorage.removePackWithCompletionHandler(pack, (error: NSError) => {
            if (error) {
              // The pack couldn’t be deleted for some reason.
              reject(error.localizedFailureReason);
            } else {
              resolve();
              // don't return, see note below
            }
          });
        }
    });
  }

  deleteOfflineRegion(options: DeleteOfflineRegionOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (!options || !options.name) {
          reject("Pass in the 'name' param");
          return;
        }

        let packs = MGLOfflineStorage.sharedOfflineStorage.packs;
        let found = false;
        for (let i = 0; i < packs.count; i++) {
          let pack = packs.objectAtIndex(i);
          let userInfo = NSKeyedUnarchiver.unarchiveObjectWithData(pack.context);
          let name = userInfo.objectForKey('name');
          if (name === options.name) {
            found = true;
            MGLOfflineStorage.sharedOfflineStorage.removePackWithCompletionHandler(pack, (error: NSError) => {
              if (error) {
                // The pack couldn’t be deleted for some reason.
                reject(error.localizedFailureReason);
              } else {
                resolve();
                // don't return, see note below
              }
            });
            // don't break the loop as there may be multiple packs with the same name
          }
        }
        if (!found) {
          reject('Region not found');
        }
      } catch (ex) {
        console.log('Error in mapbox.deleteOfflineRegion: ' + ex);
        reject(ex);
      }
    });
  }

  setOfflineTileCountLimit(limit: number): void {
    MGLOfflineStorage.sharedOfflineStorage.setMaximumAllowedMapboxTiles(limit);
  }
}
