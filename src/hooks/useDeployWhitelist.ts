import {
  Connector,
  useAccount,
  useMutation,
  useWaitForTransaction,
} from "wagmi";
import whitelistArtifact from "../../abi/whitelist.json";
import { App } from "antd";
import { useEffect } from "react";
import { optimismSepolia } from "viem/chains";

async function deploy(connector: Connector, root: string) {
  const viem = await connector.getWalletClient();

  return await viem.deployContract({
    abi: whitelistArtifact.abi,
    bytecode: whitelistArtifact.bytecode as `0x${string}`,
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

    if (txError) {
      notification.error({
        message: "Error raised during tx awating",
        description: `${txError.name}: ${txError.message}`,
      });
    }

    if (txData?.contractAddress) {
      notification.success({
        message: "Whitelist contract succesfully deployed",
        description: `Address: ${txData.contractAddress}`,
      });
    }
  }, [error, txError]);

  return {
    isSending: isLoading,
    isWaiting: isTxLoading,
    isSuccess,
    deploy: mutate,
    error: error || txError,
    address: txData?.contractAddress || undefined,
  };
}
