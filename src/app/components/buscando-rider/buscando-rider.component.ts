import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FireService } from 'src/app/services/fire.service';
import { ControlService } from 'src/app/services/control.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-buscando-rider',
  templateUrl: './buscando-rider.component.html',
  styleUrls: ['./buscando-rider.component.css']
})
export class BuscandoRiderComponent implements OnInit {

  isBuscando = true;
  isAceptado = false;

  no_riders_area = false;
  counter = 0;

  bodyNeerRider: any;

  timer: any;

  precio: number;
  precio_promo: number;
  distancia: number;

  rider: any;
  riderSub$: Subscription;
  riderActivoEnBusqueda: string;

  pedido: any;
  cliente: any;
  vehiculo: string;

  cuponData: any;

  constructor(
    public dialogRef: MatDialogRef<BuscandoRiderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _auth: AuthService,
    private _data: DataService,
    private _fire: FireService,
    public _control: ControlService

  ) {
    dialogRef.disableClose = true;

    this.cuponData = this.data.cuponData;
    this.distancia = this.data.distancia;
    this.pedido = this.data.pedido;
    this.vehiculo = this.data.transporte;
  }

  ngOnInit() {
    // setTimeout(() => {
    //   this.isBuscando = false;
    //   this.isAceptado = true;
    // }, 1000);

    this.buscarRider();
  }


  close_dialog(tipo) {
    this.dialogRef.close({ tipo });
  }


  buscarRider() {

    if (this.no_riders_area) {
      return setTimeout(() => {
        this.no_riders_area = false;
        this.close_dialog('AREA_SIN_RIDERS');
      }, 5 * 1000);
    }

    this._fire.riders_consultados = [];

    this.bodyNeerRider = {
      ciudad: this._auth.usuario.ciudad,
      vehiculo: this.vehiculo,
      lat: this._auth.usuario.origen.lat,
      lng: this._auth.usuario.origen.lng
    };

    this.getNeerestRider();
  }

  getNeerestRider() {

    return new Promise((resolve, reject) => {

      this.counter++;

      if (this.counter == 4) {
        this.counter = 0;
        this.close_dialog('ALTA_DEMANDA');
        return;
      }

      this._fire.getNeerestRider(this.bodyNeerRider).then((res: any) => {

        if (!res.ok) {
          console.log('entroooo alta demanda')
          return setTimeout(() => {
            this.close_dialog('ALTA_DEMANDA');
          }, 5 * 1000);
        }

        this.handShake(res.id);
        this.sleepRider(res.id);

        resolve();
      });
    });
  }

  sleepRider(id) {
    this.timer = setTimeout(async () => {

      this._fire.riders_consultados.push(id);

      this.getNeerestRider();

      this._fire.updateRider(id, 'rider', {
        cliente_activo: '',
        pagoPendiente: false,
        nuevaSolicitud: false
      });

      this._fire.updateRider(id, 'coors', {
        pagoPendiente: false
      });

    }, 45 * 1000);
  }

  handShake(id) {
    this._fire.getRiderPromise(id).then((rider: any) => {

      if (rider.cliente_activo == '') {
        this._fire.updateRider(id, 'rider', { cliente_activo: this._auth.usuario._id })
          .then(() => this.handShake(id));
      }

      if (rider.cliente_activo != this._auth.usuario._id && rider.cliente_activo != '') {
        this.getNeerestRider();
      }

      if (rider.cliente_activo == this._auth.usuario._id && rider.cliente_activo != '') {
        this.sendRiderRequest(id);
      }
    });
  }

  async sendRiderRequest(id) {

    this._fire.riders_consultados.push(id);

    await this._fire.updateRider(id, 'rider', {
      nuevaSolicitud: true,
      pagoPendiente: true,
      created: new Date().getTime(),
      dataPedido: {
        cliente: {
          _id: this._auth.usuario._id,
          nombre: this._auth.usuario.nombre,
          img: this._auth.usuario.img.url,
          role: this._auth.usuario.role
        },
        pedido: {
          distancia: this.distancia,
          origen: this._auth.usuario.origen.direccion,
          destino: this._control.destino.direccion,
          costo: this.pedido.costo_real
        }
      }
    });

    await this._fire.updateRider(id, 'coors', {
      pagoPendiente: true
    });

    this.subscribeToRider(id);
    this._data.sendPushNotification(id, 'nuevo-pedido');
  }

  subscribeToRider(id) {
    this.riderSub$ = this._fire.getRider(id).subscribe(data => {
      const riderFire: any = data[0];
      this.riderActivoEnBusqueda = riderFire.rider;

      if (riderFire.rechazadoId == this._auth.usuario._id) {
        clearTimeout(this.timer);
        this.riderSub$.unsubscribe();
        this._fire.updateRider(id, 'rider', { rechazadoId: '', cliente_activo: '' })
        this.getNeerestRider();
      }

      if (riderFire.aceptadoId == this._auth.usuario._id) {

        clearTimeout(this.timer);
        this.riderSub$.unsubscribe();

        this._data.getOneRider(riderFire.rider).then(rider => {

          this.rider = rider;

          this.confirmar_envio();
        });
      }

    });
  }


  async confirmar_envio() {

    const body = this.pedido;
    body.rider = this.rider._id;

    const pedido: any = await this._data.crearPedido(body);

    await this.updateRiderEstadoOcupado(pedido._id);
    await this._fire.restaurante_add_pedido();

    await this._data.useCupon(this.cuponData.id);

    this.isBuscando = false;
    this.isAceptado = true;
  }

  updateRiderEstadoOcupado(pedidoId) {

    this._fire.updateRider(this.rider._id, 'rider', {
      fase: 'navegando_al_origen',
      pagoPendiente: false,
      actividad: 'ocupado',
      pedido: pedidoId,
      aceptadoId: '',
      evento: 1
    });

    this._fire.updateRider(this.rider._id, 'coors', {
      pagoPendiente: false,
      actividad: 'ocupado',
      pedido: pedidoId,
      cliente: this._auth.usuario._id,
      evento: 1
    });
  }

  updateRiderEstadoDisponible() {
    this._fire.updateRider(this.rider._id, 'rider', {
      pagoPendiente: false,
      aceptadoId: '',
      cliente_activo: ''
    });
    this._fire.updateRider(this.rider._id, 'coors', {
      pagoPendiente: false
    });
  }

  onAceptar() {
    this.close_dialog('PEDIDO_EXITOSO');
  }

  onCancelar() {
    this.riderSub$.unsubscribe();
    clearTimeout(this.timer);

    this._fire.updateRider(this.riderActivoEnBusqueda, 'rider', { nuevaSolicitud: false, pagoPendiente: false, cliente_activo: '' });
    this._fire.updateRider(this.riderActivoEnBusqueda, 'coors', { pagoPendiente: false });

    this.close_dialog('PEDIDO_CANCELADO');
  }

}
