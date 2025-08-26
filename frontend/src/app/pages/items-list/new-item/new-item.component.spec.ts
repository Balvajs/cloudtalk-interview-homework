import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { Product } from '../products';
import { ProductsService } from '../products.service';

import { NewItemComponent } from './new-item.component';

describe('NewItemComponent', () => {
  let component: NewItemComponent;
  let fixture: ComponentFixture<NewItemComponent>;
  let mockProductsService: jasmine.SpyObj<ProductsService>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    quantity: 10,
    price: 99.99,
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductsService', ['createProduct']);

    await TestBed.configureTestingModule({
      imports: [NewItemComponent, ReactiveFormsModule],
      providers: [{ provide: ProductsService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NewItemComponent);
    component = fixture.componentInstance;
    mockProductsService = TestBed.inject(
      ProductsService,
    ) as jasmine.SpyObj<ProductsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.productForm.get('name')?.value).toBe('');
    expect(component.productForm.get('quantity')?.value).toBe(1);
    expect(component.productForm.get('price')?.value).toBe(0);
  });

  it('should validate required fields', () => {
    const nameControl = component.productForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();

    expect(nameControl?.invalid).toBeTruthy();
    expect(nameControl?.errors?.['required']).toBeTruthy();
  });

  it('should validate minimum values for quantity and price', () => {
    const quantityControl = component.productForm.get('quantity');
    const priceControl = component.productForm.get('price');

    quantityControl?.setValue(-1);
    priceControl?.setValue(-1);

    expect(quantityControl?.invalid).toBeTruthy();
    expect(priceControl?.invalid).toBeTruthy();
  });

  it('should submit valid form and emit productCreated', () => {
    mockProductsService.createProduct.and.returnValue(of(mockProduct));

    spyOn(component.productCreated, 'emit');
    spyOn(component, 'onCancel');

    component.productForm.patchValue({
      name: 'Test Product',
      quantity: 10,
      price: 99.99,
    });

    component.onSubmit();

    expect(mockProductsService.createProduct).toHaveBeenCalledWith({
      name: 'Test Product',
      quantity: 10,
      price: 99.99,
    });
    expect(component.productCreated.emit).toHaveBeenCalledWith(mockProduct);
    expect(component.onCancel).toHaveBeenCalled();
  });

  it('should handle error during product creation', () => {
    mockProductsService.createProduct.and.returnValue(
      throwError(() => new Error('API Error')),
    );
    spyOn(console, 'error');

    component.productForm.patchValue({
      name: 'Test Product',
      quantity: 10,
      price: 99.99,
    });

    component.onSubmit();

    expect(console.error).toHaveBeenCalledWith(
      'Error creating product:',
      jasmine.any(Error),
    );
    expect(component.isSubmitting()).toBeFalsy();
  });

  it('should not submit invalid form', () => {
    component.productForm.patchValue({
      name: '', // Invalid - required field
      quantity: 10,
      price: 99.99,
    });

    component.onSubmit();

    expect(mockProductsService.createProduct).not.toHaveBeenCalled();
  });

  it('should reset form and emit formClosed on cancel', () => {
    spyOn(component.formClosed, 'emit');

    component.productForm.patchValue({
      name: 'Test Product',
      quantity: 10,
      price: 99.99,
    });

    component.onCancel();

    expect(component.productForm.get('name')?.value).toBe('');
    expect(component.productForm.get('quantity')?.value).toBe(1);
    expect(component.productForm.get('price')?.value).toBe(0);
    expect(component.formClosed.emit).toHaveBeenCalled();
  });

  it('should return correct form validity', () => {
    // Invalid form
    component.productForm.patchValue({
      name: '',
      quantity: -1,
      price: -1,
    });
    expect(component.isFormValid).toBeFalsy();

    // Valid form
    component.productForm.patchValue({
      name: 'Test Product',
      quantity: 10,
      price: 99.99,
    });
    expect(component.isFormValid).toBeTruthy();
  });
});
