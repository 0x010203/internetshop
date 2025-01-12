import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ProductService } from '../../../shared/services/product.service';
import { ProductType } from '../../../../types/product.type';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../../shared/services/cart.service';
import { CartType } from '../../../../types/cart.type';
import { FavoriteService } from '../../../shared/services/favorite.service';
import { FavoriteType } from '../../../../types/favorite.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  recommendedProducts: ProductType[] = [];
  product!: ProductType;

  count: number = 1;

  serverStaticPath: string = environment.serverStaticPath;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    margin: 24,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
    },
    nav: false,
  };
  customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    margin: 26,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
    },
    nav: false,
  };

  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productService
        .getProduct(params['url'])
        .subscribe((data: ProductType) => {
          this.product = data;

          this.cartService.getCart().subscribe((cartData: CartType | DefaultResponseType) => {
            if ((cartData as DefaultResponseType).error !== undefined) {
              throw new Error((cartData as DefaultResponseType).message);
            }

            const cartDataResponse = cartData as CartType;

            if (cartDataResponse ) {
              const productInCart = cartDataResponse.items.find(
                (item) => item.product.id === this.product.id
              );
              if (productInCart) {
                this.product.countInCart = productInCart.quantity;
                this.count = this.product.countInCart;
              }
            }
          });

          if (this.authService.getIsLoggedIn()) {
            this.favoriteService
              .getFavorites()
              .subscribe((data: FavoriteType[] | DefaultResponseType) => {
                if ((data as DefaultResponseType).error !== undefined) {
                  //ошибка есть
                  const error = (data as DefaultResponseType).message;
                  throw new Error(error);
                }

                const products = data as FavoriteType[];
                const currentProductExists = products.find(
                  (item) => item.id === this.product.id
                );
                if (currentProductExists) {
                  this.product.isInFavorite = true;
                }
              });
          }
        });
      // if (!this.product) {
      //   console.log('Товар не найден. Переход по адресу 404');
      // }
    });

    this.productService.getBestProducts().subscribe((data: ProductType[]) => {
      this.recommendedProducts = data;
    });
  }

  updateCount(value: number) {
    //console.log(value);
    this.count = value;
    if (this.product.countInCart) {
      this.cartService
        .updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          this.product.countInCart = this.count;
        });
    }
  }

  addToCart() {
    //alert('Добавлено в корзину: ' + this.count);
    this.cartService
      .updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        //this.isInCart = true;
        this.product.countInCart = this.count;
      });
  }
  removeFromCart() {
    this.cartService
      .updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {

        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        
        //this.isInCart = false;
        this.product.countInCart = 0;
        this.count = 1;
      });
  }

  updateFavorite() {
    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open(
        'Для добавления в избранное необходимо авторизоваться'
      );
      return;
    }
    if (this.product.isInFavorite) {
      this.favoriteService
        .removeFavorite(this.product.id)
        .subscribe((data: DefaultResponseType) => {
          if (data.error) {
            //..
            throw new Error(data.message);
          }

          //удаляем товар вручную из массива
          this.product.isInFavorite = false;
        });
    } else {
      this.favoriteService
        .addFavorite(this.product.id)
        .subscribe((data: FavoriteType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.product.isInFavorite = true;
        });
    }
  }
}
