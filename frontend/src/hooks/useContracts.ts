import { useReadContract, useWriteContract } from 'wagmi';
import type { Abi } from 'viem';
import { CONTRACTS } from '@/config/contracts';
import RebaseTokenABI from '@/contracts/RebaseToken.json';
import VaultABI from '@/contracts/Vault.json';
import PoolABI from '@/contracts/RebaseTokenPool.json';

// Vault Hooks
export const useVaultBalance = (address?: string) => {
    return useReadContract({
        address: CONTRACTS.VAULT as `0x${string}`,
        abi: VaultABI as unknown as Abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
};

export const useVaultDeposit = () => {
    return useWriteContract();
};

export const useVaultWithdraw = () => {
    return useWriteContract();
};

// Rebase Token Hooks
export const useRebaseTokenBalance = (address?: string) => {
    return useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: RebaseTokenABI as unknown as Abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
};

export const useRebaseTokenTotalSupply = () => {
    return useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: RebaseTokenABI as unknown as Abi,
        functionName: 'totalSupply',
    });
};

export const useRebaseTokenTransfer = () => {
    return useWriteContract();
};

// Pool Hooks
export const usePoolBalance = (address?: string) => {
    return useReadContract({
        address: CONTRACTS.POOL as `0x${string}`,
        abi: (PoolABI as { abi: Abi }).abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
};

export const usePoolDeposit = () => {
    return useWriteContract();
};

export const usePoolWithdraw = () => {
    return useWriteContract();
}; 