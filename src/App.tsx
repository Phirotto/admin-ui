import { ConnectKitProvider } from "connectkit";
import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";
import { Layout } from "./Layout";
import { WhitelistForm } from "./WhitelistForm";
import { Navigate, RouterProvider, createHashRouter } from "react-router-dom";

const router = createHashRouter([
  {
    path: "/whitelist",
    element: <WhitelistForm />,
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
        <Layout>
          <RouterProvider router={router} />
        </Layout>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default App;
