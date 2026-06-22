import { useState } from 'react';
import type { ProductFormData, FormErrors, FormState, CreateProductRequest } from '../types/api';

interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => string | undefined;
}

const productValidationRules: ValidationRule<ProductFormData>[] = [
  {
    field: 'name',
    validator: (value: string) => {
      if (!value?.trim()) return 'Product name is required';
      if (value.trim().length < 3) return 'Product name must be at least 3 characters';
      if (value.trim().length > 100) return 'Product name must be less than 100 characters';
      return undefined;
    }
  },
  {
    field: 'price',
    validator: (value: string) => {
      if (!value?.trim()) return 'Price is required';
      const numPrice = parseFloat(value);
      if (isNaN(numPrice)) return 'Price must be a valid number';
      if (numPrice <= 0) return 'Price must be greater than 0';
      if (numPrice > 1000000000) return 'Price is too high';
      return undefined;
    }
  },
  {
    field: 'description',
    validator: (value: string) => {
      if (!value?.trim()) return 'Description is required';
      if (value.trim().length < 10) return 'Description must be at least 10 characters';
      return undefined;
    }
  },
  {
    field: 'category',
    validator: (value: string) => {
      if (!value?.trim()) return 'Category is required';
      return undefined;
    }
  }
];

const validateForm = <T>(data: T, rules: ValidationRule<T>[]): FormErrors => {
  const errors: FormErrors = {};

  for (const rule of rules) {
    const value = data[rule.field];
    const error = rule.validator(value);
    if (error) {
      errors[rule.field as keyof FormErrors] = error;
    }
  }

  return errors;
};

export const useProductForm = (initialData?: ProductFormData) => {
  const defaultData = {
    name: '',
    price: '',
    description: '',
    category: ''
  };

  const formData = initialData || defaultData;
  const initialErrors = validateForm(formData, productValidationRules);
  const initialIsValid = Object.keys(initialErrors).length === 0;

  const [formState, setFormState] = useState<FormState<ProductFormData>>({
    data: formData,
    errors: {},
    isSubmitting: false,
    isValid: initialIsValid
  });

  const updateField = (field: keyof ProductFormData, value: string) => {
    setFormState(prev => {
      const newData = { ...prev.data, [field]: value };
      const errors = validateForm(newData, productValidationRules);
      const isValid = Object.keys(errors).length === 0;

      return {
        ...prev,
        data: newData,
        errors: { ...prev.errors, [field]: undefined }, // Clear field error when user types
        isValid
      };
    });
  };

  const transformToApiPayload = (formData: ProductFormData): CreateProductRequest => {
    return {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      category: formData.category.trim()
    };
  };

  const validateForm_ = (): boolean => {
    const errors = validateForm(formState.data, productValidationRules);
    const isValid = Object.keys(errors).length === 0;

    setFormState(prev => ({
      ...prev,
      errors,
      isValid
    }));

    return isValid;
  };

  const setSubmitting = (isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }));
  };

  const setError = (error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, general: error }
    }));
  };

  const reset = () => {
    setFormState({
      data: {
        name: '',
        price: '',
        description: '',
        category: ''
      },
      errors: {},
      isSubmitting: false,
      isValid: false
    });
  };

  return {
    formState,
    updateField,
    transformToApiPayload,
    validate: validateForm_,
    setSubmitting,
    setError,
    reset
  };
};