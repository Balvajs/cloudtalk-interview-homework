import { Component } from '@angular/core';

import { ItemsListComponent } from './pages/items-list/items-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [ItemsListComponent],
})
export class AppComponent {
  title = 'warehouse';
}
