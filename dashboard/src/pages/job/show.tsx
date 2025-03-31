import React from 'react';
import { useShow, useOne } from '@refinedev/core';
import {
  Show,
  NumberField,
  TagField,
  TextField,
  BooleanField,
} from '@refinedev/antd';
import { Typography } from 'antd';
import { IJob } from '../../interfaces';

const { Title } = Typography;

export const JobShow = () => {
  const { query } = useShow<IJob>();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Id</Title>
      <NumberField value={record?.id ?? ''} />
      <Title level={5}>User</Title>
      <TextField value={record?.user} />
      <Title level={5}>Filename</Title>
      <TextField value={record?.filename} />
      <Title level={5}>Start Time</Title>
      <TextField
        value={new Date(record?.start_time! * 1000).toLocaleString()}
      />
      <Title level={5}>Print Duration</Title>
      <TextField
        value={`${Math.floor(record?.print_duration! / 3600)}h ${Math.floor((record?.print_duration! % 3600) / 60)}m`}
      />
      <Title level={5}>Total Duration</Title>
      <TextField
        value={`${Math.floor(record?.total_duration! / 3600)}h ${Math.floor((record?.total_duration! % 3600) / 60)}m`}
      />
      <Title level={5}>Filament Type</Title>
      <TextField value={record?.metadata?.filament_type} />
      <Title level={5}>Filament Used</Title>
      <TextField value={record?.metadata?.filament_weight_total!+'gr'} />
      <Title level={5}>Project</Title>
      <TextField value={record?.project?.name} />
    </Show>
  );
};
