import { Button, Form, Input, InputNumber, Space, Typography } from "antd";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { useCreateVault } from "./hooks/useCreateVault";

type VaultParams = {
  name: string;
  admin: string;
  whitelist: string;
  requestedAmount: BigNumber.Value;
};

export function CreateVaultForm() {
  const [params] = useSearchParams();
  const { address, isConnected } = useAccount();
  const { create, isSending, isWaiting, isSuccess } = useCreateVault();

  const [vault, setVault] = useState<Partial<VaultParams>>({
    whitelist: params.get("whitelistAddr") || undefined,
    admin: address,
  });

  return (
    <Form layout="vertical">
      <Space
        direction="vertical"
        className="w-full flex items-center mb-4"
        size="small"
      >
        <Typography.Title level={3}>Create vault</Typography.Title>
        <Form.Item
          label={<Typography.Text type="secondary">Vault name</Typography.Text>}
        >
          <Input
            value={vault.name}
            onChange={(e) => setVault({ ...vault, name: e.target.value })}
            placeholder="Name"
          />
        </Form.Item>
        <Form.Item
          label={
            <Typography.Text type="secondary">Requested amount</Typography.Text>
          }
        >
          <InputNumber
            value={vault.requestedAmount?.toString()}
            onChange={(e) =>
              setVault({ ...vault, requestedAmount: e || undefined })
            }
            min="0"
            addonAfter="$"
          />
        </Form.Item>
        <Form.Item
          label={<Typography.Text type="secondary">Admin</Typography.Text>}
          status={vault.admin && !isAddress(vault.admin) ? "error" : undefined}
        >
          <Input
            value={vault.admin}
            onChange={(e) => setVault({ ...vault, admin: e.target.value })}
            placeholder="Eth Address"
            className="min-w-[450px]"
          />
        </Form.Item>
        <Form.Item
          label={<Typography.Text type="secondary">Whitelist</Typography.Text>}
          status={
            vault.whitelist && !isAddress(vault.whitelist) ? "error" : undefined
          }
        >
          <Input
            value={vault.whitelist}
            onChange={(e) => setVault({ ...vault, whitelist: e.target.value })}
            placeholder="Eth Address"
            className="min-w-[450px]"
          />
        </Form.Item>
        {isSending || isWaiting ? (
          <Typography.Text strong>Deployment in progress</Typography.Text>
        ) : isSuccess ? (
          <Typography.Text strong>Vault deployed</Typography.Text>
        ) : (
          <Button
            disabled={
              !vault.name ||
              !vault.requestedAmount ||
              !vault.admin ||
              !vault.whitelist ||
              !isAddress(vault.admin) ||
              !isAddress(vault.whitelist) ||
              !isConnected
            }
            onClick={() =>
              create(
                vault.name!,
                BigNumber(vault.requestedAmount!)
                  .multipliedBy(BigNumber(10).pow(18))
                  .toFixed(),
                vault.admin!,
                vault.whitelist!
              )
            }
          >
            Create Vault
          </Button>
        )}
      </Space>
    </Form>
  );
}
