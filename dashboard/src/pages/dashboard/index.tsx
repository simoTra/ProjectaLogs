import { useApiUrl, useCustom } from "@refinedev/core";

export const Dashboard: React.FC = () => {
  const API_URL = useApiUrl();

  /* const { data: topClientsData } = useCustom<
    { name: string; projects: number }[]
  >({
    url: `${API_URL}/client/stats/top`,
    method: "get",
  });

  const { data: topProjectsData } = useCustom<{ name: string; jobs: number }[]>(
    {
      url: `${API_URL}/project/stats/top`,
      method: "get",
    }
  );

  const { data: jobsPerMonthData } = useCustom<
    { month: string; jobCount: number }[]
  >({
    url: `${API_URL}/job/stats/job-per-month`,
    method: "get",
  }); */

  return (
    <div></div>
  );
};
