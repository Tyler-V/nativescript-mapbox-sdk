import { Component, OnInit, ViewContainerRef } from "@angular/core";
import {
    ModalDialogService,
    ModalDialogOptions
} from "nativescript-angular/modal-dialog";
import { LatLng, RenderMode, CameraMode } from "nativescript-mapbox-sdk";
import * as geolocation from "nativescript-geolocation";
import { MapService } from "./map.service";
import { StylesComponent } from "./styles/styles.component";
import { OfflineComponent } from "./offline/offline.component";

import { Color } from "tns-core-modules/color";
declare const android, com, java, org: any;

@Component({
    selector: "map",
    moduleId: module.id,
    templateUrl: "./map.component.html",
    styleUrls: ["./map.component.scss"]
})
export class MapComponent implements OnInit {
    accessToken: string;
    mapStyle: string;
    latitude = 39.8283;
    longitude = -98.5795;
    zoom = 2.5;
    minZoom = 0;
    maxZoom = 22;
    bearing = 0;
    tilt = 0;

    showMap: boolean;

    isTracking: boolean = false;

    constructor(
        private mapService: MapService,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef
    ) {
        this.accessToken =
            "sk.eyJ1IjoidHZvcnBhaGwiLCJhIjoiY2s1dml5YXlxMHNncTNnbXgzNXVnYXQ0NyJ9.y0ofxDzXB4vi6KW372rLEQ";
        this.mapStyle = "mapbox://styles/mapbox/streets-v11";
    }

    ngOnInit(): void {}

    onMapReady(args) {
        console.log(args.eventName);
        this.mapService.mapbox = args.object.mapbox;
        this.mapService.mapbox.map.addOnMapClickListener((latLng: LatLng) => {
            this.mapService.mapbox.annotation.addCircle();
        });
        this.mapService.mapbox.map.addOnMapLongClickListener(
            (latLng: LatLng) => {
                const features = this.mapService.mapbox.map.queryRenderedFeatures(
                    latLng
                );
                console.log(features);
            }
        );
    }

    onStyleLoaded(args) {
        console.log(args.eventName);
        //this.addTerrainLayer();
        this.addExample2();
    }

    addExample2() {
        this.mapService.mapbox.style
            .getStyle()
            .addSource(
                new com.mapbox.mapboxsdk.style.sources.VectorSource(
                    "source-id",
                    "mapbox://tvorpahl.b39qo3tq"
                )
            );

        const wellsLayer = new com.mapbox.mapboxsdk.style.layers.CircleLayer(
            "layer-id",
            "source-id"
        );
        wellsLayer.setSourceLayer("wells");

        const rgb = com.mapbox.mapboxsdk.style.expressions.Expression.rgb;
        const stop = com.mapbox.mapboxsdk.style.expressions.Expression.stop;
        const get = com.mapbox.mapboxsdk.style.expressions.Expression.get;
        const match = com.mapbox.mapboxsdk.style.expressions.Expression.match;
        const circleColor =
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleColor;

        const stops = [
            stop(
                "OIL",
                rgb(
                    new java.lang.Integer(251),
                    new java.lang.Integer(176),
                    new java.lang.Integer(59)
                )
            ),
            stop(
                "GAS",
                rgb(
                    new java.lang.Integer(34),
                    new java.lang.Integer(59),
                    new java.lang.Integer(83)
                )
            ),
            stop(
                "OILGAS",
                rgb(
                    new java.lang.Integer(229),
                    new java.lang.Integer(94),
                    new java.lang.Integer(94)
                )
            ),
            stop(
                "EOR",
                rgb(
                    new java.lang.Integer(59),
                    new java.lang.Integer(178),
                    new java.lang.Integer(208)
                )
            ),
            stop(
                "SWD",
                rgb(
                    new java.lang.Integer(204),
                    new java.lang.Integer(204),
                    new java.lang.Integer(204)
                )
            ),
            stop(
                "OTHER",
                rgb(
                    new java.lang.Integer(0),
                    new java.lang.Integer(255),
                    new java.lang.Integer(255)
                )
            )
        ];

        const circleColorExpression = com.mapbox.mapboxsdk.style.layers.PropertyFactory.circleColor(
            match(
                get("TYPE"),
                rgb(
                    new java.lang.Integer(0),
                    new java.lang.Integer(0),
                    new java.lang.Integer(0)
                ),
                stops
            )
        );

        wellsLayer.setProperties([circleColorExpression]);
        this.mapService.mapbox.style.getStyle().addLayer(wellsLayer);
    }

    addTerrainLayer() {
        this.mapService.mapbox.style
            .getStyle()
            .addSource(
                new com.mapbox.mapboxsdk.style.sources.VectorSource(
                    "terrain-data",
                    "mapbox://mapbox.mapbox-terrain-v2"
                )
            );

        const terrainData = new com.mapbox.mapboxsdk.style.layers.LineLayer(
            "terrain-data",
            "terrain-data"
        );
        terrainData.setSourceLayer("contour");
        terrainData.setProperties([
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.lineJoin(
                com.mapbox.mapboxsdk.style.layers.Property.LINE_JOIN_ROUND
            ),
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.lineCap(
                com.mapbox.mapboxsdk.style.layers.Property.LINE_CAP_ROUND
            ),
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.lineColor(
                android.graphics.Color.parseColor("#ff69b4")
            ),
            com.mapbox.mapboxsdk.style.layers.PropertyFactory.lineWidth(
                new java.lang.Float(1.0)
            )
        ]);

        this.mapService.mapbox.style.getStyle().addLayer(terrainData);
    }

    showLocation() {
        geolocation.enableLocationRequest().then(() => {
            this.mapService.mapbox.location.startTracking({
                cameraMode: CameraMode.NONE,
                renderMode: RenderMode.NORMAL
            });
        });
    }

    trackUser() {
        geolocation.enableLocationRequest().then(() => {
            this.mapService.mapbox.location.startTracking({
                cameraMode: CameraMode.TRACKING_COMPASS,
                renderMode: RenderMode.COMPASS,
                zoom: 16,
                animationDuration: 1000,
                onCameraTrackingDismissed: () => {
                    this.mapService.mapbox.location.stopTracking();
                }
            });
        });
    }

    drivingMode() {
        if (this.isTracking) {
            this.isTracking = false;
            this.mapService.mapbox.location.stopTracking();
            this.mapService.mapbox.map.setAllGesturesEnabled(true);
        } else {
            geolocation.enableLocationRequest().then(() => {
                this.isTracking = true;
                this.mapService.mapbox.map.setAllGesturesEnabled(false);
                this.mapService.mapbox.location.startTracking({
                    cameraMode: CameraMode.TRACKING_GPS,
                    renderMode: RenderMode.GPS,
                    zoom: 19,
                    tilt: 45,
                    animationDuration: 2000
                });
            });
        }
    }

    showOfflineModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false
        };

        return this.modalService.showModal(OfflineComponent, options);
    }

    showStylesModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false
        };

        return this.modalService.showModal(StylesComponent, options);
    }
}
