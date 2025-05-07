import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { useApiUrl } from "@refinedev/core";
import { Form, Input, Select, notification, Spin } from "antd";
import axios from "axios";
import { IJob } from "../../interfaces";

export const PrinterEdit = () => {
  const { formProps, saveButtonProps, onFinish, query } = useForm();

  const apiUrl = useApiUrl();
  const printerData = query?.data?.data;
  const isLoading = query?.isLoading;

  const [jobs, setJobs] = React.useState<number[]>([]);

  const { selectProps: jobsSelectProps } = useSelect<IJob>({
    resource: "job",
    optionLabel: "filename",
    optionValue: "id",
  });

  React.useEffect(() => {
    if (printerData?.jobs) {
      setJobs(printerData.jobs.map((j: IJob) => j.id));
    }
  }, [printerData]);

  const handleSubmit = async (values: any) => {
    try {
      await onFinish({
        ...values,
        jobs: undefined,
      });

      if (jobs.length) {
        await axios.patch(`${apiUrl}/printer/${values.id}/jobs`, jobs);
      }
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error?.response?.data?.message || "An error occurred",
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Id"
          name={["id"]}
          rules={[{ required: true }]}
        >
          <Input readOnly disabled />
        </Form.Item>

        <Form.Item
          label="Name"
          name={["name"]}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Ip Address" name={["ipAddress"]}>
          <Input />
        </Form.Item>

        <Form.Item label="Jobs">
          <Select
            mode="multiple"
            options={jobsSelectProps.options}
            value={jobs}
            onChange={(values: number[]) => setJobs(values)}
            loading={jobsSelectProps.loading}
            allowClear
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
