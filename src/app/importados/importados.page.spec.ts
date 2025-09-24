import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportadosPage } from './importados.page';

describe('ImportadosPage', () => {
  let component: ImportadosPage;
  let fixture: ComponentFixture<ImportadosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
