import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';


import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAmlXBSsNgsocMZ15dN8bc1D3ZD0gMAetQ",
  authDomain: "mapa-334c3.firebaseapp.com",
  databaseURL: "https://mapa-334c3.firebaseio.com",
  projectId: "mapa-334c3",
  storageBucket: "",
  messagingSenderId: "905180881415",
  appId: "1:905180881415:web:3d4928246302074a"
};


import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { LoginComponent } from './pages/login/login.component';
import { CuponComponent } from './pages/cupon/cupon.component';
import { MessagesComponent } from './components/messages/messages.component';
import { DialogsComponent } from './components/dialogs/dialogs.component';
import { PayComponent } from './components/pay/pay.component';
import { RatingComponent } from './components/rating/rating.component';
import { AlertaComponent } from './components/alerta/alerta.component';
import { BuscandoRiderComponent } from './components/buscando-rider/buscando-rider.component';
import { DetallesComponent } from './components/detalles/detalles.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FormInicialComponent } from './components/form-inicial/form-inicial.component';
import { HeaderComponent } from './pages/header/header.component';
import { CodigoPromoComponent } from './components/codigo-promo/codigo-promo.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HistorialComponent,
    UsuarioComponent,
    LoginComponent,
    CuponComponent,
    MessagesComponent,
    DialogsComponent,
    PayComponent,
    RatingComponent,
    AlertaComponent,
    BuscandoRiderComponent,
    DetallesComponent,
    FormInicialComponent,
    HeaderComponent,
    CodigoPromoComponent,
  ],

  entryComponents: [
    DialogsComponent,
    AlertaComponent,
    BuscandoRiderComponent,
    DetallesComponent,
    FormInicialComponent,
    CodigoPromoComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatTabsModule,
    MatExpansionModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
