import { Page } from "tns-core-modules/ui/page";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Component, OnInit } from "@angular/core";
import { MapService } from "./../map.service";
import { MapStyle } from "nativescript-mapbox-sdk";

@Component({
    selector: "styles",
    moduleId: module.id,
    templateUrl: "./styles.component.html",
    styleUrls: ["./styles.component.scss"]
})
export class StylesComponent implements OnInit {
    public MapStyle: any = MapStyle;

    constructor(
        private mapService: MapService,
        private params: ModalDialogParams,
        private page: Page
    ) {
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    ngOnInit(): void {}

    setStyle(style: string) {
        this.mapService.mapbox.style.setStyleUri(style);
        this.params.closeCallback();
    }

    close() {
        this.params.closeCallback();
    }
}
