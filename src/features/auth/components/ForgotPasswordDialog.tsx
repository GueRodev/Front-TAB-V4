/**
 * Forgot Password Dialog Component
 * Two-step password recovery with email and verification code
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { forgotPasswordSchema, verificationCodeSchema } from '../validations';
import { toast } from '@/hooks/use-toast';
import { Mail, Shield } from 'lucide-react';

type Step = 'email' | 'verification';

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string, code?: string) => Promise<void>;
}

export const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mask email for display (e.g., "gue••••@gmail.com")
  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.slice(0, 3) + '••••';
    return `${maskedLocal}@${domain}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Validate email
    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setEmailError(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email);
      // Move to verification step after successful email submission
      setStep('verification');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al procesar tu solicitud',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    // Validate code
    const validation = verificationCodeSchema.safeParse({ code });
    if (!validation.success) {
      setCodeError(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email, code);
      handleClose();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Código de verificación inválido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(email);
      toast({
        title: 'Código reenviado',
        description: `Enviamos un nuevo código a ${maskEmail(email)}`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo reenviar el código',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setEmailError('');
    setCodeError('');
    onClose();
  };

  const handleBack = () => {
    setStep('email');
    setCode('');
    setCodeError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {step === 'email' ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            )}
            <DialogTitle>
              {step === 'email' ? 'Recuperar Contraseña' : 'Verificar tu identidad'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {step === 'email'
              ? 'Para proteger tu cuenta, te enviaremos un código de verificación para confirmar tu identidad.'
              : `Ingresa el código de 6 dígitos que enviamos a: ${maskEmail(email)}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Código'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label htmlFor="code" className="text-center block">
                  Código de Verificación
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => {
                      setCode(value);
                      setCodeError('');
                    }}
                    disabled={isSubmitting}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {codeError && (
                  <p className="text-sm text-destructive text-center">{codeError}</p>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                ¿No recibiste el código?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                >
                  Reenviar código
                </Button>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Volver
              </Button>
              <Button type="submit" disabled={isSubmitting || code.length !== 6}>
                {isSubmitting ? 'Verificando...' : 'Verificar Código'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
