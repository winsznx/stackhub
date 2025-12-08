'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserData } from '@stacks/auth';
import { AppConfig, UserSession } from '@stacks/connect';
import { getUserSession } from '@/lib/stacks-client';
import { useUserStore } from '@/store/useUserStore';
import { fetchBtcName } from '@/lib/stacks';

export function useWallet() {
    const { user, setUser, logout, setBtcName } = useUserStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const userSession = getUserSession();
        if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData();
            if (!user || user.address !== userData.profile.stxAddress.testnet) {
                setUser({
                    address: userData.profile.stxAddress.testnet,
                    stxAddress: userData.profile.stxAddress.testnet,
                    btcName: null,
                    isAuthenticated: true,
                });

                fetchBtcName(userData.profile.stxAddress.testnet, 'testnet').then((name) => {
                    if (name) setBtcName(name);
                });
            }
        }
    }, [user, setUser, setBtcName]);

    const connectWallet = useCallback(async () => {
        const appDetails = {
            name: 'StacksHub',
            icon: typeof window !== 'undefined' ? `${window.location.origin}/logo.svg` : '',
        };

        const userSession = getUserSession();

        try {
            const { authenticate } = await import('@stacks/connect');
            authenticate({
                appDetails,
                userSession,
                manifestPath: '/manifest.json',
                onFinish: () => {
                    const userData = userSession.loadUserData();
                    setUser({
                        address: userData.profile.stxAddress.testnet,
                        stxAddress: userData.profile.stxAddress.testnet,
                        btcName: null,
                        isAuthenticated: true,
                    });

                    fetchBtcName(userData.profile.stxAddress.testnet, 'testnet').then((name) => {
                        if (name) setBtcName(name);
                    });
                },
                onCancel: () => {
                    // User cancelled
                },
            });
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    }, [setUser, setBtcName]);

    const disconnectWallet = useCallback(() => {
        const userSession = getUserSession();
        userSession.signUserOut();
        logout();
    }, [logout]);

    return {
        user,
        connectWallet,
        disconnectWallet,
        isMounted,
    };
}
