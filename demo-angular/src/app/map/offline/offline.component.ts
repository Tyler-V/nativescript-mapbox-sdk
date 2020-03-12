import { Page } from 'tns-core-modules/ui/page';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Component, OnInit } from '@angular/core';
import { MapService } from './../map.service';
import { Progress } from 'tns-core-modules/ui/progress';

@Component({
    selector: 'offline',
    moduleId: module.id,
    templateUrl: './offline.component.html',
    styleUrls: ['./offline.component.scss'],
})
export class OfflineComponent implements OnInit {
    offlineRegions: any[];
    regionName: string;
    progressValue: number;
    isDownloading: boolean;
    progress: Progress;

    constructor(private mapService: MapService, private params: ModalDialogParams, private page: Page) {
        this.progressValue = 0;
        this.page.on('unloaded', () => {
            this.params.closeCallback();
        });
        this.offlineRegions = [];
    }

    ngOnInit(): void {}

    onProgressBarLoaded(args) {
        this.progress = <Progress>args.object;
    }

    getOfflineRegions() {
        this.mapService.mapbox.offline.listOfflineRegions().then((offlineRegions) => {
            this.offlineRegions = offlineRegions;
            console.log(this.mapService.offlineRegions);
        });
    }

    onDownloadTap() {
        this.isDownloading = true;
        this.mapService.mapbox.offline
            .downloadOfflineRegion(
                {
                    name: this.regionName,
                },
                (progress) => {
                    console.log(progress);
                    this.progress.value = Math.round(progress.percentage);
                }
            )
            .then(() => {
                this.isDownloading = false;
            })
            .catch((error) => {
                this.isDownloading = false;
                console.log(error);
            });
    }

    setOfflineLimit() {
        this.mapService.mapbox.offline.setOfflineTileCountLimit(10000);
    }

    onResetTap() {
        this.mapService.mapbox.offline.resetDatabase().then(() => {
            console.log('Database Reset!');
            this.offlineRegions = [];
        });
    }

    goBack() {
        this.params.closeCallback();
    }
}
