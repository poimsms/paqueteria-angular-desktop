import { Component, OnInit } from '@angular/core';
import {MatDialog } from '@angular/material/dialog';
import { DetallesComponent } from 'src/app/components/detalles/detalles.component';
import { FormInicialComponent } from 'src/app/components/form-inicial/form-inicial.component';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { FireService } from 'src/app/services/fire.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {

  tipo: string;
  pedidos = [];


  constructor(
    private _data: DataService,
    private _auth: AuthService,
    public dialog: MatDialog,
    private _push: PushNotificationService,
    private _fire: FireService

  ) { }

  ngOnInit() {
    // this.buscandoRider();
    // this.formInicial();

    this.getHistorial();

    this._fire.restaurante_pedido_cero();
  }

  getHistorial() {
    this._data.getPedidos(this._auth.usuario._id).then((pedidos: any) => {
      console.log(pedidos,'pedidos')
      this.pedidos = [];
      this.pedidos = pedidos;
    });
  }

  openDetalles(pedido): void {
    const dialogRef = this.dialog.open(DetallesComponent, {
      width: '400px',
      data: pedido
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
    });
  }

  formInicial(): void {
    const dialogRef = this.dialog.open(FormInicialComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
    });
  }

  cancelarPedido(pedido): void {
    const dialogRef = this.dialog.open(AlertaComponent, {
      width: '250px',
      data: { 
        title: 'Cancelar pedido', 
        message: '¿Quieres cancelar el pedido?'
       }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.ok) {
        // console.log(pedido,'pedido')

        this.cancelarServicio(pedido);
      }
    });
  }

  async cancelarServicio(pedido) {
    // console.log(pedido)
    await this._fire.cancelarServicio(pedido.rider._id, pedido);
    await this._push.sendPushNotification(pedido.rider._id, 'servicio-cancelado');
    this.getHistorial();
  }

}
