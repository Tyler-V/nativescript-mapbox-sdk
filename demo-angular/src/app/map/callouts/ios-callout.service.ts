import { Injectable } from '@angular/core';
import { MapService } from '../map.service';

@Injectable({
    providedIn: 'root',
})
export class IOSCalloutService {
    private annotation: any;

    constructor(private mapService: MapService) {}

    removeAnnotation() {
        if (this.annotation) {
            this.mapService.mapView.removeAnnotation(this.annotation);
        }
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
