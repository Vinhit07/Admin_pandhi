// Admin SignIn Page (TypeScript)
// Handles both Admin and SuperAdmin authentication with toggle

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Shield, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../lib/constants';
import toast from 'react-hot-toast';

const AdminSignIn: React.FC = () => {
    const navigate = useNavigate();
    const { adminSignIn, superAdminSignIn, loading, error, clearError, isAuthenticated } = useAuth();

    const [userType, setUserType] = useState<'admin' | 'superadmin'>('admin');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

    // Redirect if already authenticated
    useEffect(() => {
        // Only redirect if auth check is complete (not loading) and user is authenticated
        if (!loading && isAuthenticated) {
            navigate(ROUTES.DASHBOARD, { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
        if (error) clearError();
    };

    const handleUserTypeChange = (type: 'admin' | 'superadmin') => {
        setUserType(type);
        if (error) clearError();
        setFormErrors({});
    };

    const validateForm = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            if (userType === 'admin') {
                await adminSignIn(formData);
                toast.success('Welcome back, Admin!');
            } else {
                await superAdminSignIn(formData);
                toast.success('Welcome back, SuperAdmin!');
            }
            navigate(ROUTES.DASHBOARD);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign in failed';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4">HungerBox Admin</h1>
                    <p className="text-lg text-muted-foreground">
                        {userType === 'admin'
                            ? 'Manage your outlets, staff, and operations efficiently.'
                            : 'Full system control and oversight for SuperAdmins.'}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">HungerBox Admin</h1>
                    </div>

                    <div className="bg-card rounded-xl border-2 border-border p-8 shadow-lg">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Admin Portal</h2>
                            <p className="text-muted-foreground mt-1">Sign in to your account</p>
                        </div>

                        {/* User Type Toggle */}
                        <div className="mb-6">
                            <div className="flex rounded-lg bg-accent/50 p-1">
                                <button
                                    type="button"
                                    onClick={() => handleUserTypeChange('admin')}
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${userType === 'admin'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <User className="h-4 w-4" />
                                    Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleUserTypeChange('superadmin')}
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${userType === 'superadmin'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Shield className="h-4 w-4" />
                                    SuperAdmin
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={`Enter your ${userType === 'superadmin' ? 'SuperAdmin' : 'Admin'} email`}
                                    className={`w-full px-4 py-2 bg-background rounded-lg border-2 ${formErrors.email ? 'border-destructive' : 'border-border'
                                        } focus:outline-none focus:ring-2 focus:ring-ring transition`}
                                />
                                {formErrors.email && (
                                    <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className={`w-full px-4 py-2 bg-background rounded-lg border-2 ${formErrors.password ? 'border-destructive' : 'border-border'
                                            } focus:outline-none focus:ring-2 focus:ring-ring transition pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {formErrors.password && (
                                    <p className="text-sm text-destructive mt-1">{formErrors.password}</p>
                                )}
                            </div>

                            {error && (
                                <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4" />
                                        Sign in as {userType === 'superadmin' ? 'SuperAdmin' : 'Admin'}
                                    </>
                                )}
                            </button>
                        </form>

                        {userType === 'admin' && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link to="/admin-signup" className="text-primary font-medium hover:underline">
                                        Create Admin Account
                                    </Link>
                                </p>
                            </div>
                        )}

                        {userType === 'superadmin' && (
                            <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                                <p className="text-xs text-muted-foreground text-center">
                                    <Shield className="h-4 w-4 inline mr-1" />
                                    SuperAdmin access is restricted. Contact system administrator.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignIn;
