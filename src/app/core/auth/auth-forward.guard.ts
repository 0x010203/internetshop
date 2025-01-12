import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import {Location} from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthForwardGuard implements CanActivate {
  constructor(private authService: AuthService, private location: Location) {}

  //если пользователь залогинен,  то переводим на предыдущую страницу и не разрешаем посетить текущий url-адрес (для страниц login и signup, т.е. если залогинился, то не может на них заходить)
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.authService.getIsLoggedIn()) {
      this.location.back();
      return false;
    };
    return true;
    
  }
}
