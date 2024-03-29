import { ModalDialogService, NativeScriptFormsModule, NativeScriptCommonModule, registerElement } from '@nativescript/angular';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { OfflineComponent } from './offline/offline.component';
import { StylesComponent } from './styles/styles.component';
import { LayersComponent } from './layers/layers.component';
import { LocationComponent } from './location/location.component';

registerElement('Mapbox', () => require('nativescript-mapbox-sdk').MapboxView);
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);

@NgModule({
    imports: [NativeScriptCommonModule, NativeScriptFormsModule, MapRoutingModule],
    declarations: [MapComponent, OfflineComponent, StylesComponent, LayersComponent, LocationComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [ModalDialogService],
    entryComponents: [OfflineComponent, StylesComponent, LayersComponent, LocationComponent],
})
export class MapModule {}
