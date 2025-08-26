import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Product } from '../products';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-new-item',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-item.component.html',
  styleUrls: ['./new-item.component.scss'],
})
export class NewItemComponent {
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);

  @Output() productCreated = new EventEmitter<Product>();
  @Output() formClosed = new EventEmitter<void>();

  isSubmitting = signal(false);

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    quantity: [1, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formValue = this.productForm.value;

      if (
        !formValue.name ||
        typeof formValue.quantity !== 'number' ||
        typeof formValue.price !== 'number'
      ) {
        this.isSubmitting.set(false);
        return;
      }

      const product: Omit<Product, 'id'> = {
        name: formValue.name,
        quantity: formValue.quantity,
        price: formValue.price,
      };

      this.productsService.createProduct(product).subscribe({
        next: (createdProduct) => {
          this.productCreated.emit(createdProduct);
          this.onCancel();
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.isSubmitting.set(false);
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this.productForm.reset({
      name: '',
      quantity: 1,
      price: 0,
    });
    this.formClosed.emit();
  }

  get isFormValid(): boolean {
    return this.productForm.valid;
  }
}
