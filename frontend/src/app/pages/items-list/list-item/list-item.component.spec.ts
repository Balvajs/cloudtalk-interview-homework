import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Product } from '../../../core/models/products';

import { ListItemComponent } from './list-item.component';

describe('ListItemComponent', () => {
  let component: ListItemComponent;
  let fixture: ComponentFixture<ListItemComponent>;

  const mockItem: Product = {
    id: 1,
    name: 'Test Item',
    quantity: 10,
    price: 29.99,
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

  it('should emit deleteItem event when delete button is clicked', () => {
    spyOn(component.deleteItem, 'emit');

    const deleteButton = fixture.debugElement.query(
      By.css('.list-item--button'),
    );
    deleteButton.nativeElement.click();

    expect(component.deleteItem.emit).toHaveBeenCalledWith(mockItem.id);
  });

  it('should call onDelete when delete button is clicked', () => {
    spyOn(component, 'onDelete');

    const deleteButton = fixture.debugElement.query(
      By.css('.list-item--button'),
    );
    deleteButton.nativeElement.click();

    expect(component.onDelete).toHaveBeenCalled();
  });
});
