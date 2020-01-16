import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { FireService } from './fire.service';

@Injectable({
  providedIn: 'root'
})
export class ControlService {

  showToast = false;
  toast_message: string;

  isLoading = false;

  showAlert = false;
  alert_title: string;
  alert_message: string;
  alert$ = new Subject;
  showCancelar = false;

  header: any = {
    one: true,
    two: false,
    titulo: '',
  }

  tipo: string;

  origen: any = null;
  destino = {
    direccion: '',
    lat: 0,
    lng: 0
  };

  centro: any = { lat: -33.444600, lng: -70.655585 };

  posicion: any;

  origenReady = false;
  destinoReady = false;
  rutaReady = false;
  estaBuscandoRider = false;


  mis_lugares = {
    tipo: '',
    accion: '',
    id: ''
  };

  mapState = new Subject();
  ubicacionState = new Subject();

  gpsState = new Subject();

  gps_counter = 0;

  gpsCoors: any = { lat: -33.2657174, lng: -70.7070452 };

  pedido$ = new Subject();

  pedido_seleccionado = false;
  buscar_pedido_reciente = true;

  pedidos = 0;

  constructor(
    private _auth: AuthService,
    private _data: DataService,
    private _fire: FireService
    )
   { 
    //  this.subToRestaurante();
   }

   subToRestaurante() {
    this._fire.restaurante().subscribe((data: any) =>{
      console.log(data[0],'?????')
      this.pedidos = data[0].pedidos;
    })
   }

  
  getPedido(tipo, pedidoID?) {

    return new Promise((resolve, reject) => {

      if (this._auth.usuario.role == 'USUARIO_ROLE') {
        this._data.getPedidoActivo(this._auth.usuario._id).then((data: any) => {
          this.pedido$.next(data);
          resolve();
        });
      }

      if (this._auth.usuario.role == 'EMPRESA_ROLE') {

        if (tipo == 'buscar_pedido_activo_mas_reciente') {
          this._data.getPedidoActivo(this._auth.usuario._id).then((data: any) => {
            this.pedido$.next(data);
            resolve();
          });
        }

        if (tipo == 'buscar_pedido_seleccionado') {
          this._data.getOnePedido(pedidoID).then((data: any) => {
            this.pedido$.next(data);
            resolve();
          });
        }

      }
    });
  }


  calcularRuta() {
    this.rutaReady = true;
    const data = {
      accion: 'calcular-ruta',
      origen: this.origen,
      destino: this.destino
    }
    this.mapState.next(data);
  }

  checkDirecciones() {

    if (this.origenReady && this.destinoReady) {
      console.log('check true')

      this.ubicacionState.next(true);
    } else {
      console.log('check false')

      this.ubicacionState.next(false);
    }
  }

  toast(message) {
    this.toast_message = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3500);
  }

  alert(tittle, message, cancelar?) {

    cancelar ? this.showCancelar = true : this.showCancelar = false;

    return new Promise((resolve, reject) => {
      this.alert_title = tittle;
      this.alert_message = message;
      this.showAlert = true;
      this.alert$.subscribe(data => {
        this.showAlert = false;
        resolve(data);
      });
    });
  }
}
