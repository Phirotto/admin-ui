import { ConnectKitProvider } from "connectkit";
import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";
import { Layout } from "./Layout";
import { WhitelistForm } from "./WhitelistForm";
import { Navigate, RouterProvider, createHashRouter } from "react-router-dom";
import { App as AntdApp } from "antd";
import { CreateVaultForm } from "./CreateVaultForm";

const router = createHashRouter([
  {
    path: "/whitelist",
    element: <WhitelistForm />,
  },
  {
    path: "/vault",
    element: <CreateVaultForm />,
  },
  {
    path: "*",
    element: <Navigate to="/whitelist" />,
  },
]);

function App() {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <AntdApp>
          <Layout>
            <RouterProvider router={router} />
          </Layout>
        </AntdApp>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default App;
