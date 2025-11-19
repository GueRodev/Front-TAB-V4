import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/layout';
import { useAuthForm, LoginForm, RegisterForm, ForgotPasswordDialog } from '@/features/auth';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const {
    loginForm,
    registerForm,
    handleLogin,
    handleRegister,
    showForgotPassword,
    handleForgotPassword,
    handleCloseForgotPassword,
    handleForgotPasswordSubmit,
    isLoading,
  } = useAuthForm();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold text-brand-darkBlue">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-base">
              Inicia sesión o crea una cuenta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              {/* Tab de Login */}
              <TabsContent value="login">
                <LoginForm
                  form={loginForm}
                  onSubmit={handleLogin}
                  onForgotPassword={handleForgotPassword}
                  isLoading={isLoading}
                />
              </TabsContent>

              {/* Tab de Register */}
              <TabsContent value="register">
                <RegisterForm
                  form={registerForm}
                  onSubmit={handleRegister}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={showForgotPassword}
        onClose={handleCloseForgotPassword}
        onSubmit={handleForgotPasswordSubmit}
      />

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-600">
        <p>© 2024 Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Auth;
