import { Component, OnInit } from '@angular/core';
import { ControlService } from 'src/app/services/control.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string;
  password: string;
  cuenta: string;

  hide = true;

  constructor(
    public _control: ControlService,
    private _auth: AuthService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  login() {
    if (this.email && this.password) {
      this._control.isLoading = true;

      const body = {
        email: this.email.toLowerCase().trim(),
        password: this.password,
        from: 'moviapp-web'
      };

      this._auth.signIn(body).then((res: any) => {

        this._control.isLoading = false;
        
        if (res.ok) {
          this.router.navigateByUrl('home');
          this._auth.saveStorage(res.token, res.usuario);
        } else {
          this.alerta(res.message)
        }
      });
    }
  }


  alerta(message): void {
    const dialogRef = this.dialog.open(AlertaComponent, {
      width: '250px',
      data: { title: 'Algo salio mal..', message }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.email = null;
      this.password = null;
    });
  }

}
