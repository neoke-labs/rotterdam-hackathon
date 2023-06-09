exports.r = (response, message, payload, status = 200) => {
  response
    .status(status)
    .json({
      result: { message, ...payload },
    })
    .end();
};
