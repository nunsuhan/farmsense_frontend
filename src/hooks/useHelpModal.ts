import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useHelpModal = (storageKey: string) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        const checkVisibility = async () => {
            try {
                const hasShown = await AsyncStorage.getItem(storageKey);
                if (!hasShown) {
                    setIsVisible(true);
                    // Mark as shown immediately so it doesn't show again on reload unless explicitly reset? 
                    // Or mark as shown only when closed? better on close.
                }
            } catch (error) {
                console.error('Failed to check help modal status', error);
            } finally {
                setHasChecked(true);
            }
        };

        checkVisibility();
    }, [storageKey]);

    const showHelp = useCallback(() => {
        setIsVisible(true);
    }, []);

    const closeHelp = useCallback(async () => {
        setIsVisible(false);
        try {
            await AsyncStorage.setItem(storageKey, 'true');
        } catch (error) {
            console.error('Failed to save help modal status', error);
        }
    }, [storageKey]);

    return { isVisible, showHelp, closeHelp, hasChecked };
};
