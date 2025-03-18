import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { IProject } from "../../interfaces";

export const ClientCreate = () => {
    const { formProps, saveButtonProps } = useForm();

    const { selectProps: projectsSelectProps } = useSelect<IProject>({
        resource: "project",
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
                <Form.Item
                    label="Projects"
                    name={["projects"]}
                    getValueProps={(value: IProject[]) => {
                        return {
                            value: value?.map((project) => project?.id),
                        };
                    }}
                    getValueFromEvent={(selected: string[]) => {
                        return selected?.map((project) => ({ id: project }));
                    }}
                >
                    <Select mode="multiple" {...projectsSelectProps} allowClear />
                </Form.Item>
            </Form>
        </Create>
    );
};
