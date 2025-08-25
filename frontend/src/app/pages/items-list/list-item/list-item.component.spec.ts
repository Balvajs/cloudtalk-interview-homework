import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseItem } from '../../../core/models/warehouseItem';

import { ListItemComponent } from './list-item.component';

describe('ListItemComponent', () => {
  let component: ListItemComponent;
  let fixture: ComponentFixture<ListItemComponent>;

  const mockItem: WarehouseItem = {
    id: 1,
    name: 'Test Item',
    quantity: 10,
    unitPrice: 29.99,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListItemComponent);
    component = fixture.componentInstance;
    component.item = mockItem; // Provide the required input
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
