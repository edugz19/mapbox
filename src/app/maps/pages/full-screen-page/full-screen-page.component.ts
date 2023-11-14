import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { LngLat, Map, Marker, Popup } from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { PlacesService, MapService } from '../../services';

interface MarkerAndColor {
  color: string;
  marker: Marker;
}

interface PlainMarker {
  color: string;
  lngLat: number[]
}


@Component({
  templateUrl: './full-screen-page.component.html',
  styleUrls: ['./full-screen-page.component.css']
})
export class FullScreenPageComponent implements AfterViewInit {

  private placesService = inject(PlacesService);
  private mapService = inject(MapService);

  @ViewChild('map') divMap?: ElementRef;

  public markers: MarkerAndColor[] = [];

  public map?: Map;

  ngAfterViewInit(): void {
    if ( !this.divMap ) throw Error('El elemento HTML no fue encontrado');
    if (!this.placesService.userLocation) throw Error('Error al obtener la geolocalización');

    const map = new Map({
      container: this.divMap.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
      center: this.placesService.userLocation, // starting position [lng, lat]
      zoom: 12, // starting zoom
    });

    const marker = new Marker({
      color: `red`,
      draggable: true
    })
      .setLngLat( this.placesService.userLocation )
      .addTo( map );

    this.mapService.setMap( map );
    this.readFromLocalStorage();
  }

  goToUserLocation() {
    this.mapService.flyTo( this.placesService.userLocation! );
  }

  createMarker() {
    if ( !this.map ) return;

    const color = '#xxxxxx'.replace(/x/g, y=>(Math.random()*16|0).toString(16));
    const lngLat = this.map.getCenter();

    this.addMarker( lngLat, color );
  }


  addMarker( lngLat: LngLat, color: string ) {
    if ( !this.map ) return;

    const popup = new Popup()
      .setHTML(`
        <h5 class="text-center"><strong>Longitud:</strong> ${lngLat.lng}</h5>
        <h5 class="text-center"><strong>Latitud:</strong> ${lngLat.lat}</h5>
      `);

    const marker = new Marker({
      color: color,
      draggable: true
    })
      .setLngLat( lngLat )
      .setPopup(popup)
      .addTo( this.map );

      this.mapService.setMap( this.map );

    this.markers.push({ color, marker });
    this.saveToLocalStorage();

    marker.on('dragend', () => this.saveToLocalStorage() );
  }

  deleteMarker( index: number ) {
    this.markers[index].marker.remove();
    this.markers.splice( index, 1 );
  }

  flyTo( marker: Marker ) {
    this.map?.flyTo({
      zoom: 14,
      center: marker.getLngLat()
    });

  }

  saveToLocalStorage() {
    const plainMarkers: PlainMarker[] = this.markers.map( ({ color, marker }) => {
      return {
        color,
        lngLat: marker.getLngLat().toArray()
      }
    });

    localStorage.setItem('plainMarkers', JSON.stringify( plainMarkers ));

  }

  readFromLocalStorage() {
    const plainMarkersString = localStorage.getItem('plainMarkers') ?? '[]';
    const plainMarkers: PlainMarker[] = JSON.parse( plainMarkersString ); //! OJO!

    plainMarkers.forEach( ({ color, lngLat }) => {
      const [ lng, lat ] = lngLat;
      const coords = new LngLat( lng, lat );

      this.addMarker( coords, color );
    })

  }

}
