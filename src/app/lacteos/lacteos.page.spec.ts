import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LacteosPage } from './lacteos.page';

describe('LacteosPage', () => {
  let component: LacteosPage;
  let fixture: ComponentFixture<LacteosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LacteosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
