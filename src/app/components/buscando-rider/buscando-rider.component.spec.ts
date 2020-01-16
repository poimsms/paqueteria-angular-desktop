import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscandoRiderComponent } from './buscando-rider.component';

describe('BuscandoRiderComponent', () => {
  let component: BuscandoRiderComponent;
  let fixture: ComponentFixture<BuscandoRiderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscandoRiderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscandoRiderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
