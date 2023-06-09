import { Space, Table, Button } from "antd";
import { t } from "i18next";
import { useContext } from "react";
import NeoKeContext from "context";

function ReservationsTable({ selectedRowKeys, setSelectedRowKeys }) {
  const { hotels, reservations, browserAccount } = useContext(NeoKeContext);

  const columns = [
    {
      key: "id",
      render: (reservation) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => {
              window.location = `${
                browserAccount.isHotel == "true" ? "/proof" : "/reservation"
              }/${reservation.id}`;
            }}
          >
            {`${reservation.id.slice(0, 5)}...`}
          </Button>
        </Space>
      ),
      title: t("table.reservations.column.reservation_number"),
      ellipsis: true,
    },
    {
      dataIndex: "full_name",
      render: (full_name) => (
        <Space size="middle">{`${full_name.last_name}, ${full_name.first_name}`}</Space>
      ),
      title: t("table.reservations.column.full_name"),
      ellipsis: true,
    },
    {
      dataIndex: "hotel_id",
      key: "hotel_id",
      render: (hotel_id) => (
        <Space size="middle">{hotels.find((h) => h.id == hotel_id).name}</Space>
      ),
      title: t("table.reservations.column.hotel"),
      responsive: ["md"],
    },
    {
      dataIndex: "dates",
      render: (dates) => (
        <Space size="middle">{`${dates.check_in_date} - ${dates.check_out_date}`}</Space>
      ),
      title: t("table.reservations.column.dates"),
      ellipsis: true,
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <>
      <Table
        rowSelection={browserAccount.isHotel == "true" ? rowSelection : null}
        dataSource={reservations.sort((a, b) =>
          a.check_in_date.localeCompare(b.check_in_date),
        )}
        columns={columns}
        bordered={false}
        pagination={{ position: ["bottomCenter"] }}
      />
    </>
  );
}

export default ReservationsTable;
