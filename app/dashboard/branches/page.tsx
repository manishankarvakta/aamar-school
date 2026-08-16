import { getBranchesWithStats } from "@/app/actions/branches";
import { BranchesClient } from "./_components/branches-client";

export default async function BranchesPage() {
  const result = await getBranchesWithStats();
  const branches = result.success ? result.data : [];

  return <BranchesClient initialBranches={branches} />;
}