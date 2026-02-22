import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
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

    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setError(null);
    }, []);

    useEffect(() => {
        // We disabled auto-polling on mount to prevent cross-user session leaks.
        // The wallet should only connect when the user explicitly clicks "Connect".
        // const timeout = setTimeout(checkIfWalletIsConnected, 1000);

        const ethereum = getEthereumProvider();

        if (ethereum) {
            const handleAccounts = (accounts) => {
                setAccount(accounts[0] || null);
            };
            ethereum.on('accountsChanged', handleAccounts);
            return () => {
                // clearTimeout(timeout);
                ethereum.removeListener('accountsChanged', handleAccounts);
            };
        }

        // return () => clearTimeout(timeout);
    }, [getEthereumProvider]);

    return (
        <WalletContext.Provider value={{ account, connectWallet, disconnectWallet, error }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWalletContext = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWalletContext must be used within a WalletProvider');
    }
    return context;
};
