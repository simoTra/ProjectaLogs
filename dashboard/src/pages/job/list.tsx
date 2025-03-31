import { BaseRecord, CrudFilters, HttpError } from '@refinedev/core';
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
} from '@refinedev/antd';
import {
  Table,
  Space,
  Col,
  Row,
  Card,
  FormProps,
  Button,
  Form,
  Select,
  Tag,
} from 'antd';
import { IJob, IJobFilterVariables } from '../../interfaces';

export const JobList = () => {
  const { tableProps, searchFormProps } = useTable<
    IJob,
    HttpError,
    IJobFilterVariables
  >({
    syncWithLocation: true,
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { status } = params;

      filters.push({
        field: 'status',
        operator: 'eq',
        value: status,
      });

      return filters;
    },
  });

  return (
    <Row gutter={[16, 16]}>
      <Col lg={6} xs={24}>
        <Card title="Filters">
          <Filter formProps={searchFormProps} />
        </Card>
      </Col>
      <Col lg={18} xs={24}>
        <List>
          <Table {...tableProps} rowKey="id">
            <Table.Column dataIndex="id" title="Id" />
            <Table.Column
              title="Printer"
              render={(value: IJob) => `${value.printer?.name}`}
            />
            <Table.Column dataIndex="filename" title="Filename" />
            <Table.Column dataIndex="status" title="Status" />
            <Table.Column
              dataIndex={['project', 'name']}
              title="Project"
            />
            <Table.Column
              title="Actions"
              dataIndex="actions"
              render={(_, record: BaseRecord) => (
                <Space>
                  <EditButton hideText size="small" recordItemId={record.id} />
                  <ShowButton hideText size="small" recordItemId={record.id} />
                  <DeleteButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                  />
                </Space>
              )}
            />
          </Table>
        </List>
      </Col>
    </Row>
  );
};

const Filter: React.FC<{ formProps: FormProps }> = ({ formProps }) => {
  /*  const { selectProps: jobSelectProps } = useSelect<IJob>({
      resource: "jobs",
    }); */

  return (
    <Form layout="vertical" {...formProps}>
      <Form.Item label="Job Status" name="status">
        <Select
          allowClear
          options={[
            {
              label: 'Completed',
              value: 'completed',
            },
            {
              label: 'Cancelled',
              value: 'cancelled',
            },
            {
              label: 'In Progress',
              value: 'in_progress',
            },
            {
              label: 'Interrupted',
              value: 'interrupted',
            },
            {
              label: 'Klippy Shutdown',
              value: 'klippy_shutdown',
            },
          ]}
          placeholder="Status"
        />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Filter
        </Button>
      </Form.Item>
    </Form>
  );
};
