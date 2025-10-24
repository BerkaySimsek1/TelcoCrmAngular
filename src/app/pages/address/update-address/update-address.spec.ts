import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAddress } from './update-address';

describe('UpdateAddress', () => {
  let component: UpdateAddress;
  let fixture: ComponentFixture<UpdateAddress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAddress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateAddress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
