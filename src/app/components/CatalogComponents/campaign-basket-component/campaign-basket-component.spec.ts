import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignBasketComponent } from './campaign-basket-component';

describe('CampaignBasketComponent', () => {
  let component: CampaignBasketComponent;
  let fixture: ComponentFixture<CampaignBasketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignBasketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
