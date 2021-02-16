import { Component, OnInit } from '@angular/core';
import * as application from '@nativescript/core/application';
import Theme from '@nativescript/theme';

@Component({
    moduleId: module.id,
    selector: 'ns-app',
    templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
    ngOnInit() {
        if (application.android) {
            try {
                Theme.setMode(Theme.Light);
            } catch (e) {
                console.log('Error setting Theme to light mode', e);
            }
        }
    }
}
