const getSearchParameters = () => {
  var parameters = window.location.search.substring(1);
  return parameters != null && parameters != ""
    ? transformToArray(parameters)
    : {};
};

const transformToArray = (parameters) => {
  var result = {};
  var array = parameters.split("&");
  for (var i = 0; i < array.length; i++) {
    let tokens = array[i].split("=");
    result[tokens[0]] = tokens[1];
  }
  return result;
};

export { getSearchParameters };
