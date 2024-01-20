import { useContractWrite, useWaitForTransaction } from "wagmi";
import factory from "../../abi/factory.json";
import { App } from "antd";
import { toHex } from "viem";
import { useEffect } from "react";

type UseCreateVaultResult = {
  isSending: boolean;
  isWaiting: boolean;
  error?: unknown;
  isSuccess: boolean;
  address?: string;
  create: (
    name: string,
    amount: string,
    admin: string,
    whitelist: string
  ) => void;
};

export function useCreateVault(): UseCreateVaultResult {
  const { notification } = App.useApp();

  const { data, isLoading, error, write } = useContractWrite({
    abi: factory.abi,
    address: import.meta.env.VITE_FACTORY_ADDRESS,
    functionName: "deployVault",
  });
  const {
    isLoading: isWaiting,
    error: waitingError,
    isSuccess,
    data: txData,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (error) {
      notification.error({
        message: "Error rised during vault deployment",
      });
    }
  }, [error]);
  useEffect(() => {
    if (waitingError) {
      notification.error({
        message: "Error raised during tx awating",
        description: `${waitingError.name}: ${waitingError.message}`,
      });
    }
  }, [waitingError]);
  useEffect(() => {
    if (txData?.logs[0].address) {
      notification.success({
        message: "Vault contract succesfully deployed",
        description: `Address: ${txData.logs[0].address}`,
      });
    }
  }, [txData]);

  return {
    isSending: isLoading,
    isWaiting,
    error: error || waitingError,
    isSuccess,
    address: txData?.logs[0].address as `0x${string}`,
    create: (name, amount, admin, whitelist) =>
      write({
        args: [name, whitelist, admin, toHex(amount)],
      }),
  };
}
