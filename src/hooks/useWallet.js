
import { useState, useEffect } from 'react';

export const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);

    const getEthereumProvider = () => {
        const { ethereum } = window;
        if (ethereum && ethereum.isMetaMask) return ethereum;
        return null;
    };

    const checkIfWalletIsConnected = async () => {
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
    };

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

    useEffect(() => {
        // Wait a bit for extension to inject
        const timeout = setTimeout(checkIfWalletIsConnected, 1000);

        const ethereum = getEthereumProvider();
        if (ethereum) {
            ethereum.on('accountsChanged', (accounts) => {
                setAccount(accounts[0] || null);
            });
        }

        return () => clearTimeout(timeout);
    }, []);

    return { account, connectWallet, error };
};
