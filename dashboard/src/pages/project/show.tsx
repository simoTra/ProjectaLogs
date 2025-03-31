import { useShow } from '@refinedev/core';
import { Show, NumberField, TagField, TextField } from '@refinedev/antd';
import { Typography } from 'antd';
import { IJob, IProject } from '../../interfaces';

const { Title } = Typography;

export const ProjectShow = () => {
  const { query } = useShow<IProject>();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Id</Title>
      <NumberField value={record?.id ?? ''} />
      <Title level={5}>Name</Title>
      <TextField value={record?.name} />
      <Title level={5}>Description</Title>
      <TextField value={record?.description} />
      <Title level={5}>Client</Title>
      <TextField value={record?.client?.name} />
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
