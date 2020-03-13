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
  public heatmap: MapboxHeatmap;

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
  abstract addVectorSource(sourceId: string, uri: string): any;
  abstract createLayer(layerType: LayerType, layerId: string, sourceId: string, minZoom: number, maxZoom: number): any;

  public getImage(filePath: string): ImageSource {
    const folder: Folder = <Folder>knownFolders.currentApp();
    const folderPath: string = path.join(folder.path, filePath);
    const imageSource: ImageSource = ImageSource.fromFileSync(folderPath);
    return imageSource;
  }
}

export class Color {
  red: number;
  green: number;
  blue: number;
  alpha: number;

  constructor(red: number, green: number, blue: number, alpha?: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
}

export abstract class MapboxHeatmap {
  abstract create(layerId: string, sourceId: string, minZoom: number, maxZoom: number);
  abstract setHeatmapColor(layer: any, stops: any[][]): void;
  abstract setHeatmapIntensity(layer: any, stops: any[][]): void;
  abstract setHeatmapRadius(layer: any, stops: any[][]): void;
  abstract setHeatmapOpacity(layer: any, stops: any[][]): void;
  abstract setHeatmapWeight(layer: any, stops: any[][]): void;
}
