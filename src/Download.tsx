import { Button, ButtonProps } from "antd";
import { useRef } from "react";

interface DownloadProps {
  content: string;
  filename: string;
}

export function Download({
  content,
  filename,
  children = "Download",
  ...props
}: DownloadProps & Omit<ButtonProps, "onClick">) {
  const download = useRef<HTMLAnchorElement>(null);
  const onClick = () => {
    download.current?.click();
  };
  return (
    <>
      <a
        style={{ display: "none" }}
        ref={download}
        download={filename}
        href={"data:text/plain;charset=utf-8," + encodeURIComponent(content)}
      />
      <Button {...props} onClick={onClick}>
        {children}
      </Button>
    </>
  );
}
