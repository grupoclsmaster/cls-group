"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SkeletonMasterclassDetail } from "@/components/SkeletonLoading";

export default function OldWatchPageRedirect() {
  const params = useParams();
  const router = useRouter();
  const idStr = Array.isArray(params?.id) ? params.id[0] : (params?.id || "");

  useEffect(() => {
    if (idStr) {
      router.replace(`/masterclasses/aula/${idStr}`);
    } else {
      router.replace("/masterclasses");
    }
  }, [idStr, router]);

  return <SkeletonMasterclassDetail />;
}
