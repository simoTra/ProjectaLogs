import { BaseRecord, useMany } from "@refinedev/core";
import {
    useTable,
    List,
    EditButton,
    ShowButton,
    DeleteButton,
    TagField,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import { IJob } from "../../interfaces";

export const PrinterList = () => {
    const { tableProps } = useTable({
        syncWithLocation: true,
    });



    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="Id" />
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column dataIndex="ipAddress" title="Ip Address" />
                 <Table.Column
                    dataIndex="jobs"
                    title="Jobs"
                    render={(value: IJob[]) =>
                    (
                            <>{value.length}
                               {/*  {value?.map((item, index) => (
                                    <TagField key={index} value={item.filename?.substring(0, 5) + '...'} />
                                ))} */}
                            </>
                        )
                    }
                /> 
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <EditButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                            <ShowButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
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
    );
};
