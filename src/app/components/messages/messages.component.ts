import { Component, OnInit } from '@angular/core';
import { ControlService } from 'src/app/services/control.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  showCancelar

  constructor(public _control: ControlService) { }

  ngOnInit() {
  }

  alertButton(tipo, showCancelar?) {
    this.showCancelar = showCancelar;
    this._control.alert$.next(tipo);
  }

}
