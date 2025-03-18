import { useShow, useCustom, useApiUrl } from "@refinedev/core";
import { Show, NumberField, TagField, TextField } from "@refinedev/antd";
import { Typography, Button } from "antd";
import { IJob } from "../../interfaces";

const { Title } = Typography;


export const PrinterShow = () => {
    const { query } = useShow();
    const { data, isLoading } = query;
    const API_URL = useApiUrl();


    const record = data?.data;

    const { refetch: refetchJobs, isFetching: isImportingJobs } = useCustom({
        url: `${API_URL}/printer/syncJobs/${record?.id}`,
        method: "get",
        queryOptions: {
            enabled: false,
        },
    });

    const {  refetch: refetchStats, isFetching: isImportingStats } = useCustom({
        url: `${API_URL}/printer/syncStats/${record?.id}`,
        method: "get",
        queryOptions: {
            enabled: false,
        },
    });

    return (
        <Show isLoading={isLoading}>
            <Button type="primary" onClick={() => refetchJobs()} loading={isImportingJobs} style={{ marginBottom: 16 }}>
                Import Jobs
            </Button>
            <Button type="primary" onClick={() => refetchStats()} loading={isImportingStats} style={{ marginBottom: 16 }}>
                Import Printer Stats
            </Button>
            <Title level={5}>Id</Title>
            <NumberField value={record?.id ?? ""} />
            <Title level={5}>Name</Title>
            <TextField value={record?.name} />
            <Title level={5}>Ip Address</Title>
            <TextField value={record?.ipAddress} />
            <Title level={5}>Jobs</Title>
            {isLoading && record?.jobs?.length ? (
                <>Loading...</>
            ) : (
              <>
              {record?.jobs?.length ? (
                record?.jobs?.map((job: IJob) => (
                  <TagField key={job?.id} value={job?.filename} />
                ))
              ) : (
                <></>
              )}
            </>
            )}
        </Show>
    );
};
