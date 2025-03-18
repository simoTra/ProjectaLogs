import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { IClient } from "../../interfaces";

export const ProjectEdit = () => {
    const { formProps, saveButtonProps, query } = useForm();

    const projectData = query?.data?.data;

/*     const { selectProps: jobsSelectProps } = useSelect({
        resource: "job",
        defaultValue: projectData?.jobs,
    }); */

    const { selectProps: clientSelectProps } = useSelect<IClient>({
        resource: "client",
        optionLabel: "name",
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
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
                <Form.Item
                    label="Description"
                    name={["description"]}
                >
                    <Input />
                </Form.Item>
                {/* <Form.Item
                    label="Jobs"
                    name={"jobs"}
                >
                    <Select mode="multiple" {...jobsSelectProps} />
                </Form.Item> */}
                <Form.Item
                    label="Client"
                    name={["client", "id"]}
                >
                    <Select {...clientSelectProps} allowClear />
                </Form.Item>
            </Form>
        </Edit>
    );
};
