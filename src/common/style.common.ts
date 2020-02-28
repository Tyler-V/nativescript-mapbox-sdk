import { MapboxViewBase } from '../mapbox-sdk.common';
import { ImageSource } from 'tns-core-modules/image-source';
import { Folder, path, knownFolders } from 'tns-core-modules/file-system';

export enum MapStyle {
  MAPBOX_STREETS = 'mapbox://styles/mapbox/streets-v11',
  DARK = 'mapbox://styles/mapbox/dark-v10',
  LIGHT = 'mapbox://styles/mapbox/light-v10',
  OUTDOORS = 'mapbox://styles/mapbox/outdoors-v11',
  SATELLITE = 'mapbox://styles/mapbox/satellite-v9',
  SATELLITE_STREETS = 'mapbox://styles/mapbox/satellite-streets-v11',
}

export enum LayerType {
  HEATMAP = 'HEATMAP',
  SYMBOL = 'SYMBOL',
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
  abstract addImage(name: string, filePath: string): void;
  abstract addSource(source: any): void;
  abstract addLayer(layer: any): void;
  abstract removeLayer(layer: any): void;
  abstract addVectorSource(sourceId: string, uri: string): void;
  abstract createLayer(layerType: LayerType, layerId: string, sourceId: string, minZoom: number, maxZoom: number): any;
  //abstract createHeatmapLayer(layerId: string, sourceId: string, minZoom: number, maxZoom: number): any;

  public getImage(filePath: string): ImageSource {
    const folder: Folder = <Folder>knownFolders.currentApp();
    const folderPath: string = path.join(folder.path, filePath);
    const imageSource: ImageSource = ImageSource.fromFileSync(folderPath);
    return imageSource;
  }
}
