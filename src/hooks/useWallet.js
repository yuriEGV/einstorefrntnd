
import { useState, useEffect, useCallback } from 'react';

export const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);

    const getEthereumProvider = useCallback(() => {
        const { ethereum } = window;
        if (ethereum && ethereum.isMetaMask) return ethereum;
        return null;
    }, []);

    const checkIfWalletIsConnected = useCallback(async () => {
        const ethereum = getEthereumProvider();
        if (!ethereum) return;

        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length !== 0) {
                setAccount(accounts[0]);
            }
        } catch (error) {
            console.error("Wallet check error:", error);
        }
    }, [getEthereumProvider]);

    const connectWallet = async () => {
        const ethereum = getEthereumProvider();
        if (!ethereum) {
            window.open("https://metamask.io/download/", "_blank");
            return;
        }

        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            setAccount(accounts[0]);
        } catch (error) {
            console.error("Wallet connection error:", error);
            setError(error.message);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
    };

    useEffect(() => {
        // Wait a bit for extension to inject
        const timeout = setTimeout(checkIfWalletIsConnected, 1000);

        const ethereum = getEthereumProvider();
        if (ethereum) {
            const handleAccounts = (accounts) => {
                setAccount(accounts[0] || null);
            };
            ethereum.on('accountsChanged', handleAccounts);
            return () => {
                clearTimeout(timeout);
                ethereum.removeListener('accountsChanged', handleAccounts);
            };
        }

        return () => clearTimeout(timeout);
    }, [checkIfWalletIsConnected, getEthereumProvider]);

    return { account, connectWallet, disconnectWallet, error };
};
