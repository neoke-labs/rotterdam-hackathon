import SearchForm from "components/forms/SearchForm";
import { t } from "i18next";

function SearchPanel() {
  return (
    <div className="panel ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24">
      <h3>{t("section.search.title")}</h3>
      <SearchForm />
    </div>
  );
}

export default SearchPanel;
