import { useContext } from "react";
import NeoKeContext from "context";

import SearchPanel from "components/panels/SearchPanel";
import { Row } from "antd";

const Search = () => {
  const { account } = useContext(NeoKeContext);
  if (account?.email) {
    return (
      <div className="container search-container ant-col-24">
        <Row justify="space-evenly" align="top">
          <SearchPanel />
        </Row>
      </div>
    );
  } else {
    return null;
  }
};

export default Search;
