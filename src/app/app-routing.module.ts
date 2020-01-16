import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { LoginComponent } from './pages/login/login.component';
import { CuponComponent } from './pages/cupon/cupon.component';
import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'usuario', component: UsuarioComponent, canActivate: [AuthGuard] },
  { path: 'historial', component: HistorialComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'cupon', component: CuponComponent },

  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
