import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader, Logo } from '@/components/layout';
import { LogoUploadCard } from '@/features/admin-settings';
import { useLogoSettings } from '@/features/admin-settings';

const AdminLogoPreview = ({ logo }: { logo: string | null }) => {
  if (logo) {
    return (
      <img
        src={logo}
        alt="Admin Logo"
        className="h-8 object-contain"
      />
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
        <span className="text-white font-bold text-sm">A</span>
      </div>
      <span className="font-semibold text-foreground">Admin Panel</span>
    </div>
  );
};

const AdminSettings = () => {
  const {
    logoPreview,
    adminLogoPreview,
    isUploading,
    handleLogoFileChange,
    handleAdminLogoFileChange,
    saveLogo,
    removeLogo,
    saveAdminLogo,
    removeAdminLogo,
    cancelLogoPreview,
    cancelAdminLogoPreview,
  } = useLogoSettings();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader title="Configuración" />
          <main className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <LogoUploadCard
                title="Logo de la Tienda"
                description="Personaliza el logo que aparece en tu tienda online"
                currentLogo={<Logo variant="default" />}
                preview={logoPreview}
                isUploading={isUploading}
                onFileChange={handleLogoFileChange}
                onSave={saveLogo}
                onRemove={removeLogo}
                onCancelPreview={cancelLogoPreview}
              />
              
              <LogoUploadCard
                title="Logo del Sidebar Admin"
                description="Personaliza el logo que aparece en el sidebar del panel de administración"
                currentLogo={<AdminLogoPreview logo={adminLogoPreview} />}
                preview={adminLogoPreview}
                isUploading={isUploading}
                onFileChange={handleAdminLogoFileChange}
                onSave={saveAdminLogo}
                onRemove={removeAdminLogo}
                onCancelPreview={cancelAdminLogoPreview}
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminSettings;
