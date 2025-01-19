import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../../../shared/services/favorite.service';
import { FavoriteType } from '../../../../types/favorite.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../../shared/services/cart.service';
import { CartType } from '../../../../types/cart.type';

type CountToCartType = 
  {
    idFavoriteProduct: string, 
    count: number
  }


@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss'],
})
export class FavoriteComponent implements OnInit {
  products: FavoriteType[] = [];
  serverStaticPath: string = environment.serverStaticPath;
  countsToAddToCart: CountToCartType[] = [];

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.favoriteService
      .getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          //ошибка есть
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        this.products = data as FavoriteType[];
        //получим корзину
        this.cartService
          .getCart()
          .subscribe((cartData: CartType | DefaultResponseType) => {
            if ((cartData as DefaultResponseType).error !== undefined) {
              throw new Error((cartData as DefaultResponseType).message);
            }

            const cartDataResponse = cartData as CartType;

            if (cartDataResponse) {
              this.products.forEach((favoriteProduct: FavoriteType) => {
                //пройдем по всем элементам и посмотрим, есть ли они в корзине
                const favoriteInCart = cartDataResponse.items.find(
                  (item) => item.product.id === favoriteProduct.id
                );
                if (favoriteInCart) {
                  favoriteProduct.countInCart = favoriteInCart.quantity;
                  //console.log(favoriteProduct.countInCart);
                }
              });

              // const favoriteInCart = cartDataResponse.items.find(
              //   (item) => item.product.id === this.product.id
              // );
              // if (favoriteInCart) {
              //   this.product.countInCart = productInCart.quantity;
              //   this.count = this.product.countInCart;
              // }
            }
          });
      });
  }

  removeFromFavorites(id: string): void {
    this.favoriteService
      .removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          //..
          throw new Error(data.message);
        }

        //удаляем товар вручную из массива
        this.products = this.products.filter((item) => item.id !== id);
        this.countsToAddToCart = this.countsToAddToCart.filter((item)=> item.idFavoriteProduct !== id);
      });
  }

  updateCount(product: FavoriteType, value: number) {
    if (product.countInCart && value) {
      this.cartService
        .updateCart(product.id, value)
        .subscribe((data: CartType | DefaultResponseType) => {
          product.countInCart = value;
        });
    } else {
      if (value) {
        let findedCountToAddToCart: CountToCartType | undefined;
        findedCountToAddToCart = this.countsToAddToCart.find(item => item.idFavoriteProduct === product.id);
        if (findedCountToAddToCart) {
          findedCountToAddToCart.count = value;
        } else {
          this.countsToAddToCart.push({idFavoriteProduct: product.id, count: value});
        }
      }
    }

    //console.log(this.countToAddToCart);
  }

  removeFromCart(product: FavoriteType) {
    this.cartService
      .updateCart(product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        product.countInCart = 0;
        this.countsToAddToCart = this.countsToAddToCart.filter((item: CountToCartType)=> item.idFavoriteProduct !== product.id);
        //this.count = 1;
      });
  }

   addToCart(product: FavoriteType) {
    const itemCountsToAddToCart: CountToCartType | undefined = this.countsToAddToCart.find(item => item.idFavoriteProduct === product.id);
    let count: number  = 1;
    if (itemCountsToAddToCart){
      count = itemCountsToAddToCart.count;
    }

      this.cartService
        .updateCart(product.id, count)
        .subscribe((data: CartType | DefaultResponseType) => {
          
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          //this.isInCart = true;
          product.countInCart = count;
        });
        
    }

}
