import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import BigNumber from "bignumber.js";

import { encodeAbiParameters, parseAbiParameters } from "viem";

type Input = Array<{ address: string; amount: BigNumber.Value }>;
type Output = {
  items: Array<{ address: string; amount: string; proof: string }>;
  root: string;
};

export function merkleTree(data: Input): Output {
  const decimalsKoef = BigNumber(10).pow(6);
  const dataWithDecimals = data.map(({ address, amount }) => ({
    address,
    amount: BigNumber(amount).multipliedBy(decimalsKoef),
  }));

  const tree = StandardMerkleTree.of(
    dataWithDecimals.map((d) => [d.address, d.amount.toString()]),
    ["address", "uint256"]
  );

  const result: Output["items"] = [];

  for (const [i, v] of tree.entries()) {
    const proof = encodeAbiParameters(parseAbiParameters("bytes32[]"), [
      tree.getProof(i) as readonly `0x${string}`[],
    ]);

    result.push({
      address: v[0],
      amount: v[1],
      proof,
    });
  }

  return { items: result, root: tree.root };
}
