import { Component, Input, OnInit } from '@angular/core';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveParamsType } from '../../../../types/active-params.type';
import { ActiveParamsUtil } from '../../utils/active-params.util';

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
})
export class CategoryFilterComponent implements OnInit {
  @Input()
  categoryWithTypes: CategoryWithTypeType | null = null;

  @Input()
  type: string | null = null;

  open: boolean = false;

  activeParams: ActiveParamsType = { types: [] };

  from: number | null = null;
  to: number | null = null;

  get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name;
    } else if (this.type) {
      if (this.type === 'height') {
        return 'Высота';
      } else if (this.type === 'diameter') {
        return 'Диаметр';
      }
    }
    return '';
  }

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      //console.log(params);
      

      this.activeParams = ActiveParamsUtil.processParams(params);

      //устанавливаем внешний вид страницы в соотвестии с парметрами url
      if (this.type) {
        if (this.type === 'height') {
          this.open = !!(
            this.activeParams.heightFrom || this.activeParams.heightTo
          );

          this.from = this.activeParams.heightFrom
            ? +this.activeParams.heightFrom
            : null;
          // if (this.activeParams.heightFrom){
          //   this.from = +this.activeParams.heightFrom;
          // } else {
          //   //если стерли параметры из url
          //   this.from = null;
          // }

          this.to = this.activeParams.heightTo
            ? +this.activeParams.heightTo
            : null;
        } else if (this.type === 'diameter') {
          this.open = !!(
            this.activeParams.diameterFrom || this.activeParams.diameterTo
          );

          this.from = this.activeParams.diameterFrom
            ? +this.activeParams.diameterFrom
            : null;
          // if (this.activeParams.diameterFrom){
          //   this.from = +this.activeParams.diameterFrom;
          // }
          this.to = this.activeParams.diameterTo
            ? +this.activeParams.diameterTo
            : null;
          // if (this.activeParams.diameterTo){
          //   this.to = +this.activeParams.diameterTo;
          // }
        }}
         else {
          //работаем с категориями
          //console.log(this.activeParams.types);
          //console.log(params['types']);
          if (params['types']){
            //params['types'] может быть не массивом, а просто строкой
            this.activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];
          }
          
          

          if (
            this.categoryWithTypes &&
            this.categoryWithTypes.types &&
            this.categoryWithTypes.types.length > 0 &&
            this.categoryWithTypes.types.some(type => this.activeParams.types.find(item => type.url === item))) {
            this.open = true;
          }
        }
      
    });
  }

  toggle(): void {
    this.open = !this.open;
  }

  updateFilterParam(url: string, checked: boolean) {
    if (this.activeParams.types && this.activeParams.types.length > 0) {
      const existingTypeInParams = this.activeParams.types.find(
        (item) => item === url
      );
      if (existingTypeInParams && !checked) {
        this.activeParams.types = this.activeParams.types.filter(
          (item) => item !== url
        );
      } else if (!existingTypeInParams && checked) {
        //чиним глюк ангуляра, push не работает, если работаем с объектом, который как-то связан с queryparams
        //this.activeParams.types.push(url);
        this.activeParams.types = [...this.activeParams.types, url];
      }
    } else if (checked) {
      this.activeParams.types = [url];
    }
    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams,
    });
  }

  updateFilterParamFromTo(param: string, value: string): void {
    if (
      param === 'heightTo' ||
      param === 'heightFrom' ||
      param === 'diameterTo' ||
      param === 'diameterFrom'
    ) {
      if (this.activeParams[param] && !value) {
        delete this.activeParams[param];
      } else {
        this.activeParams[param] = value;
      }
      this.activeParams.page = 1;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams,
      });
    }
  }
}
