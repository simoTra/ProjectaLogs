import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { IJob, IPrinter } from "../../interfaces";

export const PrinterCreate = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const { selectProps: jobsSelectProps } = useSelect<IJob>({
    resource: "job",
    optionLabel: "filename",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
    </Create>
  );
};
