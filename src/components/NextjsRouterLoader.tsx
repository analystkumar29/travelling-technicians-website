import { useEffect } from "react";
import { useRouter } from "next/router";

export default function NextjsRouterLoader() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      document.body.classList.add("content-loaded");
    }
  }, [router.isReady]);

  return null;
}
