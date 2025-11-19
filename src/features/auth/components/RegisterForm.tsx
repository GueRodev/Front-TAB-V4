/**
 * RegisterForm Component
 * Presentational component for registration form with validation
 * 
 * Campos: name, email, password, password_confirmation
 * ⚠️ Nota: Campo 'phone' no es oblitigatorio en el formulario de registro
 * 
 * ✅ Integrado con Laravel backend Bearer Token Authentication
 */

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { RegisterFormData } from '../validations';

interface RegisterFormProps {
  form: UseFormReturn<RegisterFormData>;
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  form,
  onSubmit,
  isLoading,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Juan Pérez"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-brand-orange hover:bg-brand-orange/90"
          disabled={isLoading}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>
    </Form>
  );
};
