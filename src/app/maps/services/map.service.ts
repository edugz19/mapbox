import { Injectable, inject } from '@angular/core';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { Feature } from '../interfaces/places';
import { DirectionsApiClient } from '../api/directionsApiClient';
import { DirectionsResponse, Route } from '../interfaces/directions';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private directionsApi = inject(DirectionsApiClient);

  private map?: Map;
  private markers: Marker[] = []

  get isMapReady(){
    return !!this.map;
  }

  constructor() {}

  setMap( map: Map ) {
    this.map = map;
  }

  getMap(): Map {
    return this.map!;
  }

  flyTo( coords: LngLatLike ) {
    if ( !this.isMapReady ) throw Error('El mapa no esta inicializado');

    this.map?.flyTo({
      zoom: 14,
      center: coords
    });

  }

  getRouteBetweenPoints( start: [number, number], end: [number, number] ) {

    this.directionsApi.get<DirectionsResponse>(`/${ start.join(',') };${ end.join(',') }`)
      .subscribe( resp => this.drawPolyline( resp.routes[0] ) );

  }

  private drawPolyline( route: Route ) {

    if ( !this.map ) throw Error('Mapa no inicializado');

    const coords = route.geometry.coordinates;

    const bounds = new LngLatBounds();
    coords.forEach( ([ lng, lat ]) => {
      bounds.extend([ lng, lat ]);
    });

    this.map?.fitBounds( bounds, {
      padding: 200
    });

    // Polyline
    const sourceData: AnySourceData = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          }
        ]
      }
    }

    if ( this.map.getLayer('RouteString') ) {
      this.map.removeLayer('RouteString');
      this.map.removeSource('RouteString');
    }


    this.map.addSource('RouteString', sourceData );

    this.map.addLayer({
      id: 'RouteString',
      type: 'line',
      source: 'RouteString',
      layout: {
        'line-cap': 'round',
        'line-join':'round'
      },
      paint: {
        'line-color': 'red',
        'line-width': 5
      }
    });

    const { distance, duration } = route;
    const kms = distance / 1000;
    const time = duration / 60;
    // alert(`
    //   Distancia: ${kms.toFixed(2)} kms.
    //   Duración: ${time.toFixed(2)} mins.
    // `);

    console.log('Distancia: ' + kms.toFixed(2));
    console.log('Tiempo: ' + time.toFixed(0))
  }



}
