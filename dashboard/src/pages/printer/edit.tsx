import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { IJob } from "../../interfaces";

export const PrinterEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const printerData = query?.data?.data;

  const { selectProps: jobsSelectProps } = useSelect<IJob>({
    resource: "job",
    optionLabel: "filename",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Id"
          name={["id"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input readOnly disabled />
        </Form.Item>
        <Form.Item
          label="Name"
          name={["name"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Ip Address" name={["ipAddress"]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Jobs"
          name={"jobs"}
          getValueProps={(value: IJob[]) => {
            return {
              value: value?.map((job) => job?.id),
            };
          }}
          getValueFromEvent={(selected: string[]) => {
            return selected?.map((job) => ({ id: job }));
          }}
        >
          <Select mode="multiple" {...jobsSelectProps} allowClear />
        </Form.Item>
      </Form>
    </Edit>
  );
};
