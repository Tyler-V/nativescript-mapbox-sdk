import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { registerElement } from 'nativescript-angular/element-registry';

import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { OfflineComponent } from './offline/offline.component';
import { StylesComponent } from './styles/styles.component';

registerElement('Mapbox', () => require('nativescript-mapbox-sdk').MapboxView);
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);

@NgModule({
    imports: [NativeScriptCommonModule, NativeScriptFormsModule, MapRoutingModule],
    declarations: [MapComponent, OfflineComponent, StylesComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [ModalDialogService],
    entryComponents: [OfflineComponent, StylesComponent]
})
export class MapModule {}
