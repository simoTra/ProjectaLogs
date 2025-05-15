import React from 'react';
import { useApiUrl, useShow } from '@refinedev/core';
import {
  Show,
  NumberField,
  TextField,
} from '@refinedev/antd';
import { Typography } from 'antd';
import { IJob } from '../../interfaces';

const { Title } = Typography;

export const JobShow = () => {
  const { query } = useShow<IJob>();
  const { data, isLoading } = query;
  const API_URL = useApiUrl();


  const record = data?.data;
  const thumbnail = record?.metadata?.thumbnails?.find(t => t.width === 100 && t.height === 100);
  console.log('thumbnail', thumbnail);

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
        value={record?.start_time ? new Date(record.start_time * 1000).toLocaleString() : ''}
      />
      <Title level={5}>Print Duration</Title>
      <TextField
        value={record?.print_duration != null
          ? `${Math.floor(record.print_duration / 3600)}h ${Math.floor((record.print_duration % 3600) / 60)}m`
          : ''}
      />
      <Title level={5}>Total Duration</Title>
      <TextField
        value={record?.total_duration != null
          ? `${Math.floor(record.total_duration / 3600)}h ${Math.floor((record.total_duration % 3600) / 60)}m`
          : ''}
      />
      <Title level={5}>Filament Type</Title>
      <TextField value={record?.metadata?.filament_type} />
      <Title level={5}>Filament Used</Title>
      <TextField value={record?.metadata?.filament_weight_total ? record.metadata.filament_weight_total + 'gr' : ''} />
      <Title level={5}>Project</Title>
      <TextField value={record?.project?.name} />

      {thumbnail && record?.id && (
        <>
          <Title level={5}>Thumbnail</Title>
          <img
            src={`${API_URL}/job/thumbnail/${record.id}?path=${encodeURIComponent(thumbnail.relative_path)}`}
            alt="Job thumbnail"
            style={{ width: 100, height: 100, borderRadius: 4 }}
          />
        </>
      )}
    </Show>
  );
};
