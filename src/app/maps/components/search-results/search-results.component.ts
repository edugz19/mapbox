import { Component, inject } from '@angular/core';
import { MapService, PlacesService } from '../../services';
import { Feature } from '../../interfaces/places';
import { Marker } from 'mapbox-gl';

@Component({
  selector: 'maps-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent {

  private placesService = inject(PlacesService);
  private mapService = inject(MapService);

  public selectedId: string = '';

  get isLoadingPlaces(): boolean {
    return this.placesService.isLoadingPlaces;
  }

  get places(): Feature[] {
    return this.placesService.places;
  }

  flyTo( place: Feature ) {
    this.selectedId = place.id;

    const [ lng, lat ] = place.center;
    this.mapService.flyTo([ lng, lat ]);
  }

  getDirections( place: Feature ) {
    if ( !this.placesService.userLocation ) throw Error('No hay userLocation');

    this.placesService.deletePlaces();

    const start = this.placesService.userLocation;
    const end = place.center as [number, number];

    const marker = new Marker({
      color: `red`,
      draggable: true
    })
      .setLngLat( end )
      .addTo( this.mapService.getMap() );

    this.mapService.getRouteBetweenPoints(start, end);
  }

}
