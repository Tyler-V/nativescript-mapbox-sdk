import { Folder, path, knownFolders, ImageSource } from '@nativescript/core';
import { MapboxViewBase } from '../mapbox-sdk.common';
import { MapboxLayers } from './layers/layers.common';

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
  public layers: MapboxLayers;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract getStyle();
  abstract getUri(): string;

  abstract setStyleUri(uri: string): Promise<any>;
  abstract getSource(id: string): any;
  abstract getImage(name: string): any;

  abstract addImage(name: string, image: any): void;
  abstract addImageFromPath(name: string, filePath: string): void;
  abstract addLayer(layer: any): void;
  abstract addLayerAt(layer: any, index: number);
  abstract addLayerBelow(layer: any, below: string);
  abstract addLayerAbove(layer: any, above: string);

  abstract addSource(source: any): void;
  abstract removeSource(source: any): void;
  abstract addGeoJsonSource(id: string, geoJson: string): void;
  abstract addVectorSource(id: string, uri: string): any;

  abstract removeLayer(layer: any): void;
  abstract removeLayerById(layerId: string): void;
  abstract removeImage(name: string): void;

  public getImageFromPath(filePath: string): ImageSource {
    const folder: Folder = <Folder>knownFolders.currentApp();
    const folderPath: string = path.join(folder.path, filePath);
    const imageSource: ImageSource = ImageSource.fromFileSync(folderPath);
    return imageSource;
  }
}
