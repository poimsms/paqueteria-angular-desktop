import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  telefono: string;
  id: string;
  authState = new BehaviorSubject({ isAuth: false, usuario: {}, token: null, readyState: false });

  usuario: any;
  token: string;

  tipo: string;
  tokenPhone: string;

  storage_counter = 0;

  constructor(
    private http: HttpClient,
    private _config: ConfigService
  ) { 
    this.loadStorage();
  }

  loginIn(body) {
    return new Promise((resolve, reject) => {
      this.signIn(body).then((res: any) => {
        if (res.ok) {
          this.usuario = res.usuario;
          this.token = res.token;
          this.saveStorage(res.token, res.usuario);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  logout() {
    this.removeStorage();
    this.authState.next({ isAuth: false, usuario: null, token: null, readyState: true });
  }

  saveFlowOrderStorage(order) {
    localStorage.setItem("order", JSON.stringify(order));
  }

  removeStorage() {
    localStorage.removeItem("authData");
  }

  saveStorage(token, usuario) {
    const authData = { token, uid: usuario._id };
    this.usuario = usuario;
    this.token = token;
    localStorage.setItem("authData", JSON.stringify(authData));
    this.authState.next({ isAuth: true, usuario, token, readyState: true });
  }

  loadStorage() {
    if (localStorage.getItem('authData')) {

      const res = localStorage.getItem('authData');
      const token = JSON.parse(res).token;
      const uid = JSON.parse(res).uid;

      this.getUser(token, uid).then(usuario => {
        this.usuario = usuario;
        this.token = token;
        console.log(this.usuario,'usuaio')
        this.authState.next({ isAuth: true, usuario, token, readyState: true });
      });

    } else {
      this.authState.next({ isAuth: false, usuario: null, token: null, readyState: true });
    }
  }

  signIn(body) {
    const url = `${this._config.apiURL}/usuarios/signin-email`;
    return this.http.post(url, body).toPromise();
  }

  getUser(token, id) {
    const url = `${this._config.apiURL}/usuarios/get-one?id=${id}`;
    const headers = new HttpHeaders({ token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  updateUser(body) {
    const url = `${this._config.apiURL}/usuarios/update?id=${this.usuario._id}`;
    const headers = new HttpHeaders({ token: this.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

  refreshUser() {
    return new Promise((resolve, reject) => {
      const url = `${this._config.apiURL}/usuarios/get-one?id=${this.usuario._id}`;
      const headers = new HttpHeaders({ token: this.token, version: this._config.version });
      this.http.get(url, { headers }).toPromise().then(usuario => {
        this.usuario = usuario;
        resolve(usuario);
      });
    });
  }

  updatePassword(body) {
    const url = `${this._config.apiURL}/usuarios/update-password?id=${this.usuario._id}`;
    const headers = new HttpHeaders({ token: this.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

}