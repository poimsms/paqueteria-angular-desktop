import { Component } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { PushNotificationService } from './services/push-notification.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { ControlService } from './services/control.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'moviapp-desktop';

  VAPID_PUBLIC = 'BB-Lgfvyrdf7S5RoLOs1hTfdjQP2kpuOSKBnh-sX76zh5qVanoL2wyviNjMZ7h3RkhhJzJl_qQ4IKlIKZfM7jug';

  isAuth = false;

  constructor(
    private swPush: SwPush,
    private _pushService: PushNotificationService,
    private _auth: AuthService,
    private router: Router,
    public _control: ControlService
  ) {

    console.log('CONTRSTUCTOOOR')

    // this.subToNotifications();
    //hmm

    this._auth.authState.subscribe((data: any) => {

      this.isAuth = data.isAuth;

      if (data.isAuth) {

        if (!data.usuario.notificationSet) {
          // this.subToNotifications();
        }

        this._control.subToRestaurante();

        this.router.navigateByUrl('home');
      } else {
        this.router.navigateByUrl('login');
      }
    });

  }

  subToNotifications() {
    if (this.swPush.isEnabled) {
      this.swPush
        .requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC,
        })
        .then(subscription => {
          let id = this._auth.usuario._id;
          this._pushService.sendSubscriptionToTheServer(id, subscription).then(() => {
            this._auth.updateUser({ notificationSet: true }).then(() => {
              this._auth.refreshUser();
            });
          });
        })
        .catch(e => console.log(e, 'errrorrrs'))
    }
  }
}
