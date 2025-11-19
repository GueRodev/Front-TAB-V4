import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Edit2, LogOut } from 'lucide-react';
import { Header, Footer, DecorativeBackground } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/features/admin-profile';
import { AddressList } from '@/features/addresses';
import { useAccountPage } from '@/features/auth';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    isClient,
    isEditing,
    handleEdit,
    handleCancel,
    handleSave,
    handleLogout,
  } = useAccountPage();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Acceso Requerido</CardTitle>
              <CardDescription>
                Debes iniciar sesión para ver tu perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero-style background section */}
      <section className="pt-24 md:pt-32 pb-8 bg-gradient-to-b from-brand-yellow to-white relative overflow-hidden">
        <DecorativeBackground />
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-brand-darkBlue text-white py-3 px-6 rounded-lg inline-block mb-6">
            <div className="flex items-center gap-2 text-sm uppercase font-semibold">
              <Link to="/" className="hover:text-brand-orange transition-colors">
                INICIO
              </Link>
              <span>/</span>
              <span>MI PERFIL</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-brand-orange rounded-full flex items-center justify-center text-white">
                  <User size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-brand-darkBlue">
                    Mi Perfil
                  </h1>
                  <p className="text-gray-600">Administra tu información personal</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing && (
                  <Button
                    onClick={handleEdit}
                    className="bg-brand-darkBlue hover:bg-brand-orange"
                  >
                    <Edit2 className="mr-2" size={18} />
                    Editar Perfil
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="mr-2" size={18} />
                  Cerrar Sesión
                </Button>
              </div>
            </div>

            {/* Profile Form */}
            <ProfileForm
              defaultValues={{
                name: user.name,
                email: user.email,
              }}
              onSubmit={handleSave}
              onCancel={handleCancel}
              isEditing={isEditing}
            />

            {/* Address Management Section - Only for clients */}
            {isClient() && (
              <div className="mt-8">
                <Separator className="mb-8" />
                <AddressList />
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Account;
