import { useContext, useState } from "react";
import NeoKeContext from "context";
import ReservationsTable from "components/tables/ReservationsTable";
import { Button, Modal } from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { t } from "i18next";
import { firestore } from "../../util/firebase";
const { dbError } = firestore;
import SearchByPasscodeForm from "components/forms/SearchByPasscodeForm";

function ReservationsPanel() {
  const { browserAccount } = useContext(NeoKeContext);
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onDelete = () => {
    setTaskInProgress(true);
    firestore.doc.deleteAll(
      "reservation",
      selectedRowKeys,
      () => {
        setSelectedRowKeys([]);
        setTaskInProgress(false);
      },
      (error) => {
        dbError(error);
        setTaskInProgress(false);
      },
    );
  };
  return (
    <>
      {browserAccount.isHotel == "true" ? (
        <>
          <div className="reservations-buttons">
            <Button
              shape="round"
              className="passcode"
              type="primary"
              size="large"
              onClick={() => setModalVisible(true)}
              icon={<SearchOutlined />}
            >
              {t("table.reservations.button.passcode")}
            </Button>
            <Button
              shape="round"
              className="delete"
              type="danger"
              size="large"
              loading={taskInProgress}
              disabled={!selectedRowKeys.length}
              icon={<DeleteOutlined />}
              onClick={onDelete}
            >
              {t("table.reservations.button.delete")}
            </Button>
          </div>
          <Modal
            destroyOnClose={true}
            title={t("table.reservations.button.passcode")}
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <SearchByPasscodeForm
              callback={(id) => {
                if (id) {
                  window.location = `/proof/${id}`;
                } else {
                  Modal.error({
                    width: 500,
                    title: t("notification.passcode_invalid.title"),
                    content: t("notification.passcode_invalid.body"),
                  });
                }
              }}
            />
          </Modal>
        </>
      ) : (
        <></>
      )}
      <div className="panel">
        <ReservationsTable
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          header=""
        />
      </div>
    </>
  );
}

export default ReservationsPanel;
