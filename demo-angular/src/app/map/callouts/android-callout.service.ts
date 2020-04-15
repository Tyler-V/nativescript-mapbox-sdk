import { Injectable } from '@angular/core';
import { Feature } from 'nativescript-mapbox-sdk';
import { MapService } from '../map.service';
import { android as androidApp } from 'tns-core-modules/application';

declare const com, java, android;

@Injectable({
    providedIn: 'root',
})
export class AndroidCalloutService {
    private calloutLayer: any;

    constructor(private mapService: MapService) {}

    removeCalloutLayer() {
        if (!this.calloutLayer) return;
        this.mapService.mapbox.style.removeLayer(this.calloutLayer);
        this.calloutLayer = null;
    }

    addCalloutLayer(feature: Feature) {
        this.removeCalloutLayer();

        const iconImageKey = 'API';
        const iconImageName = feature.properties[iconImageKey];

        const hasImage = this.mapService.mapbox.style.getImage(iconImageName) != null;
        if (!hasImage) {
            const bubbleLayout = this.createBubbleLayout(feature.properties.NAME, feature.properties.API);
            const image = this.generateBitmapFromView(bubbleLayout);
            this.mapService.mapbox.style.addImage(iconImageName, image);
        }

        this.calloutLayer = new com.mapbox.mapboxsdk.style.layers.SymbolLayer('callout-layer-id', 'wells');
        this.calloutLayer.setSourceLayer('wells');

        const get = com.mapbox.mapboxsdk.style.expressions.Expression.get;
        const eq = com.mapbox.mapboxsdk.style.expressions.Expression.eq;
        const iconImage = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconImage;
        const iconAllowOverlap = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconAllowOverlap;
        const iconIgnorePlacement = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconIgnorePlacement;
        const iconAnchor = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconAnchor;
        const iconOffset = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconOffset;

        const properties = [];
        const floatArray = (<any>Array).create('java.lang.Float', 2);
        floatArray[0] = new java.lang.Float(0);
        floatArray[1] = new java.lang.Float(-15);
        properties.push(iconOffset(floatArray));
        properties.push(iconImage(get(iconImageKey)));
        properties.push(iconAnchor('bottom'));
        properties.push(iconAllowOverlap(new java.lang.Boolean(true)));
        properties.push(iconIgnorePlacement(new java.lang.Boolean(true)));

        this.calloutLayer.setProperties(properties);

        this.calloutLayer.setFilter(eq(get(iconImageKey), iconImageName));

        this.mapService.mapbox.style.addLayer(this.calloutLayer);
    }

    private createBubbleLayout(titleText: string, propertiesListText: string) {
        let resourceId = androidApp.context
            .getResources()
            .getIdentifier('activity_query_feature_window_symbol_layer', 'layout', androidApp.context.getPackageName());

        const inflater = android.view.LayoutInflater.from(androidApp.foregroundActivity);
        const bubbleLayout = inflater.inflate(resourceId, null);

        const titleTextViewId = androidApp.context.getResources().getIdentifier('info_window_title', 'id', androidApp.context.getPackageName());
        const titleTextView = bubbleLayout.findViewById(titleTextViewId);
        titleTextView.setText(titleText);

        const propertiesListTextId = androidApp.context
            .getResources()
            .getIdentifier('info_window_feature_properties_list', 'id', androidApp.context.getPackageName());
        const propertiesListTextView = bubbleLayout.findViewById(propertiesListTextId);
        propertiesListTextView.setText(propertiesListText);

        return bubbleLayout;
    }

    private generateBitmapFromView(view: any) {
        const measureSpec = android.view.View.MeasureSpec.makeMeasureSpec(0, android.view.View.MeasureSpec.UNSPECIFIED);
        view.measure(measureSpec, measureSpec);
        const measuredWidth = view.getMeasuredWidth();
        const measuredHeight = view.getMeasuredHeight();
        view.layout(0, 0, measuredWidth, measuredHeight);
        const bitmap = android.graphics.Bitmap.createBitmap(measuredWidth, measuredHeight, android.graphics.Bitmap.Config.ARGB_8888);
        bitmap.eraseColor(android.graphics.Color.TRANSPARENT);
        const canvas = new android.graphics.Canvas(bitmap);
        view.draw(canvas);
        return bitmap;
    }
}
