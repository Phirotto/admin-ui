import { PropsWithChildren } from "react";
import { Layout as AntdLayout, Row } from "antd";
import { ConnectKitButton } from "connectkit";

const { Content, Header } = AntdLayout;

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="text-center h-full">
      <AntdLayout>
        <Header className="sticky top-0 z-10">
          <Row justify="end" className="mt-2">
            <ConnectKitButton />
          </Row>
        </Header>
        <Content className="min-h-screen mt-6">{children}</Content>
      </AntdLayout>
    </div>
  );
}
