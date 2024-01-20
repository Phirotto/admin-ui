import { Button, Form, Input, InputNumber, Space, Typography } from "antd";
import BigNumber from "bignumber.js";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Papa from "papaparse";
import { Download } from "./Download";
import { merkleTree } from "./merkleTree";
import { isAddress } from "viem";
import { useDeployWhitelist } from "./hooks/useDeployWhitelist";

type WhitelistEntry = {
  address: string;
  amount: BigNumber.Value;
};

export function WhitelistForm() {
  const [entries, updateEntries] = useState<Array<Partial<WhitelistEntry>>>([]);
  const [isImported, setImported] = useState(false);
  const [calculatedResult, updateCalculatedResult] = useState<ReturnType<
    typeof merkleTree
  > | null>(null);

  const { deploy, address, isSuccess, isSending, isWaiting } =
    useDeployWhitelist();

  const inputFile = useRef<HTMLInputElement>(null);

  const validEntries = useMemo(() => {
    return entries.filter((e) => e.address && e.amount && isAddress(e.address));
  }, [entries]);

  useEffect(() => {
    updateCalculatedResult(null);
  }, [validEntries]);

  const onCalculate = useCallback(() => {
    if (validEntries.length > 0) {
      const merkleResult = merkleTree(
        validEntries as Array<{
          address: string;
          amount: BigNumber.Value;
        }>
      );
      updateCalculatedResult(merkleResult);
    }
  }, [validEntries]);

  const changeAddress = (newAddress: string, index: number) => {
    const newEntires = Array.from(entries);
    newEntires[index].address = newAddress;
    updateEntries(newEntires);
  };

  const changeAmount = (newAmount: string, index: number) => {
    const newEntires = Array.from(entries);
    newEntires[index].amount = newAmount;
    updateEntries(newEntires);
  };

  const addEntry = () => {
    updateEntries([
      ...entries,
      {
        amount: 0,
      },
    ]);
  };

  const onImportButtonClick = () => {
    inputFile.current?.click();
  };

  const deleteEntry = (index: number) => {
    const newEntires = Array.from(entries);
    updateEntries(newEntires.filter((_, i) => i !== index));
  };

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        const content = reader.result.toString();
        const parsed = Papa.parse<WhitelistEntry>(content, { header: true });
        updateEntries(
          parsed.data.map(({ address, amount }) => ({
            address,
            amount,
          }))
        );
        setImported(true);
      }
    };

    if (e.target?.files?.[0]) {
      reader.readAsText(e.target.files[0]);
    }
  }, []);

  return (
    <Form>
      <Space
        direction="vertical"
        className="w-full flex items-center mb-4"
        size="small"
      >
        <Typography.Title level={3}>Create owners whitelist</Typography.Title>
        <input
          type="file"
          id="import"
          style={{ display: "none" }}
          accept=".csv"
          ref={inputFile}
          onChange={onFileChange}
        />
        <Button type="dashed" onClick={onImportButtonClick}>
          Import
        </Button>

        {calculatedResult != null ? (
          <Space>
            {isSending || isWaiting ? (
              <Typography.Text strong>
                Deployment in progress...
              </Typography.Text>
            ) : isSuccess ? (
              <Typography.Text strong>Deployed to {address}</Typography.Text>
            ) : (
              <Button onClick={() => deploy(calculatedResult.root)}>
                Deploy
              </Button>
            )}
            <Download
              content={
                "address,amount,proof\n" +
                calculatedResult.items
                  .map((i) => [i.address, i.amount, i.proof].join(","))
                  .join("\n")
              }
              filename="result.csv"
            >
              Download Proofs
            </Download>
          </Space>
        ) : (
          <Button onClick={onCalculate} disabled={validEntries.length === 0}>
            Calculate Merkle tree
          </Button>
        )}
      </Space>
      {entries.map(({ address, amount }, i) => (
        <Form.Item key={i}>
          <Space>
            <Input
              value={address}
              className="min-w-[450px]"
              onChange={(e) => changeAddress(e.target.value, i)}
              placeholder="Eth Address"
              status={address && !isAddress(address) ? "error" : undefined}
              disabled={isImported}
            />
            <InputNumber
              value={BigNumber(amount || 0).toString()}
              addonAfter="$"
              onChange={(e) => changeAmount(e || "0", i)}
              min="0"
              placeholder="Amount"
              status={address && !isAddress(address) ? "error" : undefined}
              disabled={isImported}
            />
            {!isImported && <Button onClick={() => deleteEntry(i)}>-</Button>}
          </Space>
        </Form.Item>
      ))}
      {!isImported && <Button onClick={addEntry}>+</Button>}
    </Form>
  );
}
