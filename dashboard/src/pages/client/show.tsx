import { useShow } from "@refinedev/core";
import { Show, NumberField, TagField, TextField } from "@refinedev/antd";
import { List, Typography } from "antd";
import { IClient, IProject } from "../../interfaces";

const { Title } = Typography;

export const ClientShow = () => {
  const { query } = useShow<IClient>();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Id</Title>
      <NumberField value={record?.id ?? ""} />
      <Title level={5}>Name</Title>
      <TextField value={record?.name} />
      <Title level={5}>Projects</Title>
      {isLoading && record?.projects?.length ? (
        <>Loading...</>
      ) : (
        <>
          {record?.projects?.length ? (
            record?.projects?.map((project: IProject) => (
              <TagField key={project?.name} value={project?.name} />
            ))
          ) : (
            <></>
          )}
        </>
      )}
    </Show>
  );
};
