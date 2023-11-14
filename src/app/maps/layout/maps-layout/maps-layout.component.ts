import { Component, OnInit, inject } from '@angular/core';

import { PlacesService } from '../../services/index';

@Component({
  templateUrl: './maps-layout.component.html',
  styleUrls: ['./maps-layout.component.css']
})
export class MapsLayoutComponent implements OnInit{

  private placesService = inject(PlacesService);

  get isUserLocationReady() {
    return this.placesService.isUserLocationReady;
  }

  ngOnInit(): void {
    this.placesService.getUserLocation();
  }

}
