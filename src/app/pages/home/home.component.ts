import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ControlService } from 'src/app/services/control.service';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';
import { MatDialog } from '@angular/material';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { FormInicialComponent } from 'src/app/components/form-inicial/form-inicial.component';
import { BuscandoRiderComponent } from 'src/app/components/buscando-rider/buscando-rider.component';
import { FireService } from 'src/app/services/fire.service';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isTarjeta = false;
  isEnvioPagado = false;

  destination_address: string;
  destination_items = [];

  time = new Date().getTime();
  timeLater: number;

  destinoReady = false;

  map: any;
  service: any;
  GoogleAutocomplete: any;
  geocoder: any;

  marker: any;

  destino = {
    direccion: '',
    lat: 0,
    lng: 0
  };

  distancia: number;
  distancia_excedida = false;
  tiempo: string;
  cuponSub$: Subscription;

  precio: number;
  precio_promo: number;

  estaBuscandoRider = false;
  cuponData: any;

  descripcion_producto: string;
  precio_producto: number;
  nombre_cliente: string;
  telefono_cliente: string;

  isEntregaValid = false;
  isPedidoValid = false;

  isAuto = false;
  isMoto = false;
  isBicicleta = true;

  tiempoMoto: number;
  tiempoBici: number;
  tiempoAuto: number;

  precioMoto: number;
  precioBici: number;
  precioAuto: number;

  precioMoto_promo: number;
  precioBici_promo: number;
  precioAuto_promo: number;

  showMoto: boolean;
  showBici: boolean;
  showAuto: boolean;

  no_riders_area: boolean;


  transporte: string;

  constructor(
    private _control: ControlService,
    private router: Router,
    private _data: DataService,
    private _auth: AuthService,
    public dialog: MatDialog,
    private _global: GlobalService,
    private _fire: FireService,
    private zone: NgZone
  ) {
    this.service = new google.maps.DistanceMatrixService();

    this.timeLater = this.time;
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
  }

  ngOnInit() {
    if (this._auth.usuario.cuentaSet) {

      let origen = this._auth.usuario.origen;
      this._control.gpsCoors.lat = origen.lat;
      this._control.gpsCoors.lng = origen.lng;
    } else {
      this.openFormInicial();
    }

    this.cargarMapa();
    this.subToCodigoPromo();
  }

  ngOnDestroy() {
    this.cuponSub$.unsubscribe();
  }

  subToCodigoPromo() {
    this.cuponSub$ = this._data.cuponData.subscribe(data => {
      this.cuponData = data
    })
    this._data.getCuponActivo(this._auth.usuario._id);
  }

  iniciarPedido() {

    if (this.distancia_excedida) {
      this.alerta('Distancia excedida', 'Es mucha distancia para nuestros Riders');
      return;
    }

    this._control.estaBuscandoRider = true;

    const pedido: any = {
      costo: this.precio_promo,
      costo_real: this.precio,
      metodo_de_pago: 'Efectivo',
      distancia: this.distancia,
      origen: this._auth.usuario.origen,
      destino: this._control.destino,
      precio_producto: this.precio_producto,
      instrucciones: this.descripcion_producto,
      cliente: this._auth.usuario._id,
      telefono_origen: this._auth.usuario.telefono,
      telefono_destino: this.telefono_cliente,
      nombre_origen: this._auth.usuario.nombre,
      nombre_destino: this.nombre_cliente,
      tiempo_entrega: this.tiempo,
      envio_pagado: false,
      pagar_productos: true,
      cobrar_productos: true,
      from: 'WEB'
    };

    if (this.isTarjeta) {
      pedido.metodo_de_pago = 'Tarjeta';
      pedido.pagar_productos = false;
      pedido.cobrar_productos = false;
    }

    if (this.isEnvioPagado) {
      pedido.envio_pagado = true;
    }

    if (this.precio_promo == 0) {
      pedido.envio_pagado = true;
    }

    this.buscandoRider({
      transporte: this.transporte,
      pedido,
      distancia: this.distancia,
      cuponData: this.cuponData
    });
  }

  buscandoRider(data): void {
    const dialogRef = this.dialog.open(BuscandoRiderComponent, {
      width: '350px',
      data
    });

    dialogRef.afterClosed().subscribe((data: any) => {

      if (data.tipo == 'PEDIDO_EXITOSO') {
        this._data.getCuponActivo(this._auth.usuario._id);
      }

      if (data.tipo == 'PEDIDO_CANCELADO') {
        this.alerta('Pedido cancelado', 'Defina un nuevo trayecto!');
      }

      if (data.tipo == 'AREA_SIN_RIDERS') {
        this.alerta('No hay riders en el área', 'Enviaremos nuevos riders en unos momentos');
      }

      if (data.tipo == 'ALTA_DEMANDA') {
        this.alerta('Lo sentimos mucho!', 'Debido a una alta demanda no podemos procesar nuevos pedidos. Inténtalo en unos minutos.');
      }

      if (data.tipo == 'DISTANCIA_EXCEDIDA') {
        this.alerta('Lo sentimos mucho!', 'Es mucha distancia para nuestros Riders');
      }

      this.reset();
    });
  }

  openFormInicial(): void {
    const dialogRef = this.dialog.open(FormInicialComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
    });
  }

  calcular_precio() {

    this.service.getDistanceMatrix(
      {
        origins: [this._auth.usuario.origen.direccion],
        destinations: [this.destination_address],
        travelMode: 'DRIVING',
      }, async (response, status) => {

        const distancia = response.rows[0].elements[0].distance.value;
        const seconds = response.rows[0].elements[0].duration.value;

        this.distancia = distancia;

        const body = {
          ciudad: this._auth.usuario.ciudad,
          lat: this._auth.usuario.origen.lat,
          lng: this._auth.usuario.origen.lng
        };

        const res: any = await this._fire.detectarRidersCercanos(body);

        if (!res.isMoto && !res.isBici && !res.isAuto) {
          this.no_riders_area = true;

          this.showBici = false;
          this.showMoto = true;
          this.showAuto = false;

          this.isMoto = true;
        }

        if (res.isMoto || res.isBici || res.isAuto) {
          this.no_riders_area = false;

          if (res.isBici) {
            this.isBicicleta = true;
          } else if (res.isMoto) {
            this.isMoto = true;
          } else {
            if (res.isAuto) {
              this.isAuto = true;
            }
          }

          this.showMoto = res.isMoto;
          this.showBici = res.isBici;
          this.showAuto = res.isAuto;
        }

        if (distancia > 5000) {
          this.showBici = false
        }

        if (distancia > 40000) {
          this.distancia_excedida = true;
        }

        this.tiempoMoto = Math.round(seconds / 60 / 1.15) + 3;
        this.tiempoBici = Math.round(distancia / (13 * 1000) * 60) + 4;
        this.tiempoAuto = Math.round(seconds / 60 / 1.15) + 4;

        const tarifasBody = {
          distancia: this.distancia,
          ciudad: this._auth.usuario.ciudad
        };

        const precios: any = await this._global.calcularPrecios(tarifasBody);

        this.precioMoto = precios.moto;
        this.precioBici = precios.bici;
        this.precioAuto = precios.auto;

        this.precioMoto_promo = precios.moto;
        this.precioBici_promo = precios.bici;
        this.precioAuto_promo = precios.auto;

        if (this.cuponData.ok) {
          this.precioMoto_promo = this._global.aplicar_codigo(this.cuponData, precios.moto);
          this.precioBici_promo = this._global.aplicar_codigo(this.cuponData, precios.bici);
          this.precioAuto_promo = this._global.aplicar_codigo(this.cuponData, precios.auto);
        }

        this.destinoReady = true;
        this._control.isLoading = false;
      });
  }

  updateSearchResults() {

    this.destinoReady = false;

    if (this.destination_address == '') {
      this.destination_items = [];
      return;
    }

    if (this.timeLater - this.time > 2000) {
      this.time = this.timeLater;
      let input = this.destination_address;

      this.GoogleAutocomplete.getPlacePredictions({ input, componentRestrictions: { country: 'cl' } },
        (predictions, status) => {
          this.destination_items = [];

          this.zone.run(() => {
            predictions.forEach((prediction) => {
              this.destination_items.push(prediction);
            });
          });
        });
    }

    this.timeLater = new Date().getTime();
  }

  selectSearchResult(item) {
    this.destination_items = [];

    this.destination_address = item.description;

    this._control.isLoading = true;

    this.geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {

        let center = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };

        this._control.destino.direccion = this.destination_address;
        this._control.destino.lat = center.lat;
        this._control.destino.lng = center.lng;
        this.graficarMarcador(center);
        this.calcular_precio();
      }

    });
  }

  cargarMapa() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: this._control.gpsCoors,
      zoom: 16,
      disableDefaultUI: true,
      zoomControl: true
    });
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


  alerta(title, message): void {
    const dialogRef = this.dialog.open(AlertaComponent, {
      width: '250px',
      data: { title, message }
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.resetMapaAndRider();
    });
  }

  validarEntrega() {
    if (this.nombre_cliente.length > 2 && this.telefono_cliente.length >= 8) {
      this.isEntregaValid = true;
    } else {
      this.isEntregaValid = false;
    }
  }

  validarPedido() {
    setTimeout(() => {

      if (this.isTarjeta) {
        this.isPedidoValid = true;
      }

      if (!this.isTarjeta && this.precio_producto) {
        if (this.precio_producto.toString().length > 2) {
          this.isPedidoValid = true;
        }

        if (this.precio_producto.toString().length <= 2) {
          this.isPedidoValid = false;
        }
      }

      if (!this.isTarjeta && !this.precio_producto) {
        this.isPedidoValid = false;
      }

    }, 50);

  }

  vehiculoToggle(tipo) {
    this.transporte = tipo;
    if (tipo == 'bicicleta') {
      this.isBicicleta = true;
      this.isMoto = false;
      this.isAuto = false;
    }
    if (tipo == 'moto') {
      this.isBicicleta = false;
      this.isMoto = true;
      this.isAuto = false;

    }
    if (tipo == 'auto') {
      this.isBicicleta = false;
      this.isMoto = false;
      this.isAuto = true;
    }
  }

  reset() {
    this.marker.setMap(null);
    this.map.setCenter(this._control.gpsCoors);
    this.destinoReady = false;
    this.destination_address = null;
    this.destination_items = [];
    this.distancia_excedida = false;
    this.isTarjeta = false;
    this.nombre_cliente = null;
    this.telefono_cliente = null;
    this.precio_producto = null;
    this.descripcion_producto = null;
    this.isEntregaValid = false;
    this._control.destino.direccion = '';
    this._control.destino.lat = 0;
    this._control.destino.lng = 0;
  }

}
