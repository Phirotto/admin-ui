import {
  Connector,
  useAccount,
  useMutation,
  useWaitForTransaction,
} from "wagmi";
import { App } from "antd";
import { useEffect } from "react";
import { optimismSepolia } from "viem/chains";
import { WHITELIST_ABI, WHITELIST_BYTECODE } from "../constants/whitelist";

async function deploy(connector: Connector, root: string) {
  const viem = await connector.getWalletClient();

  return await viem.deployContract({
    abi: WHITELIST_ABI,
    bytecode: WHITELIST_BYTECODE as `0x${string}`,
    chain: optimismSepolia,
    args: [root],
  });
}

type UseDeployWhitelistResult = {
  isSending: boolean;
  isWaiting: boolean;
  error?: unknown;
  isSuccess: boolean;
  address?: string;
  deploy: (root: string) => void;
};

export function useDeployWhitelist(): UseDeployWhitelistResult {
  const { connector } = useAccount();
  const { notification } = App.useApp();

  const { mutate, data, isLoading, error } = useMutation<
    `0x${string}`,
    unknown,
    string
  >({
    mutationKey: ["DEPLOY_WHITELIST"],
    mutationFn: (root) => deploy(connector!, root),
  });

  const {
    data: txData,
    error: txError,
    isLoading: isTxLoading,
    isSuccess,
  } = useWaitForTransaction({ hash: data });

  useEffect(() => {
    if (error) {
      notification.error({
        message: "Error rised during whitelist deployment",
      });
    }
  }, [error]);
  useEffect(() => {
    if (txError) {
      notification.error({
        message: "Error raised during tx awating",
        description: `${txError.name}: ${txError.message}`,
      });
    }
  }, [txError]);
  useEffect(() => {
    if (txData?.contractAddress) {
      notification.success({
        message: "Whitelist contract succesfully deployed",
        description: `Address: ${txData.contractAddress}`,
      });
    }
  }, [txData]);

  return {
    isSending: isLoading,
    isWaiting: isTxLoading,
    isSuccess,
    deploy: mutate,
    error: error || txError,
    address: txData?.contractAddress || undefined,
  };
}
