import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckTicket } from './check-ticket';

describe('CheckTicket', () => {
  let component: CheckTicket;
  let fixture: ComponentFixture<CheckTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
