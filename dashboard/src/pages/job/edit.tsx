import React from 'react';
import { Edit, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select, Checkbox } from 'antd';
import { IProject } from '../../interfaces';

export const JobEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const jobData = query?.data?.data;

  const { selectProps: projectSelectProps } = useSelect<IProject>({
    resource: 'project',
    optionLabel: 'name',
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Id"
          name={['id']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input readOnly disabled />
        </Form.Item>
        <Form.Item label="Project" name={['project', 'id']}>
          <Select {...projectSelectProps} allowClear />
        </Form.Item>
      </Form>
    </Edit>
  );
};
