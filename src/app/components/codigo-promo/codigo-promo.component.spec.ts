import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodigoPromoComponent } from './codigo-promo.component';

describe('CodigoPromoComponent', () => {
  let component: CodigoPromoComponent;
  let fixture: ComponentFixture<CodigoPromoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodigoPromoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodigoPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
