import { Component, OnInit } from '@angular/core';
import { ControlService } from 'src/app/services/control.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogsComponent } from 'src/app/components/dialogs/dialogs.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';
import { BuscandoRiderComponent } from 'src/app/components/buscando-rider/buscando-rider.component';

declare var google: any;

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  map: any;

  hola: any;

  pedido_detalles = true;

  email: string;
  panelOpenState: boolean;

  disableSelect = new FormControl(false);

  isTarjeta = false;
  showCheck = true;

  constructor(
    public _control: ControlService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
    ) { }

    onChange(e) {
      console.log(e)
      this.pedido_detalles = e.checked;
    }

  ngOnInit() {
    // this._control.toast('Pedido creado con exito!');
    // this._control.toast('Se ha completado un pedido');
    this.openDialog();
    // this.cargarMapa();
    // this.buscandoRider();

    setTimeout(() => {
      console.log(this.hola)
    }, 3000);
  }

  onNoClick() {
    
  }

  toggleTarjeta() {
    this.showCheck = false;

    setTimeout(() => {
      this.showCheck = true;
      this.isTarjeta = !this.isTarjeta;
    }, 400);
  }

  cargarMapa() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: this._control.gpsCoors,
      zoom: 16,
      disableDefaultUI: true,
      zoomControl: true
    });

    // this.directionsDisplay.setMap(this.map);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogsComponent, {
      width: '250px',
      data: {name: 'hoola', animal: 'pescado'}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
    });
  }


  
  buscandoRider(): void {
    const dialogRef = this.dialog.open(BuscandoRiderComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
    });
  }

  


}
