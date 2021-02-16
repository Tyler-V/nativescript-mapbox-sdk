import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { isIOS } from '@nativescript/core';
import { LatLng } from 'nativescript-mapbox-sdk';
import { MapService } from '../map.service';

@Injectable()
export class IOSCalloutService {
    private annotation: any;

    constructor(private mapService: MapService, private router: RouterExtensions, private route: ActivatedRoute) {
        if (!isIOS) {
            return;
        }

        this.mapService.mapReady.subscribe(() => {
            this.mapService.mapboxView.on('tapOnCalloutForAnnotation', (data) => {
                this.removeAnnotation();
                const API = (<MGLPointAnnotation>data.object).subtitle;
                // Navigate to detail view
            });
            this.mapService.mapbox.map.addOnMapClickListener((latLng: LatLng) => {
                const symbolLayers = this.mapService.mapbox.map.queryRenderedFeatures(latLng, 'symbol-layer-id');
                if (symbolLayers.length > 0) {
                    this.addAnnotation(symbolLayers[0] as GeoJSON.Feature<GeoJSON.Point>);
                }
            });
        });
    }

    removeAnnotation() {
        if (!this.annotation) {
            return;
        }
        this.mapService.mapView.removeAnnotation(this.annotation);
    }

    addAnnotation(feature: GeoJSON.Feature<GeoJSON.Point>) {
        this.removeAnnotation();

        this.annotation = MGLPointAnnotation.alloc();
        this.annotation.coordinate = CLLocationCoordinate2DMake(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        this.annotation.title = feature.properties.NAME;
        this.annotation.subtitle = feature.properties.API;

        this.mapService.mapView.addAnnotation(this.annotation);
        this.mapService.mapView.selectAnnotationAnimated(this.annotation, true);
    }
}
