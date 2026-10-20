import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/**
 * Marca visualmente obligatorio ("*" rojo) vs opcional ("(opcional)" gris) a
 * partir del prop `required` que YA le pasa cada formulario — así el usuario
 * ve de entrada qué campos necesita completar, sin tener que llegar al error
 * de validación para enterarse. Como todos los formularios de la app usan
 * este mismo componente, este cambio se propaga solo a todos lados.
 */
export const Input = forwardRef<HTMLInputElement, Props>(({ label, className = '', required, ...props }, ref) => (
  <label className="flex flex-col gap-1 text-sm text-gray-700 text-left">
    {label && (
      <span className="font-medium">
        {label}
        {required ? (
          <span className="text-red-500"> *</span>
        ) : (
          <span className="text-gray-400 font-normal"> (opcional)</span>
        )}
      </span>
    )}
    <input
      ref={ref}
      required={required}
      className={`px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  </label>
));
Input.displayName = 'Input';
