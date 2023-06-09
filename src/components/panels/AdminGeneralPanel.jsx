import { useState } from "react";

import { Button, Divider, Typography, Form, Modal } from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import { ExclamationCircleOutlined } from "@ant-design/icons";

import { firestore } from "util/firebase";
import { t } from "i18next";

function AdminGeneralPanel({ className }) {
  const [pruneDataLoading, setPruneDataLoading] = useState(false);

  const deleteFirestoreCollections = (collections) => {
    if (!collections.length) {
      setPruneDataLoading(false);
    } else {
      const path = collections[0];
      collections.shift();
      firestore.collection.get(path, (querySnapshot) => {
        let elements = querySnapshot.docs.length;
        let remaining = elements;
        querySnapshot.docs.forEach((snapshot) => {
          snapshot.ref.delete();
          remaining = remaining - 1;
          if (!remaining) {
            deleteFirestoreCollections(collections);
          }
        });
        if (!elements) {
          deleteFirestoreCollections(collections);
        }
      });
    }
  };

  const renderServerConfiguration = () => {
    return (
      <>
        <Divider orientation="center" plain="false">
          {t("admin.general.server")}
        </Divider>
        <div>
          <Text strong={true}>{t("admin.general.running")}: </Text>
          <Text>{location.hostname}</Text>
        </div>
      </>
    );
  };

  const renderDatabaseConfiguration = () => {
    return (
      <>
        <Divider orientation="center">{t("admin.general.database")}</Divider>
        <div>
          <Text strong={true}>{t("admin.general.state")}: </Text>
          <Text>{t("admin.general.connected")}</Text>
          <Form
            {...{ layout: "vertical" }}
            style={{ paddingTop: "10px" }}
            name="prune-data"
            onFinish={() => {
              confirm({
                icon: <ExclamationCircleOutlined />,
                content: t("admin.general.click_to_prune"),
                onOk() {
                  setPruneDataLoading(true);
                  deleteFirestoreCollections([
                    "proof",
                    "reservation",
                    "account",
                    "hotel",
                    "mail",
                    "microsoft_request",
                    "aruba_verified_traveller_credential",
                  ]);
                },
                onCancel() {},
              });
            }}
          >
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                shape="round"
                loading={pruneDataLoading}
                block
              >
                {t("admin.general.prune_data")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </>
    );
  };

  return (
    <span className={`panel ${className}`}>
      <h2>{t("admin.general.general")}</h2>
      {renderServerConfiguration()}
      {renderDatabaseConfiguration()}
    </span>
  );
}

export default AdminGeneralPanel;
