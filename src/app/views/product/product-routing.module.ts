import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogComponent } from './catalog/catalog.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  {path: 'catalog', component: CatalogComponent},
  {path: 'product/:url', component: DetailComponent},
  //добавили параметр в строку url, с ним потом сможем работать через observable activatedrouterparams
  //:url - это не queryparams, a params

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
