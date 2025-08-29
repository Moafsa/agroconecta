import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminAPI } from '@/lib/api';
import { Toaster, toast } from 'sonner';
import { User, CreditCard, Save, Loader2 } from 'lucide-react';

// Validation Schema
const profileSchema = z.object({
  nome: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  pix_wallet: z.string().optional().or(z.literal('')),
});

const AdminProfile = () => {
  const { admin, updateAdmin, loading: authLoading } = useAdminAuth();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: '',
      email: '',
      pix_wallet: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = form;

  // Populate form with admin data once available
  useEffect(() => {
    if (admin) {
      reset({
        nome: admin.nome || '',
        email: admin.email || '',
        pix_wallet: admin.pix_wallet || '',
      });
    }
  }, [admin, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await adminAPI.updateProfile(data);
      if (response.admin) {
        updateAdmin(response.admin);
        toast.success(response.message || 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.errors ? 
        Object.values(error.errors).join(', ') : 
        error.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Administrator Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information and payment settings.</p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription>
                    This PIX key will be used to receive payments made through the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="pix_wallet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIX Key</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CPF, CNPJ, email, phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="w-32">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
