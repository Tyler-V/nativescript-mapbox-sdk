
import { Folder, path, knownFolders } from 'tns-core-modules/file-system';
import { ImageSource } from 'tns-core-modules/image-source';
import { MapboxViewBase } from '../mapbox-sdk.common';

export enum MapStyle {
  MAPBOX_STREETS = 'mapbox://styles/mapbox/streets-v11',
  DARK = 'mapbox://styles/mapbox/dark-v10',
  LIGHT = 'mapbox://styles/mapbox/light-v10',
  OUTDOORS = 'mapbox://styles/mapbox/outdoors-v11',
  SATELLITE = 'mapbox://styles/mapbox/satellite-v9',
  SATELLITE_STREETS = 'mapbox://styles/mapbox/satellite-streets-v11',
}

export interface StyleOptions {
  style?: string;
  uri?: string;
}

export abstract class MapboxStyle {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract getStyle();
  abstract getUri(): string;

  abstract setStyleUri(uri: string): Promise<any>;

  abstract addImage(name: string, filePath: string);
  abstract addSource(source: any);
  abstract addLayer(layer: any);

  public getImage(filePath: string): ImageSource {
    const folder: Folder = <Folder>knownFolders.currentApp();
    const folderPath: string = path.join(folder.path, filePath);
    const imageSource: ImageSource = ImageSource.fromFileSync(folderPath);
    return imageSource;
  }
}