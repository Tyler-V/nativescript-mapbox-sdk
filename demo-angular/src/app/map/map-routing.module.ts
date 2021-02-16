import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';

import { MapComponent } from './map.component';
import { OfflineComponent } from './offline/offline.component';

const routes: Routes = [
    { path: '', component: MapComponent }, //
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule],
})
export class MapRoutingModule {}
