import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-codigo-promo',
  templateUrl: './codigo-promo.component.html',
  styleUrls: ['./codigo-promo.component.css']
})
export class CodigoPromoComponent implements OnInit {

  codigo: string;

  constructor(
    private _data: DataService,
    private _auth: AuthService,
    public dialogRef: MatDialogRef<CodigoPromoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() { }


  addCodigo() {
    const body = {
      usuario: this._auth.usuario._id,
      codigo: this.codigo.toLowerCase().trim()
    };

    this._data.addCupon(body).then(data => {
      this.dialogRef.close(data);
    });
  }

}
