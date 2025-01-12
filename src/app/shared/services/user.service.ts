import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { environment } from '../../../environments/environment';
import { DefaultResponseType } from '../../../types/default-response.type';
import { UserInfoType } from '../../../types/user-info.type';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  
  constructor(private http: HttpClient) {}

  
  updateUserInfo(params: UserInfoType): Observable<DefaultResponseType> {
    return this.http
      .post<DefaultResponseType>(
        environment.api + 'user',
        params
        //withCredentials: true  убираем, т.к. запрос можно выполнить только если пользователь залогинен
        //{ withCredentials: true }
      )
      
  }
  getUserInfo(): Observable<DefaultResponseType | UserInfoType> {
    return this.http
      .get<DefaultResponseType| UserInfoType>(
        environment.api + 'user'
        //withCredentials: true  убираем, т.к. запрос можно выполнить только если пользователь залогинен
        //{ withCredentials: true }
      )
      
  }
}
