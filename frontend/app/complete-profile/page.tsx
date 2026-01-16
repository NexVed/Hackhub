'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, uploadAvatar } from '@/lib/profileService';
import {
    Loader2, User, Building, GraduationCap, Github, Linkedin,
    ArrowRight, Sparkles, Code2, Rocket, Smartphone, AtSign, Camera, Type, LucideIcon
} from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from '../components/ThemeToggle';

// ============================================
// InputField Component
// ============================================
interface InputFieldProps {
    name: string;
    label: string;
    icon: LucideIcon;
    type?: string;
    placeholder: string;
    options?: string[];
    value: string;
    focusedField: string | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    required?: boolean;
}

function InputField({
    name, label, icon: Icon, type = "text", placeholder, options,
    value, focusedField, onChange, onFocus, onBlur, required = true
}: InputFieldProps) {
    const isFocusedOrFilled = focusedField === name || value;

    return (
        <div className="relative group">
            <label
                htmlFor={name}
                className={`absolute left-10 transition-all duration-200 pointer-events-none z-10
                    ${isFocusedOrFilled
                        ? '-top-2.5 text-xs text-emerald-500 dark:text-emerald-400 bg-background px-1'
                        : 'top-3.5 text-sm text-muted-foreground'}`}
            >
                {label}
            </label>
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200
                ${focusedField === name ? 'text-emerald-500 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                <Icon className="h-4 w-4" />
            </div>

            {options ? (
                <select
                    name={name}
                    id={name}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-input rounded-xl leading-5 bg-secondary/50 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 sm:text-sm transition-all shadow-inner"
                >
                    <option value="" disabled className="text-muted-foreground"></option>
                    {options.map(opt => <option key={opt} value={opt} className="bg-background text-foreground">{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    id={name}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className="block w-full pl-10 pr-3 py-3 border border-input rounded-xl leading-5 bg-secondary/50 text-foreground placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 sm:text-sm transition-all shadow-inner"
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}

// ============================================
// Main Page Component
// ============================================
export default function CompleteProfilePage() {
    const { user, profile, refreshProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        mobile: '',
        gender: '',
        institute: '',
        course: '',
        year: '',
        social_linkedin: '',
        social_github: '',
        headline: '',
        avatar_url: ''
    });

    const courseOptions = [
        "B.Tech", "B.E.", "BCA", "MCA", "M.Tech", "BSc", "MSc", "MBA", "BBA", "B.Com", "BA", "PhD", "Diploma", "Other"
    ];

    const yearOptions = [
        "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduated"
    ];

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                name: profile.name || '',
                username: profile.username || '',
                mobile: profile.mobile || '',
                gender: profile.gender || '',
                institute: profile.institute || '',
                course: profile.course || '',
                year: profile.year || '',
                social_linkedin: profile.social_linkedin || '',
                social_github: profile.social_github || '',
                headline: profile.headline || '',
                avatar_url: profile.avatar_url || ''
            }));

            if (profile.avatar_url) {
                setAvatarPreview(profile.avatar_url);
            }

            if (profile.is_profile_completed) {
                router.push('/discover');
            }
        }
    }, [profile, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🚀 handleSubmit triggered');

        if (!user) {
            console.error('❌ No user found');
            alert('No user found. Please log in again.');
            return;
        }

        setLoading(true);
        console.log('📝 Form data:', formData);

        try {
            // Validation
            if (!formData.username || !formData.name || !formData.mobile || !formData.institute || !formData.course) {
                alert('Please fill in all required fields');
                setLoading(false);
                return;
            }

            let avatarUrl = formData.avatar_url;

            // Upload avatar if changed
            if (avatarFile) {
                console.log('📷 Uploading avatar...');
                const uploadedUrl = await uploadAvatar(user.id, avatarFile);
                if (uploadedUrl) {
                    avatarUrl = uploadedUrl;
                    console.log('✅ Avatar uploaded:', uploadedUrl);
                } else {
                    console.warn('⚠️ Avatar upload failed, continuing without');
                }
            }

            console.log('💾 Saving profile to Supabase...');

            const { success, error } = await updateUserProfile(user.id, {
                ...formData,
                avatar_url: avatarUrl,
                is_profile_completed: true
            });

            console.log('📊 Supabase response:', { success, error });

            if (success) {
                console.log('✅ Profile saved successfully!');

                // Refresh profile in context (don't await to avoid blocking)
                refreshProfile().catch(err => console.warn('Profile refresh warning:', err));

                // Use window.location for guaranteed redirect
                console.log('🔄 Redirecting to /discover...');
                router.push('/discover');
            } else {
                console.error('❌ Failed to update profile:', error);
                if (error?.code === '23505' || error?.message?.includes('username')) {
                    alert('Username is already taken. Please choose another one.');
                } else {
                    alert(`Failed to save profile: ${error?.message || 'Unknown error'}`);
                }
                setLoading(false);
            }
        } catch (error: any) {
            console.error('💥 Error in handleSubmit:', error);
            alert(`An error occurred: ${error?.message || 'Unknown error'}`);
            setLoading(false);
        }
    };

    // Helper to create props for InputField
    const fieldProps = (name: keyof typeof formData, required = true) => ({
        value: formData[name],
        focusedField,
        onChange: handleChange,
        onFocus: () => setFocusedField(name),
        onBlur: () => setFocusedField(null),
        required
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 dark:bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 dark:bg-blue-900/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-4xl relative z-10">
                <div className="bg-card/40 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                    {/* Left Panel: Welcome/Art - Keeping dark for emphasis */}
                    <div className="w-full md:w-1/3 bg-zinc-900 text-white p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="relative z-10">
                            <div className="h-12 w-12 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 mb-6">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Welcome to HackHub</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Join the elite community of builders, hackers, and innovators. Let's start by forging your identity.
                            </p>
                        </div>

                        <div className="relative z-10 mt-12 md:mt-0 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                <Code2 className="w-4 h-4 text-emerald-500" />
                                <span>Showcase your skills</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                <Rocket className="w-4 h-4 text-blue-500" />
                                <span>Join dream teams</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                <Smartphone className="w-4 h-4 text-purple-500" />
                                <span>Track your progress</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="w-full md:w-2/3 p-8 bg-card/60">
                        <div className="mb-6 flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-foreground">Complete Profile</h3>
                                <p className="text-muted-foreground text-sm">Fill in your details to unlock full access.</p>
                            </div>

                            {/* Theme Toggle & Avatar Upload Group */}
                            <div className="flex items-center gap-4">
                                <div className="scale-90">
                                    <ThemeToggle />
                                </div>

                                <div className="relative group">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary border-2 border-border group-hover:border-emerald-500 transition-colors">
                                        {avatarPreview ? (
                                            <Image
                                                src={avatarPreview}
                                                alt="Avatar"
                                                width={56}
                                                height={56}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 p-1 bg-emerald-600 rounded-full cursor-pointer hover:bg-emerald-500 transition-colors shadow-lg"
                                    >
                                        <Camera className="w-3 h-3 text-white" />
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-6">

                            {/* Personal Details Section */}
                            <div className="space-y-4">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Personal</div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        name="name"
                                        label="Full Name"
                                        icon={Type}
                                        placeholder="John Doe"
                                        {...fieldProps('name')}
                                    />
                                    <InputField
                                        name="username"
                                        label="Username"
                                        icon={AtSign}
                                        placeholder="unique_handle"
                                        {...fieldProps('username')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        name="gender"
                                        label="Gender"
                                        icon={User}
                                        placeholder="Select Gender"
                                        options={["Male", "Female", "Non-binary", "Prefer not to say"]}
                                        {...fieldProps('gender')}
                                    />
                                    <InputField
                                        name="mobile"
                                        label="Mobile Number"
                                        icon={Smartphone}
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        {...fieldProps('mobile')}
                                    />
                                </div>
                                <InputField
                                    name="headline"
                                    label="Headline / Tagline"
                                    icon={Code2}
                                    placeholder="e.g. Full Stack Wizard"
                                    {...fieldProps('headline', false)}
                                />
                            </div>

                            {/* Education Section */}
                            <div className="space-y-4">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Education</div>
                                <InputField
                                    name="institute"
                                    label="Institute Name"
                                    icon={Building}
                                    placeholder="Your University / College"
                                    {...fieldProps('institute')}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        name="course"
                                        label="Course"
                                        icon={GraduationCap}
                                        placeholder="Select Course"
                                        options={courseOptions}
                                        {...fieldProps('course')}
                                    />
                                    <InputField
                                        name="year"
                                        label="Current Year"
                                        icon={GraduationCap}
                                        placeholder="Select Year"
                                        options={yearOptions}
                                        {...fieldProps('year')}
                                    />
                                </div>
                            </div>

                            {/* Socials Section */}
                            <div className="space-y-4">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Social Presence</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        name="social_linkedin"
                                        label="LinkedIn URL"
                                        icon={Linkedin}
                                        type="url"
                                        placeholder="https://linkedin.com/in/..."
                                        {...fieldProps('social_linkedin', false)}
                                    />
                                    <InputField
                                        name="social_github"
                                        label="GitHub URL"
                                        icon={Github}
                                        type="url"
                                        placeholder="https://github.com/..."
                                        {...fieldProps('social_github', false)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full" />
                                    <div className="flex items-center justify-center gap-2 relative z-10">
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Save & Launch</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer / Decorative */}
                <div className="mt-8 text-center text-muted-foreground text-xs">
                    <p>Protected by secure encryption. Your data belongs to you.</p>
                </div>
            </div>
        </div>
    );
}
