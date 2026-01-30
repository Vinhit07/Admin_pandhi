// Admin SignUp Page (TypeScript)
// Admin registration with verification pending notice

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { API_ENDPOINTS } from '../../lib/constants';
import toast from 'react-hot-toast';

const AdminSignUp: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Call signup endpoint directly (not through authService as user isn't authenticated)
            await apiRequest(API_ENDPOINTS.ADMIN_SIGN_UP || '/auth/admin-signup', {
                method: 'POST',
                body: {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone || undefined,
                },
            });

            toast.success('Registration successful! Please wait for SuperAdmin verification.');
            navigate('/admin-signin');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserPlus className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4">Join Our Team</h1>
                    <p className="text-lg text-muted-foreground">
                        Create your admin account to manage HungerBox outlets and operations.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">HungerBox Admin</h1>
                    </div>

                    <div className="bg-card rounded-xl border-2 border-border p-8 shadow-lg">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Create Admin Account</h2>
                            <p className="text-muted-foreground mt-1">Fill in your details to get started</p>
                        </div>

                        {/* Verification Notice */}
                        <div className="mb-6 p-4 bg-accent/50 border border-border rounded-lg">
                            <div className="flex gap-2">
                                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Verification Required</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your account will be pending until verified by a SuperAdmin. You'll receive
                                        confirmation once approved.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className={`w-full px-4 py-2 bg-background rounded-lg border-2 ${formErrors.name ? 'border-destructive' : 'border-border'
                                        } focus:outline-none focus:ring-2 focus:ring-ring transition`}
                                />
                                {formErrors.name && (
                                    <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
                                )}
                            </div>

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
                                    placeholder="admin@example.com"
                                    className={`w-full px-4 py-2 bg-background rounded-lg border-2 ${formErrors.email ? 'border-destructive' : 'border-border'
                                        } focus:outline-none focus:ring-2 focus:ring-ring transition`}
                                />
                                {formErrors.email && (
                                    <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                                    Phone Number <span className="text-muted-foreground">(Optional)</span>
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className={`w-full px-4 py-2 bg-background rounded-lg border-2 ${formErrors.phone ? 'border-destructive' : 'border-border'
                                        } focus:outline-none focus:ring-2 focus:ring-ring transition`}
                                />
                                {formErrors.phone && (
                                    <p className="text-sm text-destructive mt-1">{formErrors.phone}</p>
                                )}
                            </div>

                            <div className="relative">
                                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2 bg-background rounded-lg border-2 ${formErrors.password ? 'border-destructive' : 'border-border'
                                        } focus:outline-none focus:ring-2 focus:ring-ring transition`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                {formErrors.password && (
                                    <p className="text-sm text-destructive mt-1">{formErrors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2 bg-background rounded-lg border-2 ${formErrors.confirmPassword ? 'border-destructive' : 'border-border'
                                        } focus:outline-none focus:ring-2 focus:ring-ring transition`}
                                />
                                {formErrors.confirmPassword && (
                                    <p className="text-sm text-destructive mt-1">{formErrors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Create Admin Account
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/admin-signin" className="text-primary font-medium hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignUp;
