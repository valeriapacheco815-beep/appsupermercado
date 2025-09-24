import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarnesPage } from './carnes.page';

describe('CarnesPage', () => {
  let component: CarnesPage;
  let fixture: ComponentFixture<CarnesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarnesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
