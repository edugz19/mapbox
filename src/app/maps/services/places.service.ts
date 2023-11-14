import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Feature, PlacesResponse } from '../interfaces/places';
import { PlacesAppClient } from '../api/placesApiClient';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private placesAPI = inject(PlacesAppClient);

  public userLocation?: [number, number];

  public isLoadingPlaces: boolean = false;
  public places: Feature[] = [];

  get isUserLocationReady(): boolean {
    return !!this.userLocation;
  }

  constructor() {
    this.getUserLocation();
  }

  public async getUserLocation(): Promise<[number, number]> {
    return new Promise( (resolve) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          this.userLocation = [coords.longitude, coords.latitude];
          console.log(this.userLocation)
          resolve(this.userLocation);
        },
        (err) => {
          console.log('No se pudo obtener la geolocalización', err);
        }
      );
    });
  }

  getPlacesByQuery(query: string) {
    if ( query.length === 0 ) {
      this.isLoadingPlaces = false;
      this.places = [];
      return;
    }

    this.isLoadingPlaces = true;

    this.placesAPI.get<PlacesResponse>(`/${query}.json`, {
      params: {
        proximity: this.userLocation!.join(',')
      }
    })
      .subscribe( res =>{
        console.log(res);
        this.isLoadingPlaces = false;
        this.places = res.features;
      });
  }

  deletePlaces() {
    this.places = [];
  }
}
