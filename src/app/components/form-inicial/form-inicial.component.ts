import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ControlService } from 'src/app/services/control.service';
import { AuthService } from 'src/app/services/auth.service';
import { SwPush } from '@angular/service-worker';
import { PushNotificationService } from 'src/app/services/push-notification.service';

declare var google: any;

@Component({
  selector: 'app-form-inicial',
  templateUrl: './form-inicial.component.html',
  styleUrls: ['./form-inicial.component.css']
})
export class FormInicialComponent implements OnInit {

  VAPID_PUBLIC = 'BB-Lgfvyrdf7S5RoLOs1hTfdjQP2kpuOSKBnh-sX76zh5qVanoL2wyviNjMZ7h3RkhhJzJl_qQ4IKlIKZfM7jug';

  step = 0;
  map: any;
  markerReady = false;
  marker: any;

  nombre: string;
  email: string;
  telefono: string;
  origen = {
    direccion: '',
    lat: 0,
    lng: 0
  };

  origenReady = false;

  isMapaCargado = false;

  error_info_incompleta = false;
  error_telefono = false;
  error_email = false;
  error_mapa = true;

  GoogleAutocomplete: any;
  origin_address: string;
  origin_items = [];
  geocoder: any;

  time = new Date().getTime();
  timeLater: number;

  center: any;

  isNotification = false;

  isLoading = false;


  @ViewChild('map', { static: false }) el: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<FormInicialComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _control: ControlService,
    private zone: NgZone,
    private _auth: AuthService,
    private swPush: SwPush,
    private _pushService: PushNotificationService
  ) {
    dialogRef.disableClose = true;

    this.timeLater = this.time;
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
  }

  ngOnInit() {
  }

  onNext() {

    if (this.step == 0) {
      return this.step = 1;
    }

    if (this.step == 1) {
      if (this.check_form()) {
        this.cargarMapa();
        this.step = 2;
      }
      return;
    }

    if (this.step == 2) {
      if (this.check_map()) {
        this.step = 3;
      }
      return;
    }

    if (this.step == 3) {
      this.saveHandler();
      return;
    }
  }

  saveHandler() {

    const body = {
      nombre: this.nombre.toLowerCase().trim(),
      telefono: this.telefono.toString(),
      // email: this.email.toLowerCase().trim(),
      origen: this.origen,
      cuentaSet: true
    };

    this._auth.updateUser(body).then(() => {
      this.dialogRef.close();
    });
  }

  onBack() {
    this.step--;
  }

  check_map() {

    this.error_mapa = false;

    let flag = true;

    if (!this.origenReady) {
      this.error_mapa = true;
      flag = false;
      return flag;
    }

    return flag;
  }

  check_form() {

    this.resetErrors();

    let flag = true;

    if (!(this.nombre && this.telefono)) {
      this.error_info_incompleta = true
      flag = false;
      return flag;
    }

    // if (!this.validateEmail(this.email)) {
    //   this.error_email = true;
    //   flag = false;
    //   return flag;
    // }

    if (!(this.telefono.toString().length == 9 && Number(this.telefono))) {
      this.error_telefono = true;
      flag = false;
      return flag;
    }

    return flag;
  }

  resetErrors() {
    this.error_email = false;
    this.error_info_incompleta = false;
    this.error_telefono = false;
  }

  cargarMapa() {

    if (this.isMapaCargado) {
      return;
    }

    this.el.nativeElement.style.height = '200px';

    this.map = new google.maps.Map(document.getElementById('map2'), {
      center: this._control.gpsCoors,
      zoom: 17,
      disableDefaultUI: true
    });

    this.isMapaCargado = true;
  }

  graficarMarcador(coors) {

    if (this.marker) {
      this.marker.setMap(null);
    }

    this.map.setCenter(coors);

    this.marker = new google.maps.Marker({
      position: coors,
      map: this.map
    });

  }

  updateSearchResults() {

    this.origenReady = false;

    if (this.origin_address == '') {
      this.origin_items = [];
      return;
    }

    if (this.timeLater - this.time > 400) {
      this.time = this.timeLater;
      let input = this.origin_address;

      this.GoogleAutocomplete.getPlacePredictions({ input, componentRestrictions: { country: 'cl' } },
        (predictions, status) => {
          this.origin_items = [];

          this.zone.run(() => {
            predictions.forEach((prediction) => {
              this.origin_items.push(prediction);
            });
          });
        });
    }

    this.timeLater = new Date().getTime();
  }

  selectSearchResult(item) {
    this.origin_items = [];

    this.origin_address = item.description;
    this.origenReady = true;

    this.geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {

        let center = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };

        this.origen.direccion = this.origin_address;
        this.origen.lat = center.lat;
        this.origen.lng = center.lng;
        this.center = center;
        this.graficarMarcador(center);
      }

    });
  }

  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  grandPermitionNotification() {

    if (this.isLoading) {
      return;
    }
    
    if (this.swPush.isEnabled) {

      this.isLoading = true;

      this.swPush
        .requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC,
        })
        .then(subscription => {
          let id = this._auth.usuario._id;
          this._pushService.sendSubscriptionToTheServer(id, subscription).then(() => {
            this._auth.updateUser({ notificationSet: true }).then(() => {
              this.isNotification = true;
              this.isLoading = false;
              this._auth.refreshUser();
            });
          });
        })
        .catch(e => {
          this.isLoading = false;
          console.log(e, 'error');
        })
    }
  }

}
