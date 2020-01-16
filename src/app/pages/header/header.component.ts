import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ControlService } from 'src/app/services/control.service';
import { CodigoPromoComponent } from 'src/app/components/codigo-promo/codigo-promo.component';
import { MatDialog } from '@angular/material';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    public _control: ControlService,
    public dialog: MatDialog,
    private _data: DataService,
    public _auth: AuthService

  ) { }

  ngOnInit() {
  }

  openPage(page) {
    this.router.navigateByUrl(page);
  }


  openCodigoPromo(): void {
    const dialogRef = this.dialog.open(CodigoPromoComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        if (!data.ok) {
          this.alerta('Algo salio mal...', data.message);
        } else {
          this._data.getCuponActivo(this._auth.usuario._id);
        }
      }
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



}
