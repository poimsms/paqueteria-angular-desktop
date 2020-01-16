import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(
    public http: HttpClient,
    private _config: ConfigService,
    private _auth: AuthService
  ) { }

  getDevice(id) {
    const url = `${this._config.apiURL}/core/device-get-one?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  sendSubscriptionToTheServer(id, subscription: PushSubscription) {
    const url = `${this._config.apiURL}/push-notifications/subscription?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.post(url, subscription, { headers }).toPromise();
  }

  async sendPushNotification(id, topico) {
    const device: any = await this.getDevice(id);
    const pushURL = `https://us-central1-mapa-334c3.cloudfunctions.net/pushNotification?topico=${topico}&token=${device.token}`;
    this.http.get(pushURL, { responseType: 'text' }).toPromise();
  }
}
