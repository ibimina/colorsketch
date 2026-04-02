"use client";

import { Card, Button } from "@/components/ui";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useToastStore } from "@/stores/toastStore";
import { useProgressStore } from "@/stores/progressStore";
import { provideFeedback } from "@/lib/feedback";

export default function SettingsPage() {
    const {
        autoSave,
        soundEffects,
        hapticFeedback,
        setAutoSave,
        setSoundEffects,
        setHapticFeedback,
    } = usePreferencesStore();

    const { addToast } = useToastStore();
    const { level, xp, totalSketches } = useProgressStore();

    const handleExportData = () => {
        addToast('Export feature coming soon!', 'info');
    };

    const handleClearData = () => {
        if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
            try {
                localStorage.clear();
                addToast('Local data cleared successfully', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error('Clear data error:', error);
                addToast('Failed to clear data', 'error');
            }
        }
    };

    const handleDeleteAccount = () => {
        addToast('Account management coming soon', 'info');
    };
    return (
        <div className="max-w-2xl space-y-6 pb-20 lg:pb-0">
            <div>
                <h1 className="text-2xl sm:text-3xl font-headline font-bold">Settings</h1>
                <p className="text-on-surface-variant mt-1">
                    Customize your ColorSketch experience
                </p>
            </div>

            {/* Account Section */}
            <Card variant="elevated">
                <h2 className="font-headline font-bold text-lg mb-4">Account</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Level Progress</p>
                            <p className="text-sm text-on-surface-variant">
                                Level {level} • {xp} XP • {totalSketches} sketches
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-on-surface-variant">user@example.com</p>
                        </div>
                        <Button variant="ghost" size="sm" disabled>Change</Button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-on-surface-variant">••••••••</p>
                        </div>
                        <Button variant="ghost" size="sm" disabled>Update</Button>
                    </div>
                </div>
            </Card>

            {/* Preferences Section */}
            <Card variant="elevated">
                <h2 className="font-headline font-bold text-lg mb-4">Preferences</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Auto-save</p>
                            <p className="text-sm text-on-surface-variant">Save progress automatically</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoSave}
                                onChange={(e) => {
                                    setAutoSave(e.target.checked);
                                    addToast(
                                        e.target.checked ? 'Auto-save enabled' : 'Auto-save disabled',
                                        'success'
                                    );
                                    provideFeedback({
                                        haptic: hapticFeedback,
                                        hapticType: 'light',
                                        sound: soundEffects,
                                        soundName: 'click',
                                    });
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Sound effects</p>
                            <p className="text-sm text-on-surface-variant">Play sounds when coloring</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={soundEffects}
                                onChange={(e) => {
                                    setSoundEffects(e.target.checked);
                                    addToast(
                                        e.target.checked ? '🔊 Sound effects enabled' : '🔇 Sound effects disabled',
                                        'success'
                                    );
                                    provideFeedback({
                                        haptic: hapticFeedback,
                                        hapticType: 'light',
                                        sound: e.target.checked, // Use new setting value
                                        soundName: 'click',
                                    });
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Haptic feedback</p>
                            <p className="text-sm text-on-surface-variant">Vibrate when filling regions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hapticFeedback}
                                onChange={(e) => {
                                    setHapticFeedback(e.target.checked);
                                    addToast(
                                        e.target.checked ? '📳 Haptic feedback enabled' : 'Haptic feedback disabled',
                                        'success'
                                    );
                                    // Provide immediate feedback with new setting
                                    provideFeedback({
                                        haptic: e.target.checked, // Use new setting value
                                        hapticType: 'medium',
                                        sound: soundEffects,
                                        soundName: 'click',
                                    });
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Data Section */}
            <Card variant="elevated">
                <h2 className="font-headline font-bold text-lg mb-4">Data</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Export all artworks</p>
                            <p className="text-sm text-on-surface-variant">Download all your creations as a ZIP</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleExportData}>
                            Export
                        </Button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Clear local data</p>
                            <p className="text-sm text-on-surface-variant">Remove cached data from this device</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-error"
                            onClick={handleClearData}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card variant="elevated" className="border-2 border-error/20">
                <h2 className="font-headline font-bold text-lg mb-4 text-error">Danger Zone</h2>
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-medium">Delete account</p>
                        <p className="text-sm text-on-surface-variant">Permanently delete your account and all data</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10"
                        onClick={handleDeleteAccount}
                        disabled
                    >
                        Delete Account
                    </Button>
                </div>
            </Card>
        </div>
    );
}
