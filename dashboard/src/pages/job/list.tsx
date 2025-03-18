import { BaseRecord, CrudFilters, HttpError, useSelect } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  BooleanField,
} from "@refinedev/antd";
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
} from "antd";
import { IJob, IJobFilterVariables } from "../../interfaces";

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
        field: "status",
        operator: "eq",
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
            <Table.Column dataIndex="job_id" title="Id" />
            <Table.Column dataIndex="start_time" title="Start Time" render={(value) => new Date(value * 1000).toLocaleString() }/>
            <Table.Column
              title="Printer"
              render={(value: IJob) => `${value.printer?.name}`}
            />
            <Table.Column dataIndex="filename" title="Filename" />
            <Table.Column dataIndex="status" title="Status" />
            <Table.Column
              dataIndex="total_duration"
              title="Total Duration"
              render={(value: number) => {
                const hours = Math.floor(value / 3600);
                const minutes = Math.floor((value % 3600) / 60);
                return `${hours}h ${minutes}m`;
              }}
            />
            <Table.Column
              dataIndex={["metadata", "filament_type"]}
              title="Filament Type"
            />
            <Table.Column
              dataIndex={["metadata", "filament_weight_total"]}
              title="Filament Weight Total"
              render={(value: number) => `${value}gr`}
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
              label: "Completed",
              value: "completed",
            },
            {
              label: "Cancelled",
              value: "cancelled",
            },
            {
              label: "In Progress",
              value: "in_progress",
            },
            {
              label: "Interrupted",
              value: "interrupted",
            },
            {
              label: "Klippy Shutdown",
              value: "klippy_shutdown",
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
