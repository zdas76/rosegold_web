import Swal, { SweetAlertOptions } from 'sweetalert2';

/**
 * Reusable SweetAlert2 Utility
 */

export const showErrorAlert = (message: string, title: string = 'Error') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#C58D2F',
  });
};

export const showSuccessAlert = (message: string, title: string = 'Success') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#C58D2F',
  });
};

export const showWarningAlert = (message: string, title: string = 'Warning') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#C58D2F',
  });
};

export const showConfirmAlert = (options?: SweetAlertOptions) => {
  return Swal.fire({
    title: options?.title || 'Are you sure?',
    text: options?.text || "You won't be able to revert this!",
    icon: options?.icon || 'warning',
    showCancelButton: true,
    confirmButtonColor: '#C58D2F',
    cancelButtonColor: '#d33',
    confirmButtonText: options?.confirmButtonText || 'Yes, proceed',
    cancelButtonText: options?.cancelButtonText || 'Cancel',
    ...options,
  });
};

export default {
  error: showErrorAlert,
  success: showSuccessAlert,
  warning: showWarningAlert,
  confirm: showConfirmAlert,
};
