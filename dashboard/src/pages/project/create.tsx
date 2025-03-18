import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { IClient } from "../../interfaces";

export const ProjectCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  const { selectProps: clientSelectProps } = useSelect<IClient>({
    resource: "client",
    optionLabel: "name",
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
        <Form.Item label="Description" name={["description"]}>
          <Input />
        </Form.Item>
        <Form.Item label="Client" name={["client", "id"]}>
          <Select {...clientSelectProps} allowClear />
        </Form.Item>
      </Form>
    </Create>
  );
};
