import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

import { CategoryType } from '../../../../types/category.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ProductType } from '../../../../types/product.type';
import { environment } from '../../../../environments/environment';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
//import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLogged: boolean = false;
  //количество в корзине
  count: number = 0;

  searchValue: string = '';
  searchField = new FormControl();
  products: ProductType[] = [];
  serverStaticPath = environment.serverStaticPath;
  showedSearch: boolean = false;

  @Input() categories: CategoryWithTypeType[] = [];

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService
    //private loaderService: LoaderService,
  ) {
    this.isLogged = authService.getIsLoggedIn();
  }

  ngOnInit(): void {

    //this.loaderService.show();

    this.searchField.valueChanges
    .pipe(
      debounceTime(500)
    )
    .subscribe(value => {
      //console.log(value);
      if (value && value.length > 2) {
        this.productService
          .searchProducts(value)
          .subscribe((data: ProductType[]) => {
            this.products = data;
            this.showedSearch = true;
          });
      } else {
        this.products = [];
      }
    });

    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    });

    this.cartService
      .getCartCount()
      .subscribe((data: { count: number } | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.count = (data as { count: number }).count;
        //this.cartService.count = data.count;

        //this.loaderService.hide();
      });

    this.cartService.count$.subscribe((count) => {
      this.count = count;
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        //если токен просрочен, то не сможем разлогиниться, поэтому просто всё чистим и не важно, что пришло в ответе
        // if  (data.error){
        //   this._snackBar.open('Ошибка выхода из системы');
        //   throw new Error(data.message);
        // }
        // this.authService.removeTokens();
        // this.authService.userId = null;
        // this._snackBar.open('Вы успешно вышли из системы');
        // this.router.navigate(['/']);
        this.doLogout();
      },
      error: (/*errorResponse: HttpErrorResponse*/) => {
        // if (errorResponse.error && errorResponse.error.message) {
        //   this._snackBar.open(errorResponse.error.message);
        // } else {
        //   this._snackBar.open('Ошибка выхода из системы');
        // }
        this.doLogout();
      },
    });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы успешно вышли из системы');
    this.router.navigate(['/']);
  }

  // changedSearchedValue(newValue: string){
  //   this.searchValue = newValue;

  //   if (this.searchValue && this.searchValue.length > 2){
  //     this.productService.searchProducts(this.searchValue)
  //     .subscribe((data: ProductType[])=>{
  //       this.products = data;
  //       this.showedSearch = true;
  //     })
  //   } else {
  //     this.products = [];
  //   }
  // }

  selectProduct(url: string) {
    this.router.navigate(['/product/' + url]);
    //this.searchValue='';
    this.searchField.setValue('');
    this.products = [];
  }

  // changeShowedSearch(value: boolean){
  //   //ставим таймаут, чтобы ангулар успел обработать клик перед скрытием div
  //   setTimeout(()=>{
  //     this.showedSearch = value;
  //   }, 200)
  //   //за 100 не успевали перейти, поставили 200
  // }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if (
      this.showedSearch &&
      (event.target as HTMLElement).className.indexOf('search-product') === -1
    ) {
      this.showedSearch = false;
    }
  }
}
