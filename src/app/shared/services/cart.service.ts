import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartType } from '../../../types/cart.type';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DefaultResponseType } from '../../../types/default-response.type';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private count: number = 0;
  count$: Subject<number> = new Subject<number>();

  constructor(private http: HttpClient) {}

  setCount(count: number){
    this.count = count;
    this.count$.next(this.count);
  }

  getCart(): Observable<CartType | DefaultResponseType> {
    return this.http.get<CartType | DefaultResponseType>(
      environment.api + 'cart',
      { withCredentials: true }
    );
  }
  getCartCount(): Observable<{ count: number } | DefaultResponseType> {
    return this.http
      .get<{ count: number } | DefaultResponseType>(
        environment.api + 'cart/count',
        { withCredentials: true }
      )
      .pipe(
        tap((data) => {
          if (!data.hasOwnProperty('error')) {
            this.setCount((data as { count: number }).count);

            // this.count = (data as { count: number }).count;
            // this.count$.next(this.count);
          }
        })
      );
  }

  updateCart(
    productId: string,
    quantity: number
  ): Observable<CartType | DefaultResponseType> {
    return this.http
      .post<CartType | DefaultResponseType>(
        environment.api + 'cart',
        { productId, quantity },
        { withCredentials: true }
      )
      .pipe(
        tap((data) => {
          if (!data.hasOwnProperty('error')) {
            //this.count = 0;
            let count = 0;
            (data as CartType).items.forEach((item) => {
              //this.count += item.quantity;
              count += item.quantity;
            });
            //this.count$.next(this.count);
            this.setCount(count);
          }
        })
      );
  }
}
