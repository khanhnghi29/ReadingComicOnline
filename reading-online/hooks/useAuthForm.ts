import { useState } from 'react';

interface FormErrors {
  [key: string]: string;
}

interface UseAuthFormReturn<T> {
  values: T;
  errors: FormErrors;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
  setError: (field: string, message: string) => void;
  clearErrors: () => void;
}

// Updated constraint để support các DTO interfaces
export function useAuthForm<T extends Record<string, any>>(
  initialValues: T
): UseAuthFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (onSubmit: (values: T) => Promise<void>) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setErrors({});

      try {
        await onSubmit(values);
      } catch (error) {
        if (error instanceof Error) {
          setError('general', error.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  };

  const setError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setError,
    clearErrors,
  };
}

// interface FormErrors {
//   [key: string]: string;
// }

// interface UseAuthFormReturn<T> {
//   values: T;
//   errors: FormErrors;
//   isSubmitting: boolean;
//   handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
//   setError: (field: string, message: string) => void;
//   clearErrors: () => void;
// }

// export function useAuthForm<T extends Record<string, any>>(
//   initialValues: T
// ): UseAuthFormReturn<T> {
//   const [values, setValues] = useState<T>(initialValues);
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setValues(prev => ({ ...prev, [name]: value }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleSubmit = (onSubmit: (values: T) => Promise<void>) => {
//     return async (e: React.FormEvent) => {
//       e.preventDefault();
//       setIsSubmitting(true);
//       setErrors({});

//       try {
//         await onSubmit(values);
//       } catch (error) {
//         if (error instanceof Error) {
//           setError('general', error.message);
//         }
//       } finally {
//         setIsSubmitting(false);
//       }
//     };
//   };

//   const setError = (field: string, message: string) => {
//     setErrors(prev => ({ ...prev, [field]: message }));
//   };

//   const clearErrors = () => {
//     setErrors({});
//   };

//   return {
//     values,
//     errors,
//     isSubmitting,
//     handleChange,
//     handleSubmit,
//     setError,
//     clearErrors,
//   };
// }