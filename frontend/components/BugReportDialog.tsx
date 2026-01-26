'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bug, AlertCircle, CheckCircle2, Loader2, FileText, UploadCloud } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import supabase from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface BugReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BugReportDialog({ open, onOpenChange }: BugReportDialogProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description) return;

        setIsSubmitting(true);
        setStatus('idle');

        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            let attachmentUrl = '';

            // Handle File Upload
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${user?.id || 'anon'}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('bug-reports')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('bug-reports')
                    .getPublicUrl(filePath);

                attachmentUrl = publicUrl;
            }

            // Submit Report
            const response = await fetch(`${API_URL}/api/bugs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    priority,
                    screenshot_url: attachmentUrl // Reusing the column for PDF URL
                })
            });

            if (!response.ok) throw new Error('Failed to submit report');

            setStatus('success');
            setTimeout(() => {
                onOpenChange(false);
                setStatus('idle');
                setTitle('');
                setDescription('');
                setPriority('Medium');
                setFile(null);
            }, 2000);

        } catch (error) {
            console.error('Error submitting bug:', error);
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <Bug className="w-5 h-5 text-rose-500" />
                        Report a Bug
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                        Found an issue? Upload a PDF report or describe it below.
                    </DialogDescription>
                </DialogHeader>

                {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Report Submitted!</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Thanks for helping us improve HackHub.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Issue Title</Label>
                            <Input
                                id="title"
                                placeholder="E.g., Login page alignment issue"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                >
                                    <option value="Low">Low (Visual glitch)</option>
                                    <option value="Medium">Medium (Feature broken)</option>
                                    <option value="High">High (Critical crash)</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="file">Attachment (PDF)</Label>
                                <div className="relative">
                                    <label
                                        htmlFor="file"
                                        className="flex h-9 w-full cursor-pointer items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-800/50"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            {file ? <FileText className="h-4 w-4 shrink-0 text-indigo-500" /> : <UploadCloud className="h-4 w-4 shrink-0 text-zinc-400" />}
                                            <span className={`truncate ${file ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                                                {file ? file.name : 'Click to upload PDF'}
                                            </span>
                                        </div>
                                        <input
                                            id="file"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what happened and how to reproduce it..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[120px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 resize-none"
                            />
                        </div>

                        {status === 'error' && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                Something went wrong. Please try again.
                            </div>
                        )}
                    </div>
                )}

                {status !== 'success' && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!title || !description || isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Report'
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
